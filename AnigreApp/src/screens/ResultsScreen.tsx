import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../theme/SettingsContext';
import { ScanResult } from '../constants/types';

export default function ResultsScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const result: ScanResult = route.params?.result || {
    id: 'mock', imageUri: '', diseaseName: 'Unknown', confidence: 0, severity: 'Low', date: '', treatments: []
  };

  const handleAskAI = async () => {
    let base64 = undefined;
    if (result.imageUri) {
      try {
        base64 = await FileSystem.readAsStringAsync(result.imageUri, { encoding: 'base64' });
      } catch (err) {
        console.error("Could not read image for AI", err);
      }
    }
    
    navigation.navigate('Chat', { 
      initialMessage: `My crop scan detected: ${t(result.diseaseName)}. The severity is ${t(result.severity)}. Can you explain what this means and provide detailed solutions or treatments?`,
      initialImageUri: result.imageUri,
      initialImageBase64: base64
    });
  };

  if (!route.params?.result) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bgHome, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textMain }}>No scan data available.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.primaryGreen }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bgHome }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primaryGreen} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textMain }]}>{t('scanResults')}</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>{Math.round(result.confidence * 100)}% {t('confidence')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.imageContainer, { backgroundColor: colors.bgCardAlt }]}>
          {result.imageUri ? (
            <Image source={{ uri: result.imageUri }} style={styles.image} />
          ) : (
            <MaterialCommunityIcons name="leaf" size={60} color={colors.primaryGreen} />
          )}
          <View style={[styles.aiBadge, { borderColor: colors.primaryGreen }]}>
            <Ionicons name="hardware-chip-outline" size={12} color={colors.primaryGreen} style={{ marginRight: 4 }} />
            <Text style={{ color: colors.primaryGreen, fontSize: 10 }}>{t('aiAnalyzed')}</Text>
          </View>
        </View>

        <Text style={[styles.diseaseName, { color: colors.danger }]}>{t(result.diseaseName)}</Text>
        
        <View style={styles.confRow}>
          <Text style={[styles.confLabel, { color: colors.textMuted }]}>{t('confidence')}</Text>
          <View style={[styles.confBar, { backgroundColor: colors.borderCard }]}>
            <View style={[styles.confFill, { width: `${result.confidence * 100}%`, backgroundColor: colors.primaryGreen }]} />
          </View>
          <Text style={[styles.confVal, { color: colors.primaryGreen }]}>{Math.round(result.confidence * 100)}%</Text>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>{t('severityLabel')}</Text>
          <View style={styles.sevRow}>
            <View style={[styles.sevDot, { backgroundColor: result.severity === 'High' ? colors.danger : colors.warning }]} />
            <Text style={[styles.sevText, { color: result.severity === 'High' ? colors.danger : colors.warning }]}>
              {t(result.severity)} — {t('actionRequired')}
            </Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>{t('treatmentsLabel')}</Text>
          {result.treatments.map((tr, i) => (
            <View key={i} style={styles.treatRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.primaryGreen} style={{ marginRight: 8, marginTop: 2 }} />
              <Text style={{ color: colors.textMain, flex: 1, fontSize: 13, lineHeight: 20 }}>{t(tr)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.bgCardAlt, borderColor: colors.primaryGreen, borderWidth: 1, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
            onPress={handleAskAI}
          >
            <Ionicons name="sparkles" size={20} color={colors.primaryGreen} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.primaryGreen, fontWeight: '700' }}>Ask Anigre.ai</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryGreen, flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
            <Ionicons name="clipboard-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('saveReport')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50 },
  backBtn: { padding: 8, marginRight: 8 },
  title: { fontSize: 16, fontWeight: '600', flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 16 },
  imageContainer: { height: 200, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  aiBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  diseaseName: { fontSize: 24, fontWeight: '800' },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confLabel: { fontSize: 13 },
  confBar: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  confFill: { height: '100%', borderRadius: 3 },
  confVal: { fontSize: 13, fontWeight: '700' },
  infoCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  cardTitle: { fontSize: 11, fontWeight: '600', marginBottom: 12, letterSpacing: 1 },
  sevRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sevDot: { width: 10, height: 10, borderRadius: 5 },
  sevText: { fontSize: 14, fontWeight: '600' },
  treatRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  actionBtn: { padding: 16, borderRadius: 16 }
});
