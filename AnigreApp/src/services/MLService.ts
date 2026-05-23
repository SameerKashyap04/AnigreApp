import { ScanResult } from '../constants/types';
import { useAssets } from 'expo-asset';

// Extracted from assets/model/labels.txt
export const LABELS = [
  'apple apple scab',
  'apple black rot',
  'apple cedar apple rust',
  'apple healthy',
  'blueberry healthy',
  'cherry including sour powdery mildew',
  'cherry including sour healthy',
  'corn maize cercospora leaf spot gray leaf spot',
  'corn maize common rust',
  'corn maize northern leaf blight',
  'corn maize healthy',
  'grape black rot',
  'grape esca black measles',
  'grape leaf blight isariopsis leaf spot',
  'grape healthy',
  'orange haunglongbing citrus greening',
  'peach bacterial spot',
  'peach healthy',
  'pepper bell bacterial spot',
  'pepper bell healthy',
  'potato early blight',
  'potato late blight',
  'potato healthy',
  'raspberry healthy',
  'soybean healthy',
  'squash powdery mildew',
  'strawberry leaf scorch',
  'strawberry healthy',
  'tomato bacterial spot',
  'tomato early blight',
  'tomato late blight',
  'tomato leaf mold',
  'tomato septoria leaf spot',
  'tomato spider mites two spotted spider mite',
  'tomato target spot',
  'tomato yellow leaf curl virus',
  'tomato mosaic virus',
  'tomato healthy',
  'background'
];

import { useTensorflowModel, loadTensorflowModel, TensorflowPlugin } from 'react-native-fast-tflite';
import React, { useEffect, useState } from 'react';

export const useAIPipeline = () => {
  const [assets, error] = useAssets([
    require('../../assets/model/plant_detector.tflite'),
    require('../../assets/model/disease_classifier.tflite')
  ]);
  
  const [state, setState] = useState<{ 
    stage1Model?: any; 
    stage2Model?: any; 
    state: 'loading' | 'loaded' | 'error' 
  }>({ state: 'loading' });

  useEffect(() => {
    // Wait until assets are resolved
    if (!assets || !assets[0] || !assets[1]) return;

    // Trigger download if not yet available
    if (!assets[0].localUri || !assets[1].localUri) {
      if (!assets[0].localUri) assets[0].downloadAsync();
      if (!assets[1].localUri) assets[1].downloadAsync();
      return;
    }

    // Load the models once we have real local file paths
    const load = async () => {
      try {
        const m1 = await loadTensorflowModel({ url: assets[0].localUri! }, []);
        const m2 = await loadTensorflowModel({ url: assets[1].localUri! }, []);
        setState({
          stage1Model: m1,
          stage2Model: m2,
          state: 'loaded'
        });
      } catch (e) {
        console.error('Failed to load TFLite models:', e);
        setState({
          stage1Model: undefined,
          stage2Model: undefined,
          state: 'error'
        });
      }
    };

    load();
  }, [assets]);

  if (error && state.state !== 'error') {
    setState({ stage1Model: undefined, stage2Model: undefined, state: 'error' });
  }
  
  return state;
};

/**
 * Maps the raw TFLite output into our App's rich ScanResult format
 */
export const generateScanResult = (
  labelIndex: number, 
  confidence: number, 
  imageUri: string
): ScanResult => {
  // Force Unknown flag or < 85% confidence
  if (confidence < 0.85) {
    return {
      id: `scan-${Date.now()}`,
      imageUri,
      diseaseName: 'Unknown/Uncertain Result',
      confidence,
      severity: 'Unknown',
      date: new Date().toISOString(),
      treatments: [
        'The AI could not identify this with high confidence (requires >85%).',
        'Ensure the image is well-lit and the leaf is in focus.',
        'Try scanning again from a different angle.',
        'If the issue persists, consult a local agricultural expert.'
      ]
    };
  }

  const rawLabel = LABELS[labelIndex] || 'Unknown';
  
  // Clean up label: "Cherry___Powdery_mildew" -> "Cherry Powdery Mildew"
  let formattedName = rawLabel
    .replace(/\(.*?\)/g, '')
    .replace(/___/g, ' ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Capitalize each word for a pretty UI name
  formattedName = formattedName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  const searchName = formattedName.toLowerCase();

  if (labelIndex === 38 || searchName.includes('background')) {
     return {
      id: `scan-${Date.now()}`,
      imageUri,
      diseaseName: 'No Plant Detected',
      confidence,
      severity: 'Unknown',
      date: new Date().toISOString(),
      treatments: [
        'The AI did not detect a clear plant leaf in this image.',
        'Ensure the leaf is the primary subject of the photo.',
        'Try scanning again from a closer angle.'
      ]
    };
  }
  
  const isHealthy = searchName.includes('healthy');
  
  let treatments: string[] = [];
  
  if (isHealthy) {
    treatments = [
      'Plant is healthy! Maintain regular watering.',
      'Monitor for early signs of pests.',
      'Ensure proper nutrient balance in soil.'
    ];
  } else if (searchName.includes('bacterial spot')) {
    treatments = [
      'Avoid overhead irrigation to keep leaves dry.',
      'Remove and destroy infected plant debris.',
      'Apply copper-based fungicides if symptoms persist.'
    ];
  } else if (searchName.includes('powdery mildew')) {
    treatments = [
      'Increase air circulation around plants.',
      'Apply sulfur-based fungicides early in the morning.',
      'Remove heavily infected leaves immediately.'
    ];
  } else if (searchName.includes('blight')) {
    treatments = [
      'Apply mulch to prevent soil spores from splashing.',
      'Prune lower leaves to improve airflow.',
      'Use professional-grade fungicides if spread is rapid.'
    ];
  } else if (searchName.includes('virus')) {
    treatments = [
      'Control whiteflies or aphids which spread viruses.',
      'Remove and destroy infected plants to save others.',
      'Disinfect tools after handling infected plants.'
    ];
  } else if (searchName.includes('spider mites')) {
    treatments = [
      'Use neem oil or insecticidal soap.',
      'Increase humidity as mites thrive in dry conditions.',
      'Blast plants with water to physically remove mites.'
    ];
  } else if (searchName.includes('black rot') || searchName.includes('apple scab')) {
    treatments = [
      'Prune out infected branches and fruit.',
      'Improve air circulation through proper spacing.',
      'Clean fallen leaves to reduce overwintering spores.'
    ];
  } else {
    // General fallback for other diseases
    treatments = [
      'Remove and destroy infected leaves immediately.',
      'Apply appropriate organic fungicide.',
      'Ensure good air circulation around the plant base.',
      'Avoid overhead watering to keep leaves dry.'
    ];
  }
  
  return {
    id: `scan-${Date.now()}`,
    imageUri,
    diseaseName: formattedName,
    confidence,
    severity: isHealthy ? 'Low' : (confidence > 0.8 ? 'High' : 'Medium'),
    date: new Date().toISOString(),
    treatments
  };
};
