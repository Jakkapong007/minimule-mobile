import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '../../graphql/hooks';
import { MY_ORDERS } from '../../graphql/queries';
import { Colors, Radius, Spacing, Typography } from '../../theme';

const STATUS_COLOR: Record<string, string> = {
  pending: Colors.warning, paid: Colors.info, processing: Colors.info,
  shipped: Colors.primary, delivered: Colors.success,
  cancelled: Colors.gray500, refunded: Colors.gray600,
};

export function OrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const { data, loading } = useQuery(MY_ORDERS);
  const order = data?.myOrders?.find((o: any) => o.id === orderId);

  const STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];
  const stepIdx = STEPS.indexOf(order?.status ?? '');

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;
  if (!order) return <View style={styles.center}><Text style={styles.empty}>Order not found</Text></View>;

  const color = STATUS_COLOR[order.status] ?? Colors.gray500;

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <Text style={styles.navTitle}>Order Details</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.orderNum}>{order.orderNumber}</Text>
            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.badgeText, { color }]}>{order.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.date}>{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>

        {/* Progress tracker */}
        {!['cancelled', 'refunded'].includes(order.status) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Order Progress</Text>
            <View style={styles.progressRow}>
              {STEPS.map((s, i) => (
                <View key={s} style={styles.stepWrap}>
                  <View style={[styles.stepDot, i <= stepIdx && styles.stepDotActive]}>
                    {i <= stepIdx && <Text style={styles.stepCheck}>✓</Text>}
                  </View>
                  <Text style={[styles.stepLabel, i <= stepIdx && styles.stepLabelActive]} numberOfLines={1}>{s}</Text>
                  {i < STEPS.length - 1 && <View style={[styles.stepLine, i < stepIdx && styles.stepLineActive]} />}
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
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>฿{order.subtotal?.toLocaleString()}</Text></View>
          {order.discountAmount > 0 && <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: Colors.success }]}>Discount</Text><Text style={[styles.summaryValue, { color: Colors.success }]}>−฿{order.discountAmount?.toLocaleString()}</Text></View>}
          {order.shippingFee > 0 && <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipping</Text><Text style={styles.summaryValue}>฿{order.shippingFee?.toLocaleString()}</Text></View>}
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
  container: { flex: 1, backgroundColor: Colors.gray50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: Colors.gray500 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  backIcon: { fontSize: 22, color: Colors.gray900, width: 32 },
  navTitle: { fontSize: Typography.lg, fontWeight: '700', color: Colors.gray900 },
  scroll: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderNum: { fontSize: Typography.lg, fontWeight: '900', color: Colors.gray900 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  badgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  date: { fontSize: Typography.sm, color: Colors.gray500 },
  sectionTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900, marginBottom: 12 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stepWrap: { flex: 1, alignItems: 'center', position: 'relative' },
  stepDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: Colors.gray300, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepDotActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  stepCheck: { color: Colors.white, fontSize: 12, fontWeight: '700' },
  stepLabel: { fontSize: 9, color: Colors.gray400, textTransform: 'capitalize', textAlign: 'center' },
  stepLabelActive: { color: Colors.primary, fontWeight: '600' },
  stepLine: { position: 'absolute', top: 14, right: -50, width: 60, height: 2, backgroundColor: Colors.gray200, zIndex: -1 },
  stepLineActive: { backgroundColor: Colors.primary },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900 },
  itemQty: { fontSize: Typography.xs, color: Colors.gray500 },
  itemPrice: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: Typography.sm, color: Colors.gray600 },
  summaryValue: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900 },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.gray200, marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },
  totalValue: { fontSize: Typography.lg, fontWeight: '900', color: Colors.primary },
});
