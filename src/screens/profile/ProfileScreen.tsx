import React from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '../../graphql/hooks';
import { USER_POSTS } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

const ROLE_COLOR: Record<string, string> = { admin: Colors.error, artist: Colors.primary, customer: Colors.gray600 };

export function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const { data, loading } = useQuery(USER_POSTS, {
    variables: { userId: user?.id ?? '', limit: 30 },
    skip: !user?.id,
  });
  const posts: any[] = data?.userPosts ?? [];

  if (!user) return null;

  const roleColor = ROLE_COLOR[user.role] ?? Colors.gray600;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrap}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>{(user.fullName ?? user.email)[0].toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{user.fullName ?? 'User'}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor + '20' }]}>
          <Text style={[styles.roleText, { color: roleColor }]}>{user.role.toUpperCase()}</Text>
        </View>
        <Text style={styles.postCount}>{posts.length} {posts.length === 1 ? 'post' : 'posts'}</Text>
      </View>

      {/* Quick actions */}
      <View style={styles.actionsGrid}>
        {[
          { label: '📦 Orders', onPress: () => navigation.navigate('Orders') },
          { label: '📍 Addresses', onPress: () => navigation.navigate('Addresses') },
          { label: '💳 Payment', onPress: () => navigation.navigate('PaymentMethods') },
          { label: '🔔 Notifications', onPress: () => navigation.navigate('Notifications') },
        ].map(a => (
          <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={a.onPress} activeOpacity={0.8}>
            <Text style={styles.actionText}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts grid */}
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>My Posts</Text>
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : posts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No posts yet. Share something!</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {posts.map((p: any) => (
              <TouchableOpacity key={p.id} style={styles.gridItem} onPress={() => navigation.navigate('PostDetail', { postId: p.id })} activeOpacity={0.85}>
                <Image source={{ uri: p.imageUrl }} style={styles.gridImg} resizeMode="cover" />
                {p.isStickerDesign && (
                  <View style={styles.stickerDot}><Text style={styles.stickerDotText}>🎯</Text></View>
                )}
                {p.visibility === 'private' && (
                  <View style={styles.privateDot}><Text style={styles.privateDotText}>🔒</Text></View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.signOutBtn} onPress={signOut} activeOpacity={0.8}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { alignItems: 'center', paddingTop: 56, paddingBottom: Spacing.xl, paddingHorizontal: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  avatarWrap: { marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarFallback: { backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 36, fontWeight: '700', color: Colors.white },
  name: { fontSize: 22, fontWeight: '800', color: Colors.gray900, marginBottom: 4 },
  email: { fontSize: Typography.sm, color: Colors.gray500, marginBottom: 8 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full, marginBottom: 8 },
  roleText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  postCount: { fontSize: Typography.sm, color: Colors.gray500 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: Spacing.lg, gap: 10 },
  actionBtn: { flex: 1, minWidth: '45%', backgroundColor: Colors.gray50, borderRadius: Radius.lg, paddingVertical: 14, paddingHorizontal: 12, borderWidth: 1, borderColor: Colors.gray200 },
  actionText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray800, textAlign: 'center' },
  postsSection: { paddingHorizontal: Spacing.lg, paddingBottom: 80 },
  sectionTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900, marginBottom: 12 },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: Colors.gray400, fontSize: Typography.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  gridItem: { width: '33.33%', aspectRatio: 1, position: 'relative' },
  gridImg: { width: '100%', height: '100%' },
  stickerDot: { position: 'absolute', bottom: 4, left: 4, backgroundColor: Colors.primaryBg, borderRadius: Radius.full, padding: 2 },
  stickerDotText: { fontSize: 10 },
  privateDot: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: Radius.full, padding: 2 },
  privateDotText: { fontSize: 10 },
  signOutBtn: { marginHorizontal: Spacing.lg, marginBottom: Spacing.xxxl, borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  signOutText: { fontSize: Typography.base, fontWeight: '600', color: Colors.gray700 },
});
