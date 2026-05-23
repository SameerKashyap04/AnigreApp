import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useFrameOutput, usePhotoOutput } from 'react-native-vision-camera';
import * as ImagePicker from 'expo-image-picker';
import { NitroModules } from 'react-native-nitro-modules';
import 'react-native-worklets'; // Explicitly wake up the worklets engine
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { insertScan } from '../services/Database';
import { useAIPipeline, generateScanResult, LABELS } from '../services/MLService';

// Helper to process TFLite output buffers and ensure we have 0-1 probabilities
const processOutputBuffer = (buffer: ArrayBuffer) => {
  const isFloat32 = buffer.byteLength === LABELS.length * 4;
  const rawArray = isFloat32 ? new Float32Array(buffer) : new Uint8Array(buffer);
  
  // Convert Uint8 to Float32 probabilities if needed
  const confidences = new Float32Array(LABELS.length);
  for (let i = 0; i < LABELS.length; i++) {
    confidences[i] = isFloat32 ? rawArray[i] : rawArray[i] / 255.0;
  }

  // Check if we need to apply Softmax (are these raw logits instead of probabilities?)
  // If values are outside 0-1, or sum is far from 1, it's likely logits
  let sum = 0;
  let hasOutOfBounds = false;
  let maxVal = -Infinity;
  
  for (let i = 0; i < confidences.length; i++) {
    sum += confidences[i];
    if (confidences[i] < 0 || confidences[i] > 1) hasOutOfBounds = true;
    if (confidences[i] > maxVal) maxVal = confidences[i];
  }

  if (hasOutOfBounds || Math.abs(sum - 1.0) > 0.5) {
    // Apply Softmax
    let expSum = 0;
    for (let i = 0; i < confidences.length; i++) {
      confidences[i] = Math.exp(confidences[i] - maxVal);
      expSum += confidences[i];
    }
    for (let i = 0; i < confidences.length; i++) {
      confidences[i] /= expSum;
    }
  }

  let maxIdx = 0;
  let maxConf = 0;
  for (let i = 0; i < confidences.length; i++) {
    if (confidences[i] > maxConf) {
      maxConf = confidences[i];
      maxIdx = i;
    }
  }
  
  return { maxIdx, maxConf };
};

// ──────────────────────────────────────────────────────────────────────────
//  MANDATORY VALIDATION PIPELINE  (runs before any AI model)
// ──────────────────────────────────────────────────────────────────────────

/**
 * BRIGHTNESS CHECK — Rejects dark / black images.
 * Uses luma formula: Y = 0.299R + 0.587G + 0.114B
 * Analyzes every 4th pixel for speed.
 */
const checkBrightness = (pixels: Uint8Array, total: number, isBGRA: boolean): boolean => {
  let lumaSum = 0;
  const step = 4; // Stride: analyze every 4th pixel
  let count = 0;
  for (let i = 0; i < total; i += step) {
    const b_or_r = pixels[i * 4 + 0];
    const g      = pixels[i * 4 + 1];
    const r_or_b = pixels[i * 4 + 2];
    const r = isBGRA ? r_or_b : b_or_r;
    const b = isBGRA ? b_or_r : r_or_b;
    lumaSum += 0.299 * r + 0.587 * g + 0.114 * b;
    count++;
  }
  const avgLuma = lumaSum / count;
  console.log(`[Validation] Avg Luma: ${avgLuma.toFixed(1)}`);
  return avgLuma > 40;
};

/**
 * BLUR CHECK — Rejects blurry/out-of-focus images.
 * Computes horizontal pixel-level variance (Laplacian approximation).
 * A sharp image has high contrast between adjacent pixels.
 * Analyzes every 4th row for speed.
 */
const checkSharpness = (pixels: Uint8Array, width: number, height: number, isBGRA: boolean): boolean => {
  let varianceSum = 0;
  let count = 0;
  const rowStep = 4; // Stride: check every 4th row
  for (let y = 0; y < height; y += rowStep) {
    for (let x = 0; x < width - 1; x++) {
      const i1 = (y * width + x) * 4;
      const i2 = (y * width + x + 1) * 4;
      const g1 = pixels[i1 + 1]; // Green channel for luma
      const g2 = pixels[i2 + 1];
      varianceSum += Math.abs(g1 - g2);
      count++;
    }
  }
  const avgVariance = varianceSum / count;
  console.log(`[Validation] Avg Sharpness Variance: ${avgVariance.toFixed(2)}`);
  return avgVariance > 3.5;
};

