import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '../../graphql/hooks';
import { USER_POSTS } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

const ROLE_COLOR: Record<string, string> = {
  admin: Colors.error,
  artist: Colors.primary,
  customer: Colors.info,
};

const ACTIONS = [
  { key: 'orders',    icon: '📦', label: 'Orders',        screen: 'Orders' },
  { key: 'addresses', icon: '📍', label: 'Addresses',     screen: 'Addresses' },
  { key: 'payment',   icon: '💳', label: 'Payment',       screen: 'PaymentMethods' },
  { key: 'notifs',    icon: '🔔', label: 'Notifications', screen: 'Notifications' },
];

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
        <View style={styles.avatarRing}>
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
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNum}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.actionsSection}>
        {ACTIONS.map(a => (
          <TouchableOpacity
            key={a.key}
            style={styles.actionRow}
            onPress={() => navigation.navigate(a.screen)}
            activeOpacity={0.75}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionEmoji}>{a.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{a.label}</Text>
            <Text style={styles.actionChevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Posts grid */}
      <View style={styles.postsSection}>
        <Text style={styles.sectionTitle}>My Posts</Text>
        {loading && <ActivityIndicator color={Colors.primary} style={{ marginVertical: 24 }} />}
        {!loading && posts.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🖼️</Text>
            <Text style={styles.emptyText}>No posts yet. Share something!</Text>
          </View>
        )}
        {!loading && posts.length > 0 && (
          <View style={styles.grid}>
            {posts.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                style={styles.gridItem}
                onPress={() => navigation.navigate('PostDetail', { postId: p.id })}
                activeOpacity={0.88}
              >
                <Image source={{ uri: p.imageUrl }} style={styles.gridImg} resizeMode="cover" />
                {p.isStickerDesign && (
                  <View style={styles.stickerDot}><Text style={styles.dotText}>🎯</Text></View>
                )}
                {p.visibility === 'private' && (
                  <View style={styles.privateDot}><Text style={styles.dotText}>🔒</Text></View>
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
  container: { flex: 1, backgroundColor: Colors.backgroundDark },

  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderBottomLeftRadius: Radius.xxl,
    borderBottomRightRadius: Radius.xxl,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  avatarRing: {
    width: 96, height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: Colors.primary,
    marginBottom: 14,
    padding: 3,
    ...Shadow.primary,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 44 },
  avatarFallback: { backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { fontSize: 36, fontWeight: '700', color: Colors.white },
  name: { fontSize: 22, fontWeight: '800', color: Colors.gray900, letterSpacing: -0.5, marginBottom: 4 },
  email: { fontSize: Typography.sm, color: Colors.gray500, marginBottom: 10 },
  roleBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: Radius.full, marginBottom: 14 },
  roleText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', gap: Spacing.xl },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: '800', color: Colors.gray900 },
  statLabel: { fontSize: 11, color: Colors.gray500, fontWeight: '500', marginTop: 2 },

  actionsSection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
    gap: 14,
  },
  actionIcon: {
    width: 38, height: 38,
    borderRadius: Radius.lg,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionEmoji: { fontSize: 18 },
  actionLabel: { flex: 1, fontSize: Typography.base, fontWeight: '600', color: Colors.gray800 },
  actionChevron: { fontSize: 22, color: Colors.gray300, fontWeight: '300' },

  postsSection: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    padding: Spacing.base,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  sectionTitle: { fontSize: Typography.base, fontWeight: '800', color: Colors.gray900, marginBottom: 14, letterSpacing: -0.2 },
  empty: { alignItems: 'center', paddingVertical: 36, gap: 10 },
  emptyIcon: { fontSize: 40 },
  emptyText: { color: Colors.gray400, fontSize: Typography.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  gridItem: { width: '33.33%', aspectRatio: 1, position: 'relative' },
  gridImg: { width: '100%', height: '100%' },
  stickerDot: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.full, padding: 3 },
  privateDot: { position: 'absolute', top: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.full, padding: 3 },
  dotText: { fontSize: 10 },

  signOutBtn: {
    marginHorizontal: Spacing.base,
    marginBottom: 80,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingVertical: 15,
    alignItems: 'center',
    ...Shadow.xs,
  },
  signOutText: { fontSize: Typography.base, fontWeight: '600', color: Colors.error },
});
