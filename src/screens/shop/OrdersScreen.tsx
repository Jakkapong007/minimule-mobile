import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '../../graphql/hooks';
import { MY_ORDERS } from '../../graphql/queries';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

const STATUS_COLOR: Record<string, string> = {
  pending: Colors.warning, paid: Colors.info, processing: Colors.info,
  shipped: Colors.primary, delivered: Colors.success,
  cancelled: Colors.gray500, refunded: Colors.gray600,
};
const STATUS_BG: Record<string, string> = {
  pending: Colors.warningBg, paid: Colors.infoBg, processing: Colors.infoBg,
  shipped: Colors.primaryBg, delivered: Colors.successBg,
  cancelled: Colors.gray100, refunded: Colors.gray100,
};

export function OrdersScreen({ navigation }: any) {
  const { data, loading } = useQuery(MY_ORDERS);
  const orders: any[] = data?.myOrders ?? [];

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <Text style={styles.navTitle}>My Orders</Text>
        <View style={{ width: 32 }} />
      </View>
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>Your orders will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={o => o.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: o }) => {
            const color = STATUS_COLOR[o.status] ?? Colors.gray500;
            const bg = STATUS_BG[o.status] ?? Colors.gray100;
            return (
              <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: o.id })} activeOpacity={0.85}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.orderNum}>{o.orderNumber}</Text>
                    <Text style={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                    <Text style={[styles.statusText, { color }]}>{o.status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.cardItems}>
                  {o.items?.slice(0, 2).map((item: any) => (
                    <Text key={item.id} style={styles.itemLine} numberOfLines={1}>
                      {item.quantity}× {item.product?.name ?? 'Product'}
                    </Text>
                  ))}
                  {o.items?.length > 2 && <Text style={styles.moreItems}>+{o.items.length - 2} more</Text>}
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>฿{o.total.toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  backIcon: { fontSize: 22, color: Colors.gray900, width: 32 },
  navTitle: { fontSize: Typography.lg, fontWeight: '700', color: Colors.gray900 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray900, marginBottom: 8 },
  emptySubtitle: { fontSize: Typography.sm, color: Colors.gray500 },
  list: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.sm },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  orderNum: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },
  orderDate: { fontSize: Typography.xs, color: Colors.gray500, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  cardItems: { marginBottom: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.gray100, paddingTop: Spacing.md },
  itemLine: { fontSize: Typography.sm, color: Colors.gray700, marginBottom: 2 },
  moreItems: { fontSize: Typography.xs, color: Colors.gray400, marginTop: 2 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.gray100, paddingTop: Spacing.md },
  totalLabel: { fontSize: Typography.sm, color: Colors.gray500 },
  totalValue: { fontSize: Typography.lg, fontWeight: '900', color: Colors.primary },
});
