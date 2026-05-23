import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/SupabaseService';

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  text: string;
  timestamp: string;
};

export default function CommentsScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { postId } = route.params;
  const listRef = useRef<FlatList>(null);

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('agrigram_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const mapped: Comment[] = (data ?? []).map((row: any) => ({
        id: row.id,
        post_id: row.post_id,
        user_id: row.user_id,
        author_name: row.author_name ?? 'User',
        text: row.text,
        timestamp: row.created_at,
      }));

      setComments(mapped);
    } catch (e) {
      console.error('[Comments] Fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Realtime: new comments appear instantly — filter client-side to avoid UUID filter issues
  useEffect(() => {
    const channel = supabase
      .channel(`comments_${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agrigram_comments' },
        (payload) => {
          const row = payload.new as any;
          if (row.post_id !== postId) return; // Filter client-side
          setComments(prev => {
            if (prev.find(c => c.id === row.id)) return prev; // Deduplicate
            return [...prev, {
              id: row.id,
              post_id: row.post_id,
              user_id: row.user_id,
              author_name: row.author_name ?? 'User',
              text: row.text,
              timestamp: row.created_at,
            }];
          });
          setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !user || isPosting) return;

    const text = newComment.trim();
    setNewComment('');
    setIsPosting(true);

    // Optimistic update — show comment immediately
    const tempId = `temp_${Date.now()}`;
    const optimisticComment: Comment = {
      id: tempId,
      post_id: postId,
      user_id: user.id,
      author_name: user.name,
      text,
      timestamp: new Date().toISOString(),
    };
    setComments(prev => [...prev, optimisticComment]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const { data, error } = await supabase.from('agrigram_comments').insert({
        post_id: postId,
        user_id: user.id,
        author_name: user.name,
        text,
      }).select().single();

      if (error) throw error;

      // Replace temp comment with real one from server
      if (data) {
        setComments(prev => prev.map(c =>
          c.id === tempId
            ? { id: data.id, post_id: data.post_id, user_id: data.user_id, author_name: data.author_name, text: data.text, timestamp: data.created_at }
            : c
        ));
      }
    } catch (e: any) {
      console.error('[Comments] Post error:', e);
      // Remove optimistic comment on failure
      setComments(prev => prev.filter(c => c.id !== tempId));
      setNewComment(text); // Restore text
    } finally {
      setIsPosting(false);
    }
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentRow}>
      <View style={[styles.avatar, { backgroundColor: colors.primaryGreen }]}>
        <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
          {item.author_name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={[styles.commentBubble, { backgroundColor: colors.bgCard, borderColor: colors.borderCard }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={[styles.authorName, { color: colors.primaryGreen }]}>{item.author_name}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 10 }}>
            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {' · '}
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
        <Text style={{ color: colors.textMain, fontSize: 14, lineHeight: 20 }}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bgBody }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.bgNav, borderBottomColor: colors.borderCard }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.primaryGreen} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textMain }]}>Comments</Text>
        <Text style={[styles.count, { color: colors.textMuted }]}>{comments.length}</Text>
      </View>

      {/* Comments List */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryGreen} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderComment}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, marginTop: 12, fontSize: 15 }}>
                No comments yet.
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                Be the first to comment!
              </Text>
            </View>
          }
        />
      )}

      {/* Comment Input */}
      <View style={[styles.inputContainer, { backgroundColor: colors.bgCard, borderTopColor: colors.borderCard }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryGreen }]}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </Text>
        </View>
        <TextInput
          style={[styles.input, { color: colors.textMain, backgroundColor: colors.bgBody, borderColor: colors.borderCard }]}
          placeholder="Write a comment..."
          placeholderTextColor={colors.textMuted}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={300}
          onSubmitEditing={handlePostComment}
        />
        <TouchableOpacity
          style={[styles.postBtn, { backgroundColor: newComment.trim() ? colors.primaryGreen : colors.borderCard }]}
          onPress={handlePostComment}
          disabled={!newComment.trim() || isPosting}
        >
          {isPosting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={18} color={newComment.trim() ? '#fff' : colors.textMuted} style={{ marginLeft: 2 }} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 50, borderBottomWidth: 1 },
  backBtn: { padding: 8, marginRight: 8 },
  title: { flex: 1, fontSize: 18, fontWeight: '700' },
  count: { fontSize: 14, fontWeight: '600', marginRight: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 16, paddingBottom: 20 },
  commentRow: { flexDirection: 'row', marginBottom: 14 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', marginRight: 10, marginTop: 2, flexShrink: 0 },
  commentBubble: { flex: 1, padding: 12, borderRadius: 16, borderTopLeftRadius: 4, borderWidth: 1 },
  authorName: { fontSize: 13, fontWeight: '700' },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: 30, borderTopWidth: 1, gap: 10 },
  input: { flex: 1, minHeight: 44, maxHeight: 100, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  postBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
});
