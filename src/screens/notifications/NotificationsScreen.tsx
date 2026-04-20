import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '../../graphql/hooks';
import { MY_NOTIFICATIONS, MARK_NOTIFICATION_READ, MARK_ALL_NOTIFICATIONS_READ } from '../../graphql/queries';
import { Colors, Spacing, Typography } from '../../theme';

const TYPE_ICON: Record<string, string> = {
  order_update: '📦',
  promo: '🎁',
  new_follower: '👤',
  post_vote: '❤️',
  system: '🔔',
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

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={styles.markAllBtn}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} />
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>All caught up!</Text>
          <Text style={styles.emptySubtitle}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={n => n.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: n }) => (
            <TouchableOpacity
              style={[styles.notifCard, !n.isRead && styles.notifCardUnread]}
              onPress={() => handleTap(n)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, !n.isRead && styles.iconCircleActive]}>
                <Text style={styles.typeIcon}>{TYPE_ICON[n.type] ?? '🔔'}</Text>
              </View>
              <View style={styles.notifBody}>
                <Text style={[styles.notifTitle, !n.isRead && styles.notifTitleUnread]} numberOfLines={1}>
                  {n.title}
                </Text>
                <Text style={styles.notifMessage} numberOfLines={2}>{n.body}</Text>
                <Text style={styles.notifTime}>{formatTime(n.createdAt)}</Text>
              </View>
              {!n.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
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
  container: { flex: 1, backgroundColor: Colors.gray50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  backIcon: { fontSize: 22, color: Colors.gray900, width: 32 },
  navTitle: { fontSize: Typography.lg, fontWeight: '700', color: Colors.gray900 },
  markAllBtn: { fontSize: Typography.xs, color: Colors.primary, fontWeight: '600', textAlign: 'right', width: 80 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray900, marginBottom: 8 },
  emptySubtitle: { fontSize: Typography.sm, color: Colors.gray500 },
  list: { paddingVertical: 8 },
  notifCard: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: Spacing.lg, paddingVertical: 14, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  notifCardUnread: { backgroundColor: Colors.primaryBg },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  iconCircleActive: { backgroundColor: Colors.white },
  typeIcon: { fontSize: 22 },
  notifBody: { flex: 1 },
  notifTitle: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray700, marginBottom: 2 },
  notifTitleUnread: { color: Colors.gray900, fontWeight: '700' },
  notifMessage: { fontSize: Typography.sm, color: Colors.gray600, lineHeight: 18 },
  notifTime: { fontSize: Typography.xs, color: Colors.gray400, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
});
