import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '../../graphql/hooks';
import { MY_CART, UPDATE_CART_ITEM, REMOVE_FROM_CART, CREATE_ORDER, SHIPPING_METHODS, CHECK_PROMO, MY_ORDERS } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

export function CartScreen({ navigation }: any) {
  const { user } = useAuth();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [ordering, setOrdering] = useState(false);
  const [promoError, setPromoError] = useState('');

  const { data: cartData, loading, refetch } = useQuery(MY_CART);
  const { data: shippingData } = useQuery(SHIPPING_METHODS);
  const [checkPromo] = useMutation(CHECK_PROMO);
  const [updateItem] = useMutation(UPDATE_CART_ITEM);
  const [removeItem] = useMutation(REMOVE_FROM_CART);
  const [createOrder] = useMutation(CREATE_ORDER, { refetchQueries: [{ query: MY_ORDERS }] });

  const cart = cartData?.myCart;
  const items: any[] = cart?.items ?? [];
  const shippingMethods: any[] = shippingData?.shippingMethods ?? [];
  const defaultAddr = user?.addresses?.find((a: any) => a.isDefault) ?? user?.addresses?.[0];

  const subtotal = items.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0);
  const shippingFee = selectedShipping?.baseFee ?? 0;
  const discount = appliedPromo?.discountAmount ?? 0;
  const total = subtotal + shippingFee - discount;

  async function applyPromo() {
    setPromoError('');
    try {
      const { data } = await checkPromo({ variables: { code: promoCode.toUpperCase(), orderTotal: subtotal } });
      const res = data?.checkPromoCode;
      if (res?.valid) {
        setAppliedPromo(res);
      } else {
        setPromoError(res?.message ?? 'Invalid code');
        setAppliedPromo(null);
      }
    } catch { setPromoError('Failed to apply code'); }
  }

  async function placeOrder() {
    if (!defaultAddr) { alert('Please add a delivery address in your profile first.'); return; }
    setOrdering(true);
    try {
      const { data } = await createOrder({
        variables: {
          input: {
            addressId: defaultAddr.id,
            shippingMethodId: selectedShipping?.id ?? null,
            promotionCode: appliedPromo ? promoCode.toUpperCase() : null,
          },
        },
      });
      if (data?.createOrder) {
        navigation.navigate('OrderDetail', { orderId: data.createOrder.id });
      }
    } catch (e: any) {
      alert(e.message ?? 'Order failed');
    } finally {
      setOrdering(false);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  if (!items.length) return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <Text style={styles.navTitle}>Cart</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add some products to get started</Text>
        <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('ShopTab')}><Text style={styles.shopBtnText}>Browse Shop</Text></TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.backIcon}>←</Text></TouchableOpacity>
        <Text style={styles.navTitle}>Cart ({items.length})</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
        {/* Items */}
        <View style={styles.section}>
          {items.map((item: any) => (
            <View key={item.id} style={styles.itemCard}>
              {item.product.images?.[0] ? (
                <Image source={{ uri: item.product.images[0].imageUrl }} style={styles.itemImg} resizeMode="cover" />
              ) : (
                <View style={[styles.itemImg, styles.noImg]}><Text>📦</Text></View>
              )}
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                <Text style={styles.itemPrice}>฿{item.unitPrice.toLocaleString()} each</Text>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={async () => {
                    if (item.quantity === 1) {
                      await removeItem({ variables: { cartItemId: item.id } });
                    } else {
                      await updateItem({ variables: { cartItemId: item.id, quantity: item.quantity - 1 } });
                    }
                    refetch();
                  }}>
                    <Text style={styles.qtyBtnText}>{item.quantity === 1 ? '🗑' : '−'}</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyValue}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={async () => {
                    await updateItem({ variables: { cartItemId: item.id, quantity: item.quantity + 1 } });
                    refetch();
                  }}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.itemTotal}>฿{(item.quantity * item.unitPrice).toLocaleString()}</Text>
            </View>
          ))}
        </View>

        {/* Shipping */}
        {shippingMethods.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Method</Text>
            {shippingMethods.map((m: any) => (
              <TouchableOpacity key={m.id} style={[styles.shippingOption, selectedShipping?.id === m.id && styles.shippingOptionActive]} onPress={() => setSelectedShipping(m)}>
                <View style={styles.shippingLeft}>
                  <Text style={styles.shippingName}>{m.name}</Text>
                  <Text style={styles.shippingDesc}>{m.estimatedDaysMin}–{m.estimatedDaysMax} days · {m.carrier}</Text>
                </View>
                <Text style={styles.shippingFee}>{m.baseFee === 0 ? 'Free' : `฿${m.baseFee}`}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Promo Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discount Code</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={styles.promoInput}
              placeholder="Enter code"
              placeholderTextColor={Colors.gray400}
              value={promoCode}
              onChangeText={code => { setPromoCode(code); setAppliedPromo(null); setPromoError(''); }}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.promoBtn} onPress={applyPromo}>
              <Text style={styles.promoBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
          {!!promoError && <Text style={styles.promoError}>{promoError}</Text>}
          {appliedPromo && <Text style={styles.promoSuccess}>✓ {appliedPromo.message} (−฿{appliedPromo.discountAmount.toLocaleString()})</Text>}
        </View>

        {/* Delivery address */}
        {defaultAddr && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Deliver to</Text>
            <View style={styles.addrCard}>
              <Text style={styles.addrName}>{defaultAddr.recipientName}</Text>
              <Text style={styles.addrLine}>{defaultAddr.addressLine1}{defaultAddr.addressLine2 ? `, ${defaultAddr.addressLine2}` : ''}</Text>
              <Text style={styles.addrLine}>{defaultAddr.province} {defaultAddr.postalCode}</Text>
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>฿{subtotal.toLocaleString()}</Text></View>
          {shippingFee > 0 && <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipping</Text><Text style={styles.summaryValue}>฿{shippingFee.toLocaleString()}</Text></View>}
          {discount > 0 && <View style={styles.summaryRow}><Text style={[styles.summaryLabel, { color: Colors.success }]}>Discount</Text><Text style={[styles.summaryValue, { color: Colors.success }]}>−฿{discount.toLocaleString()}</Text></View>}
          <View style={[styles.summaryRow, styles.totalRow]}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>฿{total.toLocaleString()}</Text></View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.orderBtn, (ordering || !defaultAddr) && styles.orderBtnOff]} onPress={placeOrder} disabled={ordering || !defaultAddr}>
          <Text style={styles.orderBtnText}>{ordering ? 'Placing Order…' : `Place Order · ฿${total.toLocaleString()}`}</Text>
        </TouchableOpacity>
        {!defaultAddr && <Text style={styles.noAddrHint}>Add a delivery address in Profile → Addresses</Text>}
      </View>
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
  emptySubtitle: { fontSize: Typography.sm, color: Colors.gray500, marginBottom: 24 },
  shopBtn: { backgroundColor: Colors.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: Radius.md },
  shopBtnText: { color: Colors.white, fontWeight: '700' },
  section: { backgroundColor: Colors.white, marginTop: 8, padding: Spacing.lg },
  sectionTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900, marginBottom: 12 },
  itemCard: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  itemImg: { width: 68, height: 68, borderRadius: Radius.md, backgroundColor: Colors.gray100 },
  noImg: { justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900, marginBottom: 2 },
  itemPrice: { fontSize: Typography.xs, color: Colors.gray500, marginBottom: 6 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  qtyBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 16, color: Colors.gray800 },
  qtyValue: { width: 36, textAlign: 'center', fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },
  itemTotal: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },
  shippingOption: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.md, padding: 12, marginBottom: 8 },
  shippingOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  shippingLeft: { flex: 1 },
  shippingName: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900 },
  shippingDesc: { fontSize: Typography.xs, color: Colors.gray500 },
  shippingFee: { fontSize: Typography.sm, fontWeight: '700', color: Colors.primary },
  promoRow: { flexDirection: 'row', gap: 8 },
  promoInput: { flex: 1, borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 11, fontSize: Typography.base, color: Colors.gray900, fontWeight: '600', letterSpacing: 1 },
  promoBtn: { backgroundColor: Colors.gray900, paddingHorizontal: 18, borderRadius: Radius.md, justifyContent: 'center' },
  promoBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.sm },
  promoError: { marginTop: 6, fontSize: Typography.sm, color: Colors.error },
  promoSuccess: { marginTop: 6, fontSize: Typography.sm, color: Colors.success, fontWeight: '600' },
  addrCard: { backgroundColor: Colors.gray50, borderRadius: Radius.md, padding: 12 },
  addrName: { fontSize: Typography.sm, fontWeight: '700', color: Colors.gray900, marginBottom: 2 },
  addrLine: { fontSize: Typography.sm, color: Colors.gray600 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: Typography.sm, color: Colors.gray600 },
  summaryValue: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900 },
  totalRow: { borderTopWidth: 1, borderTopColor: Colors.gray200, marginTop: 8, paddingTop: 12 },
  totalLabel: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },
  totalValue: { fontSize: Typography.lg, fontWeight: '900', color: Colors.primary },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  orderBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center' },
  orderBtnOff: { opacity: 0.5 },
  orderBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: '700' },
  noAddrHint: { textAlign: 'center', marginTop: 8, fontSize: 11, color: Colors.gray400 },
});
