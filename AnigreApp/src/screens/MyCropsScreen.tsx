import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useSettings } from '../theme/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { getMyCrops, insertCrop } from '../services/Database';

export default function MyCropsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { t } = useSettings();
  const { user } = useAuth();
  const [crops, setCrops] = useState<any[]>([]);
  const [newCropName, setNewCropName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const loadCrops = useCallback(() => {
    if (user) {
      getMyCrops(user.id).then(setCrops).catch(console.error);
    }
  }, [user]);

  useFocusEffect(loadCrops);

  const handleAddCrop = async () => {
    if (!newCropName.trim() || !user) {
      Alert.alert('Error', 'Please enter a crop name');
      return;
    }
    
    const id = `crop-${Date.now()}`;
    const date = new Date().toISOString();
    
    await insertCrop(user.id, id, newCropName.trim(), 'Healthy', date);
    setNewCropName('');
    setIsAdding(false);
    loadCrops();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bgHome }]}>
      <View style={[styles.header, { backgroundColor: colors.bgNav }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primaryGreen} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textMain }]}>{t('myCrops')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {isAdding ? (
          <View style={[styles.addCard, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
            <TextInput
              style={[styles.input, { color: colors.textMain, borderColor: colors.borderMain }]}
              placeholder="Enter crop name (e.g., Wheat, Rice)"
              placeholderTextColor={colors.textMuted}
              value={newCropName}
              onChangeText={setNewCropName}
            />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.borderMain, flex: 1 }]} onPress={() => setIsAdding(false)}>
                <Text style={{ color: colors.textMain, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primaryGreen, flex: 1 }]} onPress={handleAddCrop}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.addBtn, { borderColor: colors.primaryGreen, backgroundColor: 'rgba(74, 222, 128, 0.1)' }]}
            onPress={() => setIsAdding(true)}
          >
            <Ionicons name="add" size={24} color={colors.primaryGreen} style={{ marginRight: 8 }} />
            <Text style={{ color: colors.primaryGreen, fontWeight: '700', fontSize: 16 }}>Add New Crop</Text>
          </TouchableOpacity>
        )}

        <View style={styles.list}>
          {crops.map((crop) => (
            <View key={crop.id} style={[styles.cropCard, { backgroundColor: colors.bgCardAlt, borderColor: colors.borderCard }]}>
              <View style={[styles.cropIcon, { backgroundColor: colors.iconBg }]}>
                <Ionicons name="leaf" size={24} color={colors.primaryGreen} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cropName, { color: colors.textMain }]}>{crop.name}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 12 }}>Planted: {new Date(crop.plantedDate).toLocaleDateString()}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: crop.status === 'Healthy' ? colors.badgeOkBg : colors.badgeWarnBg }]}>
                <Text style={{ color: crop.status === 'Healthy' ? colors.primaryGreen : colors.warning, fontSize: 11, fontWeight: '700' }}>{crop.status}</Text>
              </View>
            </View>
          ))}
          
          {crops.length === 0 && !isAdding && (
            <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 40 }}>No crops added yet.</Text>
          )}
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
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', marginBottom: 20 },
  addCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, height: 48, fontSize: 15 },
  btn: { padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  list: { gap: 12 },
  cropCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  cropIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  cropName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }
});
