import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '../../graphql/hooks';
import { MY_NOTIFICATIONS, MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ } from '../../graphql/queries';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

const TYPE_ICON: Record<string, string> = {
  order_update: '📦',
  promotion:    '🎁',
  new_follower: '👤',
  post_vote:    '❤️',
  system:       '🔔',
};

const TYPE_COLOR: Record<string, string> = {
  order_update: Colors.info,
  promotion:    Colors.warning,
  new_follower: Colors.success,
  post_vote:    Colors.primary,
  system:       Colors.gray500,
};

export function NotificationsScreen({ navigation }: any) {
  const { data, loading, refetch } = useQuery(MY_NOTIFICATIONS, { variables: { limit: 50, offset: 0 } });
  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAll] = useMutation(MARK_ALL_NOTIFICATIONS_READ);

  const notifications: any[] = data?.myNotifications?.items ?? [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  async function handleMarkAll() {
    await markAll({});
    refetch();
  }

  async function handleTap(n: any) {
    if (!n.isRead) {
      await markRead({ variables: { id: n.id } });
      refetch();
    }
    if (n.type === 'order_update' && n.referenceId) {
      navigation.navigate('ShopTab', { screen: 'OrderDetail', params: { orderId: n.referenceId } });
    }
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.titleWrap}>
          <Text style={styles.navTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAll} activeOpacity={0.7}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 88 }} />
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>You have no notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={n => n.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: n }) => {
            const accentColor = TYPE_COLOR[n.type] ?? Colors.gray500;
            return (
              <TouchableOpacity
                style={[styles.notifCard, !n.isRead && styles.notifCardUnread]}
                onPress={() => handleTap(n)}
                activeOpacity={0.8}
              >
                {!n.isRead && <View style={[styles.unreadBar, { backgroundColor: accentColor }]} />}
                <View style={[styles.iconCircle, { backgroundColor: accentColor + '18' }]}>
                  <Text style={styles.typeIcon}>{TYPE_ICON[n.type] ?? '🔔'}</Text>
                </View>
                <View style={styles.notifBody}>
                  <Text style={[styles.notifTitle, !n.isRead && styles.notifTitleUnread]} numberOfLines={1}>
                    {n.title}
                  </Text>
                  <Text style={styles.notifMessage} numberOfLines={2}>{n.body}</Text>
                  <Text style={styles.notifTime}>{formatTime(n.createdAt)}</Text>
                </View>
                {!n.isRead && <View style={[styles.unreadDot, { backgroundColor: accentColor }]} />}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: 56, paddingBottom: 14,
    backgroundColor: Colors.white,
    ...Shadow.xs,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: Colors.gray900 },
  titleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.gray900, letterSpacing: -0.3 },
  badgeCount: { backgroundColor: Colors.primary, borderRadius: Radius.full, minWidth: 20, height: 20, paddingHorizontal: 6, justifyContent: 'center', alignItems: 'center' },
  badgeCountText: { fontSize: 11, fontWeight: '800', color: Colors.white },
  markAllBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: Colors.primaryBg, borderRadius: Radius.full },
  markAllText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '700' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 10 },
  emptyIcon: { fontSize: 56, marginBottom: 6 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray900, letterSpacing: -0.3 },
  emptySubtitle: { fontSize: Typography.sm, color: Colors.gray500 },

  list: { paddingVertical: 10, paddingHorizontal: Spacing.base, gap: 8 },

  notifCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingVertical: 14, paddingHorizontal: Spacing.base,
    overflow: 'hidden',
    ...Shadow.xs,
  },
  notifCardUnread: { backgroundColor: Colors.white },
  unreadBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, borderRadius: 2 },
  iconCircle: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  typeIcon: { fontSize: 22 },
  notifBody: { flex: 1 },
  notifTitle: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray600, marginBottom: 3 },
  notifTitleUnread: { color: Colors.gray900, fontWeight: '700' },
  notifMessage: { fontSize: Typography.sm, color: Colors.gray600, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: Typography.xs, color: Colors.gray400, fontWeight: '500' },
  unreadDot: { width: 9, height: 9, borderRadius: 5 },
});
