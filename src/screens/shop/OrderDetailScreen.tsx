import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '../../graphql/hooks';
import { MY_ORDERS } from '../../graphql/queries';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

const STATUS_COLOR: Record<string, string> = {
  pending: Colors.warning, paid: Colors.info, processing: Colors.info,
  shipped: Colors.primary, delivered: Colors.success,
  cancelled: Colors.gray500, refunded: Colors.gray600,
};

const STATUS_ICON: Record<string, string> = {
  pending: '⏳', paid: '✅', processing: '⚙️', shipped: '🚚', delivered: '📦',
  cancelled: '✕', refunded: '↩',
};

const STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

export function OrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const { data, loading } = useQuery(MY_ORDERS);
  const order = data?.myOrders?.find((o: any) => o.id === orderId);

  const stepIdx = STEPS.indexOf(order?.status ?? '');

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  if (!order) return <View style={styles.center}><Text style={styles.missingText}>Order not found</Text></View>;

  const color = STATUS_COLOR[order.status] ?? Colors.gray500;
  const icon = STATUS_ICON[order.status] ?? '📋';

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Order Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Status card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIconCircle, { backgroundColor: color + '18' }]}>
            <Text style={styles.statusIconText}>{icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.statusBadge, { backgroundColor: color + '18' }]}>
              <Text style={[styles.statusBadgeText, { color }]}>{order.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.orderNum}>{order.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Progress tracker */}
        {!['cancelled', 'refunded'].includes(order.status) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Progress</Text>
            <View style={styles.progressRow}>
              {STEPS.map((s, i) => (
                <View key={s} style={styles.stepWrap}>
                  {i < STEPS.length - 1 && (
                    <View style={[styles.stepLine, i < stepIdx && styles.stepLineActive]} />
                  )}
                  <View style={[styles.stepDot, i <= stepIdx && styles.stepDotActive]}>
                    {i <= stepIdx && <Text style={styles.stepCheck}>✓</Text>}
                  </View>
                  <Text style={[styles.stepLabel, i <= stepIdx && styles.stepLabelActive]} numberOfLines={1}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items?.map((item: any) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product?.name ?? 'Product'}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>฿{(item.quantity * item.unitPrice).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>฿{order.subtotal?.toLocaleString()}</Text>
          </View>
          {order.discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: Colors.success }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: Colors.success }]}>−฿{order.discountAmount?.toLocaleString()}</Text>
            </View>
          )}
          {order.shippingFee > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>฿{order.shippingFee?.toLocaleString()}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>฿{order.total?.toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  missingText: { color: Colors.gray500, fontSize: Typography.base },

  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: 56, paddingBottom: 14,
    backgroundColor: Colors.white, ...Shadow.xs,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: Colors.gray900 },
  navTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.gray900, letterSpacing: -0.3 },

  scroll: { padding: Spacing.base, gap: 12, paddingBottom: 40 },

  statusCard: {
    backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.base,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    ...Shadow.sm,
  },
  statusIconCircle: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  statusIconText: { fontSize: 24 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, alignSelf: 'flex-start', marginBottom: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  orderNum: { fontSize: Typography.lg, fontWeight: '900', color: Colors.gray900, letterSpacing: -0.3 },
  orderDate: { fontSize: Typography.xs, color: Colors.gray500, marginTop: 3 },

  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.xs },
  sectionTitle: { fontSize: Typography.xs, fontWeight: '800', color: Colors.gray500, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.8 },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepWrap: { flex: 1, alignItems: 'center', position: 'relative' },
  stepLine: { position: 'absolute', top: 13, left: '50%', right: '-50%', height: 2, backgroundColor: Colors.gray200, zIndex: -1 },
  stepLineActive: { backgroundColor: Colors.primary },
  stepDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.gray200, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  stepDotActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  stepCheck: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  stepLabel: { fontSize: 9, color: Colors.gray400, textTransform: 'capitalize', textAlign: 'center', fontWeight: '600' },
  stepLabelActive: { color: Colors.primary },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900 },
  itemQty: { fontSize: Typography.xs, color: Colors.gray500, marginTop: 2 },
  itemPrice: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  summaryLabel: { fontSize: Typography.sm, color: Colors.gray600 },
  summaryValue: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900 },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.gray200, marginTop: 10, paddingTop: 14 },
  totalLabel: { fontSize: Typography.base, fontWeight: '800', color: Colors.gray900 },
  totalValue: { fontSize: Typography.xl, fontWeight: '900', color: Colors.primary },
});
