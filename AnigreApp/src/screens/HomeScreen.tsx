import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { getRecentScans } from '../services/Database';
import { ScanResult } from '../constants/types';

export default function HomeScreen({ navigation }: any) {
  const { colors, toggleTheme, isDark } = useTheme();
  const { profileName, t } = useSettings();
  const { user } = useAuth();
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getRecentScans(user.id)
          .then(setRecentScans)
          .catch(console.error);
      }
    }, [user])
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgHome }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>{t('greeting')}</Text>
          <Text style={[styles.title, { color: colors.textMain }]}>{t('hello')}, <Text style={{ color: colors.primaryGreen }}>{user?.name || profileName}!</Text></Text>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { borderColor: colors.borderMain, backgroundColor: colors.bgCard }]}>
          <Ionicons name={isDark ? "sunny" : "moon"} size={14} color={colors.textMain} style={{ marginRight: 4 }} />
          <Text style={{ color: colors.textMain, fontSize: 12 }}>{isDark ? 'Light' : 'Dark'}</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.scanHero, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderMain }]}
        onPress={() => navigation.navigate('Scan')}
      >
        <View style={[styles.scanBtn, { backgroundColor: colors.primaryGreen }]}>
          <MaterialCommunityIcons name="camera-outline" size={40} color="#fff" />
        </View>
        <Text style={[styles.scanLabel, { color: colors.textGreenLight }]}>{t('tapToScan')}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.aiBanner, { backgroundColor: 'rgba(74, 222, 128, 0.1)', borderColor: colors.primaryGreen }]}
        onPress={() => navigation.navigate('Chat')}
      >
        <View style={styles.aiIconWrapper}>
          <Ionicons name="sparkles" size={24} color={colors.primaryGreen} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.aiTitle, { color: colors.primaryGreen }]}>Ask Anigre.ai</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 2 }}>Your personal farming assistant</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.primaryGreen} />
      </TouchableOpacity>
      
      <View style={styles.stats}>
        <View style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.borderCard }]}>
          <Text style={styles.statNum}>
            {recentScans.filter(s => {
              const d = new Date(s.date); const tDate = new Date();
              return d.getDate()===tDate.getDate() && d.getMonth()===tDate.getMonth() && d.getFullYear()===tDate.getFullYear();
            }).length}
          </Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>{t('todayScans')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.bgCard, borderColor: colors.borderCard }]}>
          <Text style={[styles.statNum, { color: colors.danger }]}>
            {recentScans.filter(s => {
              const d = new Date(s.date); const tDate = new Date();
              return s.severity === 'High' && d.getDate()===tDate.getDate() && d.getMonth()===tDate.getMonth() && d.getFullYear()===tDate.getFullYear();
            }).length}
          </Text>
          <Text style={[styles.statLbl, { color: colors.danger }]}>{t('highRiskToday')}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{t('recentScans')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Text style={{ color: colors.primaryGreen, fontWeight: '600', fontSize: 13 }}>{t('seeAll')}</Text>
        </TouchableOpacity>
      </View>
      
      {recentScans.length === 0 ? (
        <View style={[styles.emptyState, { borderColor: colors.borderCard }]}>
          <MaterialCommunityIcons name="leaf-off" size={32} color={colors.textMuted} />
          <Text style={{ color: colors.textMuted, marginTop: 8 }}>No scans yet.</Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {recentScans.slice(0, 5).map(scan => (
            <TouchableOpacity 
              key={scan.id} 
              style={[styles.historyItem, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}
              onPress={() => navigation.navigate('Results', { result: scan })}
            >
              {scan.imageUri ? (
                <Image source={{ uri: scan.imageUri }} style={styles.historyImg} />
              ) : (
                <View style={[styles.historyImg, { alignItems: 'center', justifyContent: 'center' }]}>
                  <MaterialCommunityIcons name="leaf" size={24} color={colors.primaryGreen} />
                </View>
              )}
              <View style={styles.historyInfo}>
                <Text style={[styles.historyName, { color: colors.textMain }]} numberOfLines={1}>{scan.diseaseName}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>{new Date(scan.date).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.historyBadge, { backgroundColor: scan.severity === 'High' ? colors.badgeWarnBg : colors.badgeOkBg }]}>
                <Text style={{ color: scan.severity === 'High' ? colors.danger : colors.primaryGreen, fontSize: 10, fontWeight: '700' }}>
                  {Math.round(scan.confidence * 100)}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, marginTop: 40 },
  greeting: { fontSize: 14, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '700' },
  themeBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  scanHero: { borderRadius: 24, padding: 30, alignItems: 'center', borderWidth: 1, marginBottom: 20 },
  scanBtn: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  scanLabel: { fontSize: 16, fontWeight: '600' },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1 },
  statNum: { fontSize: 24, fontWeight: '800', color: '#22c55e' },
  statLbl: { fontSize: 12, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  emptyState: { padding: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 16 },
  historyList: { gap: 10 },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1 },
  historyImg: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#ccc' },
  historyInfo: { flex: 1, marginLeft: 12 },
  historyName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  historyBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  aiBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
  aiIconWrapper: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 16, fontWeight: '700' }
});
