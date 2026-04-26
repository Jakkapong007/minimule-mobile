import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '../../graphql/hooks';
import { POST_DETAIL, LIKE_POST, UNLIKE_POST, ADD_COMMENT, VOTE_POST, UNVOTE_POST, DELETE_POST } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

export function PostDetailScreen({ route, navigation }: any) {
  const { postId } = route.params;
  const { user } = useAuth();
  const [comment, setComment] = useState('');

  const { data, loading, refetch } = useQuery(POST_DETAIL, { variables: { id: postId } });
  const post = data?.post;
  const [likePost] = useMutation(LIKE_POST);
  const [unlikePost] = useMutation(UNLIKE_POST);
  const [addComment, { loading: commenting }] = useMutation(ADD_COMMENT);
  const [votePost] = useMutation(VOTE_POST);
  const [unvotePost] = useMutation(UNVOTE_POST);
  const [deletePost] = useMutation(DELETE_POST);

  async function toggleLike() {
    if (!post) return;
    post.isLikedByMe
      ? await unlikePost({ variables: { postId } })
      : await likePost({ variables: { postId } });
    refetch();
  }

  async function toggleVote() {
    if (!post) return;
    post.isVotedByMe
      ? await unvotePost({ variables: { postId } })
      : await votePost({ variables: { postId } });
    refetch();
  }

  async function submitComment() {
    if (!comment.trim()) return;
    await addComment({ variables: { postId, body: comment.trim() } });
    setComment('');
    refetch();
  }

  async function handleDelete() {
    await deletePost({ variables: { id: postId } });
    navigation.goBack();
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;
  if (!post) return <View style={styles.center}><Text style={styles.empty}>Post not found</Text></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        {user?.id === post.user?.id && (
          <TouchableOpacity onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />

        <View style={styles.body}>
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{(post.user?.fullName ?? 'U')[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.authorName}>{post.user?.fullName ?? 'Artist'}</Text>
              <Text style={styles.timeText}>{new Date(post.createdAt).toLocaleDateString()}</Text>
            </View>
            {post.isStickerDesign && (
              <View style={styles.badge}><Text style={styles.badgeText}>🎯 Sticker Design</Text></View>
            )}
          </View>

          {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, post.isLikedByMe && styles.actionBtnActive]} onPress={toggleLike}>
              <Text style={[styles.actionIcon, post.isLikedByMe && { color: Colors.primary }]}>♥</Text>
              <Text style={[styles.actionCount, post.isLikedByMe && { color: Colors.primary }]}>{post.likeCount}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, post.isVotedByMe && styles.actionBtnVote]} onPress={toggleVote}>
              <Text style={[styles.actionIcon, post.isVotedByMe && { color: Colors.warning }]}>▲</Text>
              <Text style={[styles.actionCount, post.isVotedByMe && { color: Colors.warning }]}>{post.voteCount}</Text>
            </TouchableOpacity>
            <View style={styles.actionBtn}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionCount}>{post.commentCount}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Comments</Text>
          {(post.comments ?? []).map((c: any) => (
            <View key={c.id} style={styles.commentItem}>
              <View style={styles.commentAvatar}>
                <Text style={styles.commentAvatarText}>{(c.user?.fullName ?? 'U')[0].toUpperCase()}</Text>
              </View>
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>{c.user?.fullName ?? 'User'}</Text>
                <Text style={styles.commentBody}>{c.body}</Text>
              </View>
            </View>
          ))}
          {(post.comments ?? []).length === 0 && (
            <Text style={styles.noComments}>No comments yet. Be the first!</Text>
          )}
        </View>
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment…"
          placeholderTextColor={Colors.gray400}
          value={comment}
          onChangeText={setComment}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!comment.trim() || commenting) && styles.sendBtnOff]}
          onPress={submitComment}
          disabled={!comment.trim() || commenting}
        >
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: Colors.gray500 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: 8 },
  back: { padding: 4 },
  backIcon: { fontSize: 22, color: Colors.gray900 },
  deleteText: { fontSize: Typography.sm, color: Colors.error, fontWeight: '600' },
  image: { width: '100%', height: 360 },
  body: { padding: Spacing.lg },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: Spacing.lg },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: Colors.white, fontWeight: '700', fontSize: 16 },
  authorName: { fontSize: Typography.base, fontWeight: '600', color: Colors.gray900 },
  timeText: { fontSize: Typography.sm, color: Colors.gray500 },
  badge: { marginLeft: 'auto', backgroundColor: Colors.primaryBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  caption: { fontSize: Typography.base, color: Colors.gray800, lineHeight: 22, marginBottom: Spacing.lg },
  actionsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl, paddingVertical: Spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.gray100 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: Colors.gray50 },
  actionBtnActive: { backgroundColor: Colors.primaryBg },
  actionBtnVote: { backgroundColor: Colors.warningBg },
  actionIcon: { fontSize: 16, color: Colors.gray600 },
  actionCount: { fontSize: Typography.sm, color: Colors.gray600, fontWeight: '600' },
  sectionTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900, marginBottom: Spacing.md },
  commentItem: { flexDirection: 'row', gap: 10, marginBottom: Spacing.md },
  commentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.gray200, justifyContent: 'center', alignItems: 'center' },
  commentAvatarText: { fontSize: 13, fontWeight: '700', color: Colors.gray700 },
  commentContent: { flex: 1 },
  commentAuthor: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900, marginBottom: 2 },
  commentBody: { fontSize: Typography.sm, color: Colors.gray700, lineHeight: 18 },
  noComments: { fontSize: Typography.sm, color: Colors.gray400, textAlign: 'center', paddingVertical: Spacing.xl },
  inputBar: { flexDirection: 'row', padding: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.gray100, gap: 8, backgroundColor: Colors.white },
  commentInput: { flex: 1, borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 9, fontSize: Typography.sm, color: Colors.gray900, maxHeight: 80 },
  sendBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full, justifyContent: 'center' },
  sendBtnOff: { opacity: 0.4 },
  sendText: { color: Colors.white, fontWeight: '700', fontSize: Typography.sm },
});
