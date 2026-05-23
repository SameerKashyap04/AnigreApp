import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../theme/SettingsContext';
import { LANGUAGES, LanguageCode } from '../constants/translations';

export default function SettingsScreen({ navigation }: any) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { language, setLanguage, profileName, setProfileName, t } = useSettings();
  
  const [nameInput, setNameInput] = useState(profileName);

  const saveProfile = () => {
    if (nameInput.trim()) {
      setProfileName(nameInput.trim());
      Alert.alert('Success', 'Profile name updated!');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgHome }]}>
      <View style={[styles.header, { backgroundColor: colors.bgNav }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primaryGreen} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textMain }]}>{t('settings')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* PROFILE SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>PROFILE</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
            <Text style={[styles.label, { color: colors.textMain }]}>Name</Text>
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { color: colors.textMain, borderColor: colors.borderMain }]}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Enter your name"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity onPress={saveProfile} style={[styles.saveBtn, { backgroundColor: colors.primaryGreen }]}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* APPEARANCE SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
            <View style={styles.rowBetween}>
              <Text style={[styles.label, { color: colors.textMain, marginBottom: 0 }]}>Dark Mode</Text>
              <Switch 
                value={isDark} 
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: colors.primaryGreen }}
                thumbColor={'#fff'}
              />
            </View>
          </View>
        </View>

        {/* LANGUAGE SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>LANGUAGE</Text>
          <View style={[styles.card, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard, padding: 0, overflow: 'hidden' }]}>
            {LANGUAGES.map((lang, index) => (
              <TouchableOpacity 
                key={lang.code}
                style={[
                  styles.langRow, 
                  { borderBottomColor: colors.borderCard },
                  index === LANGUAGES.length - 1 && { borderBottomWidth: 0 },
                  language === lang.code && { backgroundColor: 'rgba(74, 222, 128, 0.1)' }
                ]}
                onPress={() => setLanguage(lang.code as LanguageCode)}
              >
                <Text style={[styles.langText, { color: colors.textMain }]}>{lang.name}</Text>
                {language === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primaryGreen} />
                )}
              </TouchableOpacity>
            ))}
          </View>
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
  content: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, height: 44 },
  saveBtn: { paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderRadius: 12, height: 44 },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  langText: { fontSize: 15, fontWeight: '500' }
});
