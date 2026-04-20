import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [sort, setSort] = useState('popular');
  const [featured, setFeatured] = useState(false);

  const { data: catData } = useQuery(CATEGORIES);
  const { data: prodData, loading } = useQuery(PRODUCTS, {
    variables: { limit: 40, offset: 0, categoryId: selectedCat, isFeatured: featured || undefined, sort },
  });

  const categories = catData?.categories ?? [];
  const products: any[] = (prodData?.products ?? []).filter((p: any) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.heading}>Shop</Text>
        <TouchableOpacity style={styles.searchRow} onPress={() => navigation.navigate('Search')}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search products…</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <TouchableOpacity style={[styles.chip, !selectedCat && styles.chipActive]} onPress={() => setSelectedCat(null)}>
            <Text style={[styles.chipText, !selectedCat && styles.chipTextActive]}>All</Text>
          </TouchableOpacity>
          {categories.map((c: any) => (
            <TouchableOpacity key={c.id} style={[styles.chip, selectedCat === c.id && styles.chipActive]} onPress={() => setSelectedCat(selectedCat === c.id ? null : c.id)}>
              <Text style={[styles.chipText, selectedCat === c.id && styles.chipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort + featured */}
        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SORT_OPTIONS.map(o => (
              <TouchableOpacity key={o.value} style={[styles.sortBtn, sort === o.value && styles.sortBtnActive]} onPress={() => setSort(o.value)}>
                <Text style={[styles.sortText, sort === o.value && styles.sortTextActive]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.sortBtn, featured && styles.sortBtnActive]} onPress={() => setFeatured(f => !f)}>
              <Text style={[styles.sortText, featured && styles.sortTextActive]}>⭐ Featured</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
        ) : (
          <View style={styles.grid}>
            {products.map((p: any) => (
              <TouchableOpacity key={p.id} style={styles.card} onPress={() => navigation.navigate('ProductDetail', { productId: p.id })} activeOpacity={0.85}>
                <View style={styles.imgWrap}>
                  {p.images?.[0] ? (
                    <Image source={{ uri: p.images.find((i: any) => i.isPrimary)?.imageUrl ?? p.images[0].imageUrl }} style={styles.cardImg} resizeMode="cover" />
                  ) : (
                    <View style={[styles.cardImg, styles.noImg]}><Text style={styles.noImgText}>📦</Text></View>
                  )}
                  {p.isFeatured && <View style={styles.featuredBadge}><Text style={styles.featuredText}>Featured</Text></View>}
                </View>
                <View style={styles.cardBody}>
                  <Text style={styles.productName} numberOfLines={2}>{p.name}</Text>
                  {p.avgRating > 0 && (
                    <View style={styles.ratingRow}>
                      <Text style={styles.star}>★</Text>
                      <Text style={styles.ratingText}>{p.avgRating.toFixed(1)} ({p.reviewCount})</Text>
                    </View>
                  )}
                  <Text style={styles.price}>฿{p.basePrice.toLocaleString()}</Text>
                </View>
              </TouchableOpacity>
            ))}
            {products.length === 0 && (
              <View style={styles.empty}><Text style={styles.emptyText}>No products found</Text></View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  topBar: { paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: Spacing.md, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  heading: { fontSize: 26, fontWeight: '900', color: Colors.gray900, letterSpacing: -0.5, marginBottom: 12 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray50, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 10, gap: 8, borderWidth: 1, borderColor: Colors.gray200 },
  searchIcon: { fontSize: 14 },
  searchPlaceholder: { fontSize: Typography.sm, color: Colors.gray400 },
  chips: { paddingHorizontal: Spacing.lg, paddingVertical: 12, gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.gray200, backgroundColor: Colors.white },
  chipActive: { backgroundColor: Colors.gray900, borderColor: Colors.gray900 },
  chipText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray600 },
  chipTextActive: { color: Colors.white },
  filterRow: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, marginRight: 6, backgroundColor: Colors.gray50 },
  sortBtnActive: { backgroundColor: Colors.primaryBg },
  sortText: { fontSize: 12, fontWeight: '600', color: Colors.gray600 },
  sortTextActive: { color: Colors.primary },
  center: { paddingVertical: 60, alignItems: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.sm, paddingBottom: 100 },
  card: { width: CARD_W, borderRadius: Radius.lg, overflow: 'hidden', backgroundColor: Colors.white, ...Shadow.sm, borderWidth: 1, borderColor: Colors.gray100 },
  imgWrap: { position: 'relative' },
  cardImg: { width: '100%', height: 160 },
  noImg: { backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  noImgText: { fontSize: 32 },
  featuredBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
  featuredText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  cardBody: { padding: 10 },
  productName: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray900, lineHeight: 18, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  star: { fontSize: 11, color: Colors.warning },
  ratingText: { fontSize: 11, color: Colors.gray500 },
  price: { fontSize: Typography.base, fontWeight: '700', color: Colors.primary },
  empty: { width: '100%', paddingVertical: 60, alignItems: 'center' },
  emptyText: { color: Colors.gray400, fontSize: Typography.base },
});
