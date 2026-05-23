import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { getRecentScans } from '../services/Database';
import { ScanResult } from '../constants/types';

export default function HistoryScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const { user } = useAuth();
  const [history, setHistory] = useState<ScanResult[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getRecentScans(user.id).then(setHistory).catch(console.error);
      }
    }, [user])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgHome }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textMain }]}>{t('recentScans')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {history.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: colors.borderCard }]}>
            <MaterialCommunityIcons name="leaf-off" size={48} color={colors.textMuted} />
            <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 16 }}>{t('noScans')}</Text>
          </View>
        ) : (
          <View style={styles.historyList}>
            {history.map(scan => (
              <TouchableOpacity 
                key={scan.id} 
                style={[styles.historyItem, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}
                onPress={() => navigation.navigate('Results', { result: scan })}
              >
                {scan.imageUri ? (
                  <Image source={{ uri: scan.imageUri }} style={styles.historyImg} />
                ) : (
                  <View style={[styles.historyImg, { alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialCommunityIcons name="leaf" size={28} color={colors.primaryGreen} />
                  </View>
                )}
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyName, { color: colors.textMain }]} numberOfLines={1}>{t(scan.diseaseName)}</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>{new Date(scan.date).toLocaleString()}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={[styles.historyBadge, { backgroundColor: scan.severity === 'High' ? colors.badgeWarnBg : colors.badgeOkBg }]}>
                    <Text style={{ color: scan.severity === 'High' ? colors.danger : colors.primaryGreen, fontSize: 11, fontWeight: '700' }}>
                      {t(scan.severity)}
                    </Text>
                  </View>
                  <Text style={{ color: colors.primaryGreen, fontSize: 12, marginTop: 6, fontWeight: '600' }}>
                    {Math.round(scan.confidence * 100)}% {t('accuracy')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 60, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '700' },
  content: { padding: 20, paddingBottom: 40 },
  emptyState: { padding: 40, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderRadius: 16, marginTop: 40 },
  historyList: { gap: 12 },
  historyItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1 },
  historyImg: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#ccc' },
  historyInfo: { flex: 1, marginLeft: 16 },
  historyName: { fontSize: 16, fontWeight: '600' },
  historyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }
});
