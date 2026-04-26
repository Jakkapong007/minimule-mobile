import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '../../graphql/hooks';
import { PRODUCTS, CATEGORIES } from '../../graphql/queries';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

const { width } = Dimensions.get('window');
const CARD_W = (width - Spacing.lg * 2 - Spacing.sm) / 2;

const SORT_OPTIONS = [
  { label: 'Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
];

export function ShopScreen({ navigation }: any) {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [sort, setSort] = useState('popular');
  const [featured, setFeatured] = useState(false);

  const { data: catData } = useQuery(CATEGORIES);
  const { data: prodData, loading } = useQuery(PRODUCTS, {
    variables: { limit: 40, offset: 0, categoryId: selectedCat, isFeatured: featured || undefined, sort },
  });

  const categories = catData?.categories ?? [];
  const products: any[] = prodData?.products ?? [];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.titleRow}>
          <Text style={styles.heading}>Shop</Text>
          <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('Search')} activeOpacity={0.8}>
            <Text style={styles.searchBtnIcon}>🔍</Text>
            <Text style={styles.searchBtnText}>Search products…</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, !selectedCat && styles.chipActive]}
            onPress={() => setSelectedCat(null)}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, !selectedCat && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((c: any) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.chip, selectedCat === c.id && styles.chipActive]}
              onPress={() => setSelectedCat(selectedCat === c.id ? null : c.id)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, selectedCat === c.id && styles.chipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {SORT_OPTIONS.map(o => (
              <TouchableOpacity
                key={o.value}
                style={[styles.sortBtn, sort === o.value && styles.sortBtnActive]}
                onPress={() => setSort(o.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.sortText, sort === o.value && styles.sortTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.sortBtn, featured && styles.sortBtnActive]}
              onPress={() => setFeatured(f => !f)}
              activeOpacity={0.8}
            >
              <Text style={[styles.sortText, featured && styles.sortTextActive]}>⭐ Featured</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
        ) : (
          <View style={styles.grid}>
            {products.map((p: any) => (
              <TouchableOpacity
                key={p.id}
                style={styles.card}
                onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
                activeOpacity={0.88}
              >
                <View style={styles.imgWrap}>
                  {p.images?.[0] ? (
                    <Image
                      source={{ uri: p.images.find((i: any) => i.isPrimary)?.imageUrl ?? p.images[0].imageUrl }}
                      style={styles.cardImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.cardImg, styles.noImg]}>
                      <Text style={styles.noImgText}>📦</Text>
                    </View>
                  )}
                  {p.isFeatured && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredText}>Featured</Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
                  {p.avgRating > 0 && (
                    <View style={styles.ratingRow}>
                      <Text style={styles.star}>★</Text>
                      <Text style={styles.ratingText}>{p.avgRating.toFixed(1)}</Text>
                      <Text style={styles.reviewCount}>({p.reviewCount})</Text>
                    </View>
                  )}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>฿{p.basePrice.toLocaleString()}</Text>
                    {p.stockQty === 0 && <Text style={styles.outOfStock}>Out of stock</Text>}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            {products.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🛍️</Text>
                <Text style={styles.emptyText}>No products found</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.base,
    backgroundColor: Colors.white,
    ...Shadow.xs,
  },
  titleRow: { gap: 12 },
  heading: { fontSize: 28, fontWeight: '900', color: Colors.gray900, letterSpacing: -0.8 },
  searchBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 11,
    gap: 8,
  },
  searchBtnIcon: { fontSize: 14 },
  searchBtnText: { fontSize: Typography.sm, color: Colors.gray400, flex: 1 },

  chips: { paddingHorizontal: Spacing.lg, paddingVertical: 14, gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1.5, borderColor: Colors.gray200,
    ...Shadow.xs,
  },
  chipActive: { backgroundColor: Colors.gray900, borderColor: Colors.gray900 },
  chipText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray600 },
  chipTextActive: { color: Colors.white },

  filterRow: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.base },
  sortBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.gray200,
  },
  sortBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortText: { fontSize: 12, fontWeight: '600', color: Colors.gray600 },
  sortTextActive: { color: Colors.white },

  center: { paddingVertical: 80, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },

  card: { width: CARD_W, borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: Colors.white, ...Shadow.sm },
  imgWrap: { position: 'relative' },
  cardImg: { width: '100%', height: 170 },
  noImg: { backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  noImgText: { fontSize: 36 },
  featuredBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: Radius.full,
    ...Shadow.primary,
  },
  featuredText: { fontSize: 10, fontWeight: '800', color: Colors.white, letterSpacing: 0.3 },

  cardBody: { padding: 12 },
  productName: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900, lineHeight: 19, marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  star: { fontSize: 11, color: Colors.warning },
  ratingText: { fontSize: 11, fontWeight: '700', color: Colors.gray700 },
  reviewCount: { fontSize: 11, color: Colors.gray400 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: Typography.base, fontWeight: '800', color: Colors.primary },
  outOfStock: { fontSize: 10, fontWeight: '600', color: Colors.gray400 },

  empty: { width: '100%', paddingVertical: 60, alignItems: 'center', gap: 10 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: Colors.gray400, fontSize: Typography.base, fontWeight: '500' },
});