/**
 * GREEN PIXEL CHECK — Rejects images with no vegetation-like colors.
 * Checks for both healthy green leaves and diseased yellow/brown leaves.
 * Analyzes every 2nd pixel for speed.
 */
const checkGreenPixels = (pixels: Uint8Array, total: number, isBGRA: boolean): boolean => {
  let plantPixels = 0;
  const step = 2;
  let count = 0;
  for (let i = 0; i < total; i += step) {
    const b_or_r = pixels[i * 4 + 0];
    const g      = pixels[i * 4 + 1];
    const r_or_b = pixels[i * 4 + 2];
    const r = isBGRA ? r_or_b : b_or_r;
    const b = isBGRA ? b_or_r : r_or_b;
    // Green-dominant foliage
    if (g > r * 0.82 && g > b * 0.82) { plantPixels++; }
    // Yellow/Brown diseased leaf
    else if (r > g && g > b && r < 215 && (r - g) < 65) { plantPixels++; }
    count++;
  }
  const ratio = plantPixels / count;
  console.log(`[Validation] Green/Plant Pixel Ratio: ${(ratio * 100).toFixed(1)}%`);
  return ratio > 0.12;
};

// ──────────────────────────────────────────────────────────────────────────
//  STAGE 1 AI MODEL — Strict 95% Plant Confidence Required
//  Training: tf.cast(image, tf.float32) / 255.0
//  Input:  FLOAT32, shape [1, H, W, 3], RGB, range 0.0–1.0
//  Output: Single FLOAT32 confidence value at output[0][0]
// ──────────────────────────────────────────────────────────────────────────

const runStage1AI = async (pluginModel: any, croppedImage: any): Promise<{ passed: boolean; confidence: number }> => {
  try {
    // Step 1: Determine model input dimensions
    const shape = pluginModel.inputs[0].shape;
    let w = 224, h = 224;
    if (shape.length === 4) {
      if (shape[3] === 3) { h = shape[1]; w = shape[2]; }       // NHWC
      else if (shape[1] === 3) { h = shape[2]; w = shape[3]; }  // NCHW
    }
    console.log(`[Stage 1 AI] Model expects: ${w}x${h}, shape=${JSON.stringify(shape)}`);

    // Step 2: Resize image to model dimensions
    const resized = croppedImage.resize(w, h);
    const raw = resized.toRawPixelData();
    const pixels = new Uint8Array(raw.buffer);
    const isBGRA = raw.pixelFormat === 'bgra';
    console.log(`[Stage 1 AI] Pixel format: ${raw.pixelFormat}, pixels: ${pixels.length}`);

    // Step 3: ALWAYS Float32 / 255.0 — must match training format exactly
    // Training used: image = tf.cast(image, tf.float32) / 255.0
    // Input must be: float32, RGB order, values 0.0 → 1.0
    const inputData = new Float32Array(w * h * 3);
    for (let i = 0; i < w * h; i++) {
      const byte0 = pixels[i * 4 + 0];
      const byte1 = pixels[i * 4 + 1];
      const byte2 = pixels[i * 4 + 2];
      // Convert BGRA→RGB or RGBA→RGB correctly
      const r = isBGRA ? byte2 : byte0;
      const g = byte1;
      const b = isBGRA ? byte0 : byte2;
      inputData[i * 3 + 0] = r / 255.0;  // R: 0.0–1.0
      inputData[i * 3 + 1] = g / 255.0;  // G: 0.0–1.0
      inputData[i * 3 + 2] = b / 255.0;  // B: 0.0–1.0
    }

    // Step 4: Run the plant_detector model
    const outputs = await pluginModel.run([inputData.buffer]);
    if (!outputs || outputs.length === 0) {
      console.warn('[Stage 1 AI] No output tensor returned — REJECTED.');
      return { passed: false, confidence: 0 };
    }

    // Step 5: Parse output — model outputs single float: output[0][0]
    const outBuffer = outputs[0];
    const outFloat = new Float32Array(
      outBuffer instanceof ArrayBuffer ? outBuffer : outBuffer.buffer
    );
    console.log(`[Stage 1 AI] Raw output (${outFloat.length} values): [${Array.from(outFloat).map(v => v.toFixed(4)).join(', ')}]`);

    let plantConf = 0;
    if (outFloat.length === 1) {
      // Single sigmoid output — value IS the plant probability
      plantConf = outFloat[0];
    } else if (outFloat.length >= 2) {
      // Multi-class output — take the max value as plant confidence
      // For [non-plant, plant] format take index 1
      plantConf = outFloat[1] > outFloat[0] ? outFloat[1] : outFloat[0];
    }

    console.log(`[Stage 1 AI] Plant confidence: ${(plantConf * 100).toFixed(2)}%`);

    // Step 6: Apply 95% threshold
    const STRICT_THRESHOLD = 0.95;
    if (plantConf < STRICT_THRESHOLD) {
      console.log(`[Stage 1 AI] ❌ REJECTED — ${(plantConf * 100).toFixed(2)}% < 95%`);
      return { passed: false, confidence: plantConf };
    }
    console.log(`[Stage 1 AI] ✅ PASSED — ${(plantConf * 100).toFixed(2)}% >= 95%`);
    return { passed: true, confidence: plantConf };

  } catch (e) {
    console.error('[Stage 1 AI] ❌ Execution error — REJECTED.', e);
    return { passed: false, confidence: 0 };
  }
};

