import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { getRecentScans } from '../services/Database';

export default function ProfileScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { profileName, t } = useSettings();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ total: 0, highRisk: 0, accuracy: 0 });

  useFocusEffect(
    useCallback(() => {
      if (user) {
        getRecentScans(user.id).then(scans => {
          const total = scans.length;
          const highRisk = scans.filter(s => s.severity === 'High').length;
          const accuracy = total > 0 ? Math.round((scans.reduce((acc, curr) => acc + curr.confidence, 0) / total) * 100) : 0;
          setStats({ total, highRisk, accuracy });
        }).catch(console.error);
      }
    }, [user])
  );

  const MenuItem = ({ iconName, iconLib = 'MaterialCommunityIcons', text, isDanger = false, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.menuItem, { backgroundColor: colors.bgCardAlt, borderColor: isDanger ? colors.badgeWarnBorder : colors.borderCard }]}
    >
      <View style={[styles.miIcon, { backgroundColor: isDanger ? colors.badgeWarnBg : colors.iconBg }]}>
        {iconLib === 'Ionicons' ? (
          <Ionicons name={iconName} size={20} color={isDanger ? colors.danger : colors.textMain} />
        ) : (
          <MaterialCommunityIcons name={iconName} size={20} color={isDanger ? colors.danger : colors.textMain} />
        )}
      </View>
      <Text style={[styles.miText, { color: isDanger ? colors.danger : colors.textMain }]}>{text}</Text>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgHome }]} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={[styles.headerTitle, { color: colors.textMain }]}>{t('myProfile')}</Text>
      
      <View style={styles.avatarSection}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryGreen, borderColor: colors.primaryGlow }]}>
          <Text style={{ fontSize: 40, color: '#fff', fontWeight: 'bold' }}>{user?.name?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={[styles.avatarName, { color: colors.textMain }]}>{user?.name || profileName}</Text>
        <Text style={[styles.avatarSub, { color: colors.textMuted }]}>{t('farmer')} · Joined Jan 2025</Text>
      </View>

      <View style={styles.stats}>
        <View style={[styles.statCard, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
          <Text style={[styles.statNum, { color: colors.primaryGreen }]}>{stats.total}</Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>{t('totalScans')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
          <Text style={[styles.statNum, { color: colors.primaryGreen }]}>{stats.highRisk}</Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>{t('highRisk')}</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
          <Text style={[styles.statNum, { color: colors.primaryGreen }]}>{stats.accuracy}%</Text>
          <Text style={[styles.statLbl, { color: colors.textMuted }]}>{t('accuracy')}</Text>
        </View>
      </View>

      <View style={styles.menuGroup}>
        <MenuItem iconName="leaf" text={t('myCrops')} onPress={() => navigation.navigate('MyCrops')} />
        <MenuItem iconName="chart-bar" text={t('analytics')} onPress={() => navigation.navigate('Analytics')} />
        <MenuItem iconName="bell-outline" text={t('notifications')} onPress={() => {}} />
        <MenuItem iconName="web" text={t('language')} onPress={() => navigation.navigate('Settings')} />
        <MenuItem iconName="cog-outline" text={t('settings')} onPress={() => navigation.navigate('Settings')} />
        <MenuItem iconName="logout" text={t('signOut')} isDanger={true} onPress={logout} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700', marginTop: 40, marginBottom: 10 },
  avatarSection: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 4, marginBottom: 12 },
  avatarName: { fontSize: 20, fontWeight: '700' },
  avatarSub: { fontSize: 13, marginTop: 4 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLbl: { fontSize: 11, marginTop: 4 },
  menuGroup: { gap: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1 },
  miIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  miText: { fontSize: 14, fontWeight: '600', flex: 1 },
  miArr: { fontSize: 20, fontWeight: '400' }
});
