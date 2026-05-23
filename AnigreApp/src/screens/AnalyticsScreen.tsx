import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { getRecentScans } from '../services/Database';
import { ScanResult } from '../constants/types';

export default function AnalyticsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const { user } = useAuth();
  const [scans, setScans] = useState<ScanResult[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getRecentScans(user.id).then(setScans).catch(console.error);
      }
    }, [user])
  );

  const totalScans = scans.length;
  const highRisk = scans.filter(s => s.severity === 'High').length;
  const lowRisk = scans.filter(s => s.severity === 'Low').length;
  const mediumRisk = scans.filter(s => s.severity === 'Medium').length;

  // Calculate disease frequency
  const diseaseCounts: Record<string, number> = {};
  scans.forEach(s => {
    diseaseCounts[s.diseaseName] = (diseaseCounts[s.diseaseName] || 0) + 1;
  });
  const topDiseases = Object.entries(diseaseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3); // Top 3

  const getBarWidth = (val: number) => {
    if (totalScans === 0) return '0%';
    return `${(val / totalScans) * 100}%`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgHome }]}>
      <View style={[styles.header, { backgroundColor: colors.bgNav }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primaryGreen} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textMain }]}>{t('analytics')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={[styles.card, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>HEALTH OVERVIEW</Text>
          
          <View style={styles.barRow}>
            <Text style={[styles.barLabel, { color: colors.danger }]}>{t('High')}</Text>
            <View style={[styles.barTrack, { backgroundColor: colors.borderCard }]}>
              <View style={[styles.barFill, { width: getBarWidth(highRisk), backgroundColor: colors.danger }]} />
            </View>
            <Text style={[styles.barVal, { color: colors.textMain }]}>{highRisk}</Text>
          </View>
          
          <View style={styles.barRow}>
            <Text style={[styles.barLabel, { color: colors.warning }]}>{t('Medium')}</Text>
            <View style={[styles.barTrack, { backgroundColor: colors.borderCard }]}>
              <View style={[styles.barFill, { width: getBarWidth(mediumRisk), backgroundColor: colors.warning }]} />
            </View>
            <Text style={[styles.barVal, { color: colors.textMain }]}>{mediumRisk}</Text>
          </View>

          <View style={styles.barRow}>
            <Text style={[styles.barLabel, { color: colors.primaryGreen }]}>{t('Low')} / {t('Healthy')}</Text>
            <View style={[styles.barTrack, { backgroundColor: colors.borderCard }]}>
              <View style={[styles.barFill, { width: getBarWidth(lowRisk), backgroundColor: colors.primaryGreen }]} />
            </View>
            <Text style={[styles.barVal, { color: colors.textMain }]}>{lowRisk}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
          <Text style={[styles.cardTitle, { color: colors.textMuted }]}>TOP DETECTED DISEASES</Text>
          
          {topDiseases.length === 0 && (
            <Text style={{ color: colors.textMuted }}>No diseases detected yet.</Text>
          )}

          {topDiseases.map(([disease, count], idx) => (
            <View key={idx} style={[styles.diseaseRow, { borderBottomColor: colors.borderCard, borderBottomWidth: idx === topDiseases.length - 1 ? 0 : 1 }]}>
              <Text style={[styles.diseaseName, { color: colors.textMain }]}>{t(disease)}</Text>
              <View style={[styles.diseaseBadge, { backgroundColor: 'rgba(74, 222, 128, 0.1)' }]}>
                <Text style={{ color: colors.primaryGreen, fontWeight: '700' }}>{count} cases</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50 },
  backBtn: { padding: 8, marginRight: 8 },
  title: { fontSize: 18, fontWeight: '700', flex: 1 },
  content: { padding: 20, paddingBottom: 40, gap: 20 },
  card: { padding: 20, borderRadius: 16, borderWidth: 1 },
  cardTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 20 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  barLabel: { width: 80, fontSize: 13, fontWeight: '600' },
  barTrack: { flex: 1, height: 8, borderRadius: 4, marginHorizontal: 12, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barVal: { width: 30, textAlign: 'right', fontWeight: '700' },
  diseaseRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  diseaseName: { fontSize: 15, fontWeight: '500', flex: 1, marginRight: 10 },
  diseaseBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }
});
