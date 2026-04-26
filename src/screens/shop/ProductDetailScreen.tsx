import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '../../graphql/hooks';
import { PRODUCT, PRODUCT_REVIEWS, ADD_TO_CART } from '../../graphql/queries';
import { StarRating } from '../../components/common/StarRating';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

export function ProductDetailScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const { data, loading } = useQuery(PRODUCT, { variables: { id: productId } });
  const { data: reviewData } = useQuery(PRODUCT_REVIEWS, { variables: { productId, limit: 10 } });
  const [addToCart, { loading: adding }] = useMutation(ADD_TO_CART);

  const p = data?.product;
  const reviews: any[] = reviewData?.productReviews ?? [];
  const primaryImg = p?.images?.find((i: any) => i.isPrimary) ?? p?.images?.[0];

  async function handleAdd() {
    if (!p) return;
    await addToCart({ variables: { productId: p.id, quantity: qty } });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  if (!p) return <View style={styles.center}><Text style={styles.empty}>Product not found</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cart')} style={styles.cartBtn}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {primaryImg ? (
          <Image source={{ uri: primaryImg.imageUrl }} style={styles.hero} resizeMode="cover" />
        ) : (
          <View style={[styles.hero, styles.noImg]}><Text style={styles.noImgIcon}>📦</Text></View>
        )}

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleWrap}>
              <Text style={styles.category}>{p.category?.name}</Text>
              <Text style={styles.name}>{p.name}</Text>
            </View>
            <Text style={styles.price}>฿{p.basePrice.toLocaleString()}</Text>
          </View>

          {p.avgRating > 0 && (
            <View style={styles.ratingRow}>
              <StarRating rating={p.avgRating} size={16} />
              <Text style={styles.ratingText}>{p.avgRating.toFixed(1)} · {p.reviewCount} reviews</Text>
            </View>
          )}

          {p.description ? <Text style={styles.desc}>{p.description}</Text> : null}

          {p.variants?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Variants</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.variantRow}>
                {p.variants.map((v: any) => (
                  <View key={v.id} style={styles.variantChip}>
                    <Text style={styles.variantText}>{[v.size, v.color, v.material].filter(Boolean).join(' · ')}</Text>
                    {v.priceModifier !== 0 && (
                      <Text style={styles.variantPrice}>{v.priceModifier > 0 ? '+' : ''}฿{v.priceModifier}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.qtySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => q + 1)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              {reviews.slice(0, 3).map((r: any) => (
                <View key={r.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>{r.user?.fullName ?? 'User'}</Text>
                    <StarRating rating={r.rating} size={13} />
                  </View>
                  {r.body ? <Text style={styles.reviewBody}>{r.body}</Text> : null}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.addBar}>
        <View style={styles.addTotal}>
          <Text style={styles.addTotalLabel}>Total</Text>
          <Text style={styles.addTotalPrice}>฿{(p.basePrice * qty).toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, (adding || p.stockQty === 0) && styles.addBtnOff]}
          onPress={handleAdd}
          disabled={adding || p.stockQty === 0}
          activeOpacity={0.8}
        >
          <Text style={styles.addBtnText}>
            {p.stockQty === 0 ? 'Out of Stock' : added ? '✓ Added!' : adding ? 'Adding…' : 'Add to Cart'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: Colors.gray500 },
  header: { position: 'absolute', top: 52, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: Spacing.lg },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  backIcon: { fontSize: 20, color: Colors.gray900 },
  cartBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  cartIcon: { fontSize: 18 },
  hero: { width: '100%', height: 320 },
  noImg: { backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  noImgIcon: { fontSize: 48 },
  body: { padding: Spacing.lg, paddingBottom: 100 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  titleWrap: { flex: 1, marginRight: 12 },
  category: { fontSize: Typography.xs, fontWeight: '600', color: Colors.primary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  name: { fontSize: 22, fontWeight: '700', color: Colors.gray900, lineHeight: 28 },
  price: { fontSize: 22, fontWeight: '900', color: Colors.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  ratingText: { fontSize: Typography.sm, color: Colors.gray500 },
  desc: { fontSize: Typography.base, color: Colors.gray700, lineHeight: 22, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900, marginBottom: Spacing.sm },
  variantRow: { marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  variantChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.gray200, marginRight: 8, alignItems: 'center' },
  variantText: { fontSize: Typography.sm, color: Colors.gray700, fontWeight: '500' },
  variantPrice: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  qtySection: { marginBottom: Spacing.xl },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 0 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  qtyBtnText: { fontSize: 22, color: Colors.gray900, lineHeight: 24 },
  qtyValue: { width: 48, textAlign: 'center', fontSize: Typography.lg, fontWeight: '700', color: Colors.gray900 },
  reviewCard: { backgroundColor: Colors.gray50, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  reviewAuthor: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900 },
  reviewBody: { fontSize: Typography.sm, color: Colors.gray600, lineHeight: 18 },
  addBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderTopWidth: 1, borderTopColor: Colors.gray100, gap: 12 },
  addTotal: { flex: 1 },
  addTotalLabel: { fontSize: Typography.xs, color: Colors.gray500, marginBottom: 2 },
  addTotalPrice: { fontSize: 18, fontWeight: '900', color: Colors.gray900 },
  addBtn: { flex: 2, backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center' },
  addBtnOff: { opacity: 0.5 },
  addBtnText: { color: Colors.white, fontSize: Typography.base, fontWeight: '700' },
});
