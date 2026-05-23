import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/SupabaseService';

type Post = {
  id: string;
  authorName: string;
  caption: string;
  imageUri?: string;
  videoUri?: string;
  likes: number;
  timestamp: string;
  isLikedByMe: boolean;
  user_id: string;
};

const PostVideo = ({ uri, style }: { uri: string, style: any }) => {
  const player = useVideoPlayer(uri, player => {
    player.loop = true;
    player.play();
  });
  return <VideoView style={style} player={player} contentFit="cover" nativeControls />;
};

export default function AgriGramScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('agrigram_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map Supabase rows to Post shape
      const mapped: Post[] = (data ?? []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        authorName: row.author_name ?? 'Unknown',
        caption: row.caption ?? '',
        imageUri: row.image_uri,
        videoUri: row.video_uri,
        likes: row.likes ?? 0,
        timestamp: row.created_at,
        isLikedByMe: Array.isArray(row.liked_by) && user ? row.liked_by.includes(user.id) : false,
      }));
      setPosts(mapped);
    } catch (e) {
      console.error('[AgriGram] Fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [user])
  );

  // Realtime subscription: new posts appear instantly
  useEffect(() => {
    const channel = supabase
      .channel('agrigram_posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agrigram_posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleLike = async (post: Post) => {
    if (!user) return;

    const liked = post.isLikedByMe;
    // Optimistic UI update
    setPosts(cur => cur.map(p => p.id === post.id
      ? { ...p, isLikedByMe: !liked, likes: liked ? p.likes - 1 : p.likes + 1 }
      : p
    ));

    try {
      // Fetch current liked_by array from Supabase
      const { data: row } = await supabase
        .from('agrigram_posts')
        .select('liked_by, likes')
        .eq('id', post.id)
        .single();

      const likedBy: string[] = row?.liked_by ?? [];
      const newLikedBy = liked
        ? likedBy.filter((id: string) => id !== user.id)
        : [...likedBy, user.id];

      await supabase
        .from('agrigram_posts')
        .update({ liked_by: newLikedBy, likes: newLikedBy.length })
        .eq('id', post.id);
    } catch (e) {
      // Revert on error
      fetchPosts();
    }
  };

  const handleShare = async (post: Post) => {
    try {
      await Share.share({
        message: `Check out this post on AgriGram by ${post.authorName}: "${post.caption}"`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View style={[styles.postCard, { backgroundColor: colors.bgCard, borderColor: colors.borderCard }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryGreen }]}>
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.authorName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.authorName, { color: colors.textMain }]}>{item.authorName}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>{new Date(item.timestamp).toLocaleString()}</Text>
        </View>
      </View>

      {/* Caption */}
      <Text style={[styles.caption, { color: colors.textMain }]}>{item.caption}</Text>

      {/* Media */}
      {item.imageUri && (
        <Image source={{ uri: item.imageUri }} style={styles.media} resizeMode="cover" />
      )}
      {item.videoUri && (
        <PostVideo uri={item.videoUri} style={styles.media} />
      )}

      {/* Action Bar */}
      <View style={[styles.actionBar, { borderTopColor: colors.borderCard }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item)}>
          <Ionicons name={item.isLikedByMe ? "heart" : "heart-outline"} size={24} color={item.isLikedByMe ? colors.danger : colors.textMain} />
          <Text style={[styles.actionText, { color: item.isLikedByMe ? colors.danger : colors.textMain }]}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Comments', { postId: item.id })}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.textMain} />
          <Text style={[styles.actionText, { color: colors.textMain }]}>Comment</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleShare(item)}>
          <Ionicons name="paper-plane-outline" size={22} color={colors.textMain} />
          <Text style={[styles.actionText, { color: colors.textMain }]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bgBody }]}>
      <View style={[styles.header, { backgroundColor: colors.bgNav }]}>
        <Text style={[styles.title, { color: colors.primaryGreen }]}>AgriGram</Text>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>Farmer Community</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.feed}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="images-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, marginTop: 12 }}>No posts yet. Be the first!</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primaryGreen }]}
        onPress={() => navigation.navigate('CreatePost')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 50, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', fontStyle: 'italic' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  feed: { padding: 12, paddingBottom: 100 },
  postCard: { borderWidth: 1, borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  authorName: { fontSize: 15, fontWeight: '700' },
  caption: { paddingHorizontal: 12, paddingBottom: 12, fontSize: 14, lineHeight: 20 },
  media: { width: '100%', height: 300, backgroundColor: '#000' },
  actionBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  actionText: { fontSize: 14, fontWeight: '500', marginLeft: 6 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }
});
