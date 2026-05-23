import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/SupabaseService';

const PostVideoPreview = ({ uri, style }: { uri: string, style: any }) => {
  const player = useVideoPlayer(uri, player => {
    player.loop = true;
    player.play();
  });
  return <VideoView style={style} player={player} contentFit="cover" nativeControls />;
};

export default function CreatePostScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [caption, setCaption] = useState('');
  const [media, setMedia] = useState<{ uri: string, type: 'image' | 'video' } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setMedia({ 
        uri: asset.uri, 
        type: asset.type === 'video' ? 'video' : 'image' 
      });
    }
  };

  const captureMedia = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setMedia({ 
        uri: asset.uri, 
        type: asset.type === 'video' ? 'video' : 'image' 
      });
    }
  };

  const handlePublish = async () => {
    if (!caption.trim() && !media) {
      Alert.alert('Empty Post', 'Please add a photo, video, or some text.');
      return;
    }
    if (!user) return;

    try {
      setIsPublishing(true);
      const imageUri = media?.type === 'image' ? media.uri : null;
      const videoUri = media?.type === 'video' ? media.uri : null;

      const { error } = await supabase.from('agrigram_posts').insert({
        user_id: user.id,
        author_name: user.name,
        caption: caption.trim(),
        image_uri: imageUri,
        video_uri: videoUri,
        likes: 0,
        liked_by: [],
      });

      if (error) throw error;
      navigation.goBack();
    } catch (e: any) {
      console.error('[CreatePost] Error:', e);
      Alert.alert('Error', e.message || 'Failed to publish post');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.bgBody }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.header, { backgroundColor: colors.bgNav }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Ionicons name="close" size={28} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textMain }]}>New Post</Text>
        <TouchableOpacity onPress={handlePublish} disabled={isPublishing || (!caption.trim() && !media)} style={styles.publishBtn}>
          {isPublishing ? (
            <ActivityIndicator size="small" color={colors.primaryGreen} />
          ) : (
            <Text style={{ color: (!caption.trim() && !media) ? colors.textMuted : colors.primaryGreen, fontWeight: '700', fontSize: 16 }}>Publish</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: colors.textMain }]}
          placeholder="What's happening on your farm?"
          placeholderTextColor={colors.textMuted}
          multiline
          autoFocus
          value={caption}
          onChangeText={setCaption}
        />
      </View>

      {media && (
        <View style={styles.mediaContainer}>
          <TouchableOpacity style={styles.removeMediaBtn} onPress={() => setMedia(null)}>
            <Ionicons name="close-circle" size={24} color={colors.danger} />
          </TouchableOpacity>
          {media.type === 'image' ? (
            <Image source={{ uri: media.uri }} style={styles.mediaPreview} resizeMode="cover" />
          ) : (
            <PostVideoPreview uri={media.uri} style={styles.mediaPreview} />
          )}
        </View>
      )}

      <View style={[styles.toolbar, { borderTopColor: colors.borderCard, backgroundColor: colors.bgCard }]}>
        <TouchableOpacity style={styles.toolBtn} onPress={pickMedia}>
          <Ionicons name="image-outline" size={24} color={colors.primaryGreen} />
          <Text style={[styles.toolText, { color: colors.textMain }]}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={captureMedia}>
          <Ionicons name="camera-outline" size={24} color={colors.primaryGreen} />
          <Text style={[styles.toolText, { color: colors.textMain }]}>Camera</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  title: { fontSize: 18, fontWeight: '700' },
  publishBtn: { padding: 8 },
  inputContainer: { padding: 20, minHeight: 120 },
  input: { fontSize: 18, lineHeight: 26 },
  mediaContainer: { marginHorizontal: 20, marginBottom: 20, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  mediaPreview: { width: '100%', height: 300, backgroundColor: '#000' },
  removeMediaBtn: { position: 'absolute', top: 10, right: 10, zIndex: 10, backgroundColor: '#fff', borderRadius: 12 },
  toolbar: { flexDirection: 'row', borderTopWidth: 1, padding: 16, paddingBottom: 30, gap: 20 },
  toolBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74, 222, 128, 0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  toolText: { marginLeft: 8, fontWeight: '600' }
});