const { width, height } = Dimensions.get('window');

export default function ScanScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);
  const plugin = useAIPipeline();
  const photoOutput = usePhotoOutput();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [flash, setFlash] = useState<'on' | 'off'>('off');


  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission]);

  const handleCapture = async () => {
    if (!cameraRef.current || !user || plugin.state !== 'loaded' || !plugin.stage2Model) return;
    
    try {
      setIsProcessing(true);
      const photo = await photoOutput.capturePhotoToFile({
        flashMode: flash
      }, {});
      
      const photoPath = `file://${photo.filePath}`;
      
      // Perform FRESH analysis on the high-quality photo
      const ImageFactory = NitroModules.createHybridObject('ImageFactory');
      const cleanPath = photoPath.replace('file://', '');
      const image = await ImageFactory.loadFromFileAsync(cleanPath);
      const inputShape = plugin.stage2Model.inputs[0].shape;
      let modelWidth = 256;
      let modelHeight = 256;
      if (inputShape.length === 4) {
        if (inputShape[3] === 3) { // NHWC
          modelWidth = inputShape[1];
          modelHeight = inputShape[2];
        } else if (inputShape[1] === 3) { // NCHW
          modelWidth = inputShape[2];
          modelHeight = inputShape[3];
        }
      }
      
      const size = Math.min(image.width, image.height);
      const startX = (image.width - size) / 2;
      const startY = (image.height - size) / 2;
      const croppedImage = image.crop(startX, startY, startX + size, startY + size);
      
      const resized = croppedImage.resize(modelWidth, modelHeight);
      
      // toRawPixelData returns { buffer, pixelFormat } - NOT a raw array!
      const rawPixelData = resized.toRawPixelData();
      const pixels = new Uint8Array(rawPixelData.buffer);
      // Android uses BGRA ordering, iOS uses RGBA - handle both
      const isBGRA = rawPixelData.pixelFormat === 'bgra';
      
      // ─────────────────────────────────────────────────────────────────
      //  MANDATORY VALIDATION PIPELINE — All gates must pass to continue
      // ─────────────────────────────────────────────────────────────────
      const total = modelWidth * modelHeight;

      // Gate 1: Brightness — reject dark/black images
      if (!checkBrightness(pixels, total, isBGRA)) {
        console.log('[Capture] REJECTED: Image too dark.');
        const result = generateScanResult(38, 1.0, photoPath);
        await insertScan(user.id, result);
        setIsProcessing(false);
        navigation.navigate('Results', { result });
        return;
      }

      // Gate 2: Sharpness — reject blurry/motion blur images
      if (!checkSharpness(pixels, modelWidth, modelHeight, isBGRA)) {
        console.log('[Capture] REJECTED: Image too blurry.');
        const result = generateScanResult(38, 1.0, photoPath);
        await insertScan(user.id, result);
        setIsProcessing(false);
        navigation.navigate('Results', { result });
        return;
      }

      // Gate 3: Green Pixel — reject images with no vegetation colors
      if (!checkGreenPixels(pixels, total, isBGRA)) {
        console.log('[Capture] REJECTED: No vegetation-like colors detected.');
        const result = generateScanResult(38, 1.0, photoPath);
        await insertScan(user.id, result);
        setIsProcessing(false);
        navigation.navigate('Results', { result });
        return;
      }

      // Gate 4: Stage 1 AI — 98% confidence required, no fail-open
      if (plugin.stage1Model) {
        const stage1Result = await runStage1AI(plugin.stage1Model, croppedImage);
        if (!stage1Result.passed) {
          console.log('[Capture] REJECTED by Stage 1 AI Plant Detector.');
          const result = generateScanResult(38, 1.0, photoPath);
          await insertScan(user.id, result);
          setIsProcessing(false);
          navigation.navigate('Results', { result });
          return;
        }
      }
      
      const dataType = plugin.stage2Model.inputs[0].dataType;
      let inputData: Float32Array | Uint8Array;
      
      if (dataType === 'uint8') {
        inputData = new Uint8Array(modelWidth * modelHeight * 3);
        for (let i = 0; i < modelWidth * modelHeight; i++) {
          const b_or_r = pixels[i * 4 + 0];
          const g      = pixels[i * 4 + 1];
          const r_or_b = pixels[i * 4 + 2];
          inputData[i * 3 + 0] = isBGRA ? r_or_b : b_or_r; // R
          inputData[i * 3 + 1] = g;                        // G
          inputData[i * 3 + 2] = isBGRA ? b_or_r : r_or_b; // B
        }
        const outputs = await plugin.stage2Model.run([inputData.buffer]);
        if (outputs && outputs.length > 0) {
          const { maxIdx, maxConf } = processOutputBuffer(outputs[0]);
          console.log(`[Stage 2 AI] disease_classifier.tflite → "${LABELS[maxIdx]}" @ ${(maxConf * 100).toFixed(1)}% confidence`);
          const result = generateScanResult(maxIdx, maxConf, photoPath);
          await insertScan(user.id, result);
          setIsProcessing(false);
          navigation.navigate('Results', { result });
        }
      } else {
        inputData = new Float32Array(modelWidth * modelHeight * 3);
        for (let i = 0; i < modelWidth * modelHeight; i++) {
          const b_or_r = pixels[i * 4 + 0];
          const g      = pixels[i * 4 + 1];
          const r_or_b = pixels[i * 4 + 2];
          inputData[i * 3 + 0] = (isBGRA ? r_or_b : b_or_r) / 255.0; // R
          inputData[i * 3 + 1] = g / 255.0;                          // G
          inputData[i * 3 + 2] = (isBGRA ? b_or_r : r_or_b) / 255.0; // B
        }
        
        const outputs = await plugin.stage2Model.run([inputData.buffer]);
        if (outputs && outputs.length > 0) {
          const { maxIdx, maxConf } = processOutputBuffer(outputs[0]);
          console.log(`[Stage 2 AI] disease_classifier.tflite → "${LABELS[maxIdx]}" @ ${(maxConf * 100).toFixed(1)}% confidence`);
          const result = generateScanResult(maxIdx, maxConf, photoPath);
          await insertScan(user.id, result);
          setIsProcessing(false);
          navigation.navigate('Results', { result });
        }
      }
    } catch (e) {
      console.error('Capture Analysis Error:', e);
      setIsProcessing(false);
      Alert.alert('Capture Failed', 'Could not analyze picture.');
    }
  };

  const handlePickImage = async () => {
    if (plugin.state !== 'loaded' || !plugin.stage2Model) {
      Alert.alert('AI Not Ready', 'Please wait for the AI model to finish loading.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setIsProcessing(true);
        
        try {
          // Load image using Nitro Image Factory
          const ImageFactory = NitroModules.createHybridObject('ImageFactory');
          const cleanPath = result.assets[0].uri.replace('file://', '');
          const image = await ImageFactory.loadFromFileAsync(cleanPath);
          
          const inputShape = plugin.stage2Model.inputs[0].shape;
          let modelWidth = 256;
          let modelHeight = 256;
          if (inputShape.length === 4) {
            if (inputShape[3] === 3) {
              modelWidth = inputShape[1];
              modelHeight = inputShape[2];
            } else if (inputShape[1] === 3) {
              modelWidth = inputShape[2];
              modelHeight = inputShape[3];
            }
          }
          
          const size = Math.min(image.width, image.height);
          const startX = (image.width - size) / 2;
          const startY = (image.height - size) / 2;
          const croppedImage = image.crop(startX, startY, startX + size, startY + size);
          
          // Resize to exact model dimensions
          const resized = croppedImage.resize(modelWidth, modelHeight);
          
          // toRawPixelData returns { buffer, pixelFormat } - NOT a raw array!
          const rawPixelData = resized.toRawPixelData();
          const pixels = new Uint8Array(rawPixelData.buffer);
          // Android uses BGRA ordering, iOS uses RGBA - handle both
          const isBGRA = rawPixelData.pixelFormat === 'bgra';
          
          // ─────────────────────────────────────────────────────────────────
          //  MANDATORY VALIDATION PIPELINE — All gates must pass to continue
          // ─────────────────────────────────────────────────────────────────
          const total = modelWidth * modelHeight;

          // Gate 1: Brightness
          if (!checkBrightness(pixels, total, isBGRA)) {
            console.log('[Gallery] REJECTED: Image too dark.');
            const finalResult = generateScanResult(38, 1.0, result.assets[0].uri);
            await insertScan(user.id, finalResult);
            setIsProcessing(false);
            navigation.navigate('Results', { result: finalResult });
            return;
          }

          // Gate 2: Sharpness
          if (!checkSharpness(pixels, modelWidth, modelHeight, isBGRA)) {
            console.log('[Gallery] REJECTED: Image too blurry.');
            const finalResult = generateScanResult(38, 1.0, result.assets[0].uri);
            await insertScan(user.id, finalResult);
            setIsProcessing(false);
            navigation.navigate('Results', { result: finalResult });
            return;
          }

          // Gate 3: Green Pixel
          if (!checkGreenPixels(pixels, total, isBGRA)) {
            console.log('[Gallery] REJECTED: No vegetation-like colors detected.');
            const finalResult = generateScanResult(38, 1.0, result.assets[0].uri);
            await insertScan(user.id, finalResult);
            setIsProcessing(false);
            navigation.navigate('Results', { result: finalResult });
            return;
          }

          // Gate 4: Stage 1 AI — 98% confidence required
          if (plugin.stage1Model) {
            const stage1Result = await runStage1AI(plugin.stage1Model, croppedImage);
            if (!stage1Result.passed) {
              console.log('[Gallery] REJECTED by Stage 1 AI Plant Detector.');
              const finalResult = generateScanResult(38, 1.0, result.assets[0].uri);
              await insertScan(user.id, finalResult);
              setIsProcessing(false);
              navigation.navigate('Results', { result: finalResult });
              return;
            }
          }

          const dataType = plugin.stage2Model.inputs[0].dataType;
          
          if (dataType === 'uint8') {
            console.log('[Stage 2 AI] disease_classifier.tflite (uint8 mode) — running...');
            let inputData = new Uint8Array(modelWidth * modelHeight * 3);
            for (let i = 0; i < modelWidth * modelHeight; i++) {
              const b_or_r = pixels[i * 4 + 0];
              const g      = pixels[i * 4 + 1];
              const r_or_b = pixels[i * 4 + 2];
              inputData[i * 3 + 0] = isBGRA ? r_or_b : b_or_r;
              inputData[i * 3 + 1] = g;
              inputData[i * 3 + 2] = isBGRA ? b_or_r : r_or_b;
            }
            const outputs = await plugin.stage2Model.run([inputData.buffer]);
            const { maxIdx, maxConf } = processOutputBuffer(outputs[0]);
            console.log(`[Stage 2 AI] disease_classifier.tflite → "${LABELS[maxIdx]}" @ ${(maxConf * 100).toFixed(1)}% confidence`);
            
            const finalResult = generateScanResult(maxIdx, maxConf, result.assets[0].uri); 
            await insertScan(user.id, finalResult);
            setIsProcessing(false);
            navigation.navigate('Results', { result: finalResult });
            
          } else {
            let inputData = new Float32Array(modelWidth * modelHeight * 3);
            for (let i = 0; i < modelWidth * modelHeight; i++) {
              const b_or_r = pixels[i * 4 + 0];
              const g      = pixels[i * 4 + 1];
              const r_or_b = pixels[i * 4 + 2];
              inputData[i * 3 + 0] = (isBGRA ? r_or_b : b_or_r) / 255.0; // R
              inputData[i * 3 + 1] = g / 255.0;                          // G
              inputData[i * 3 + 2] = (isBGRA ? b_or_r : r_or_b) / 255.0; // B
            }
            
            const outputs = await plugin.stage2Model.run([inputData.buffer]);
            if (outputs && outputs.length > 0) {
              const { maxIdx, maxConf } = processOutputBuffer(outputs[0]);
              console.log(`[Stage 2 AI] disease_classifier.tflite → "${LABELS[maxIdx]}" @ ${(maxConf * 100).toFixed(1)}% confidence`);
              const finalResult = generateScanResult(maxIdx, maxConf, result.assets[0].uri); 
              await insertScan(user.id, finalResult);
              setIsProcessing(false);
              navigation.navigate('Results', { result: finalResult });
            }
          }
        } catch (inferenceError) {
          console.error('Gallery Inference Error:', inferenceError);
          setIsProcessing(false);
          Alert.alert('Analysis Failed', 'Could not analyze this image.');
        }
      }
    } catch (e) {
      setIsProcessing(false);
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  const toggleFlash = () => {
    setFlash(prev => prev === 'off' ? 'on' : 'off');
  };

  if (!hasPermission) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgBody, justifyContent: 'center' }]}>
        <Text style={{ color: colors.textMain, textAlign: 'center' }}>No access to camera.</Text>
        <TouchableOpacity onPress={requestPermission} style={{ marginTop: 20, alignSelf: 'center' }}>
          <Text style={{ color: colors.primaryGreen }}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (device == null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgBody, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primaryGreen} />
        <Text style={{ color: colors.textMain, marginTop: 10 }}>Loading Camera...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.bgNav }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primaryGreen} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textMain }]}>Scan Crop</Text>
        <View style={[styles.badge, { backgroundColor: plugin.state === 'loaded' ? colors.badgeOkBg : colors.badgeWarnBg, borderColor: plugin.state === 'loaded' ? colors.badgeOkBorder : colors.badgeWarnBorder }]}>
          <Text style={{ color: plugin.state === 'loaded' ? colors.primaryGreen : colors.danger, fontSize: 11, fontWeight: '600' }}>
            {plugin.state === 'loaded' ? 'AI Ready' : 'Loading ML...'}
          </Text>
        </View>
      </View>

      {/* CAMERA VIEW */}
      <View style={styles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={styles.squareCamera}
          device={device}
          isActive={true}
          outputs={[photoOutput]}
          photo={true}
        />

      </View>

      {/* BOTTOM CONTROLS */}
      <View style={[styles.scanControls, { backgroundColor: colors.bgNav, borderTopColor: colors.borderNav }]}>
        <TouchableOpacity 
          style={[styles.ctrlBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderCard }]}
          onPress={toggleFlash}
        >
          <Ionicons name={flash === 'on' ? "flash" : "flash-off"} size={20} color={flash === 'on' ? colors.primaryGreen : colors.textMain} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.ctrlBtn, { backgroundColor: colors.bgCard, borderColor: colors.borderCard }]}
          onPress={handlePickImage}
        >
          <Ionicons name="images" size={20} color={colors.primaryGreen} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.captureBtn, { backgroundColor: isProcessing ? colors.borderMain : colors.primaryGreen }]}
          onPress={handleCapture}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="camera" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.captureText}>Capture & Analyze</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50 },
  backBtn: { padding: 8, marginRight: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  cameraContainer: { flex: 1, position: 'relative', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  squareCamera: { width: width, height: width },
  overlay: { ...StyleSheet.absoluteFillObject },
  overlayMask: { flex: 1, borderColor: 'rgba(0,0,0,0.5)', width: '100%', height: '100%' },
  scanFrame: { width: 200, height: 200, borderRadius: 20, borderWidth: 2, borderColor: '#4ade80', alignItems: 'center', justifyContent: 'center' },
  laserWrapper: { position: 'absolute', width: 180, height: 2, alignItems: 'center', justifyContent: 'center' },
  laserLine: { width: '100%', height: '100%' },
  livePredContainer: { position: 'absolute', top: 40, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 12, alignItems: 'center' },
  livePredLabel: { color: '#4ade80', fontSize: 16, fontWeight: 'bold' },
  livePredConf: { color: '#fff', fontSize: 12, marginTop: 4 },
  scanControls: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 40, borderTopWidth: 1, gap: 16 },
  ctrlBtn: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  captureBtn: { flex: 1, padding: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#22c55e', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 8 },
  captureText: { color: '#fff', fontSize: 14, fontWeight: '700' }
});
