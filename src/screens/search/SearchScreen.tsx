import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '../../graphql/hooks';
import { SEARCH_PRODUCTS, MY_SEARCH_HISTORY, CLEAR_SEARCH_HISTORY } from '../../graphql/queries';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

export function SearchScreen({ navigation }: any) {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');

  const { data: searchData, loading } = useQuery(SEARCH_PRODUCTS, {
    variables: { query: submitted, limit: 20 },
    skip: !submitted,
  });
  const { data: historyData, refetch: refetchHistory } = useQuery(MY_SEARCH_HISTORY);
  const [clearHistory] = useMutation(CLEAR_SEARCH_HISTORY);

  const results: any[] = searchData?.searchProducts?.products ?? [];
  const history: string[] = historyData?.mySearchHistory ?? [];

  function submit(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setSubmitted(trimmed);
    refetchHistory();
  }

  async function handleClearHistory() {
    await clearHistory({});
    refetchHistory();
  }

  const showHistory = !submitted;
  const showLoading = !!submitted && loading;
  const showEmpty = !!submitted && !loading && results.length === 0;
  const showResults = !!submitted && !loading && results.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products…"
            placeholderTextColor={Colors.gray400}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => submit(query)}
            returnKeyType="search"
            autoFocus
          />
          {!!query && (
            <TouchableOpacity
              style={styles.clearXBtn}
              onPress={() => { setQuery(''); setSubmitted(''); }}
              activeOpacity={0.7}
            >
              <Text style={styles.clearX}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showHistory && (
        <View style={styles.historySection}>
          {history.length > 0 ? (
            <>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Recent Searches</Text>
                <TouchableOpacity onPress={handleClearHistory} activeOpacity={0.7}>
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
              </View>
              {history.map(h => (
                <TouchableOpacity key={h} style={styles.historyItem} onPress={() => submit(h)} activeOpacity={0.75}>
                  <View style={styles.historyIconWrap}>
                    <Text style={styles.historyIconText}>🕐</Text>
                  </View>
                  <Text style={styles.historyText}>{h}</Text>
                  <Text style={styles.historyArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>Search Products</Text>
              <Text style={styles.emptySubtitle}>Find stickers, prints, and more</Text>
            </View>
          )}
        </View>
      )}

      {showLoading && (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      )}

      {showEmpty && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>😕</Text>
          <Text style={styles.emptyTitle}>No results for "{submitted}"</Text>
          <Text style={styles.emptySubtitle}>Try a different keyword</Text>
        </View>
      )}

      {showResults && (
        <FlatList
          data={results}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: p }) => (
            <TouchableOpacity
              style={styles.resultCard}
              onPress={() => navigation.navigate('ShopTab', { screen: 'ProductDetail', params: { productId: p.id } })}
              activeOpacity={0.85}
            >
              {p.images?.[0]?.imageUrl ? (
                <Image source={{ uri: p.images[0].imageUrl }} style={styles.resultImg} resizeMode="cover" />
              ) : (
                <View style={[styles.resultImg, styles.noImg]}><Text style={{ fontSize: 28 }}>📦</Text></View>
              )}
              <View style={styles.resultInfo}>
                <Text style={styles.resultName} numberOfLines={2}>{p.name}</Text>
                {p.avgRating > 0 && (
                  <Text style={styles.resultRating}>{'★'.repeat(Math.round(p.avgRating))} ({p.reviewCount})</Text>
                )}
                <Text style={styles.resultPrice}>฿{p.price?.toLocaleString()}</Text>
                {p.stockQty === 0 && <Text style={styles.outOfStock}>Out of Stock</Text>}
              </View>
              <Text style={styles.resultArrow}>›</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  navBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.base, paddingTop: 56, paddingBottom: 14,
    backgroundColor: Colors.white,
    ...Shadow.xs,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: Colors.gray900 },
  searchBox: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.gray100,
    borderRadius: Radius.full,
    paddingHorizontal: 14, height: 44, gap: 8,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: Typography.base, color: Colors.gray900 },
  clearXBtn: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.gray300, justifyContent: 'center', alignItems: 'center' },
  clearX: { fontSize: 11, color: Colors.white, fontWeight: '700' },

  historySection: { flex: 1, backgroundColor: Colors.white },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.base, paddingTop: 20, paddingBottom: 10,
  },
  historyTitle: { fontSize: Typography.sm, fontWeight: '800', color: Colors.gray900, letterSpacing: -0.2 },
  clearAllText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },
  historyItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.base, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  historyIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  historyIconText: { fontSize: 15 },
  historyText: { flex: 1, fontSize: Typography.base, color: Colors.gray800, fontWeight: '500' },
  historyArrow: { fontSize: 20, color: Colors.gray300 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 10 },
  emptyIcon: { fontSize: 56, marginBottom: 6 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.gray900, letterSpacing: -0.3 },
  emptySubtitle: { fontSize: Typography.sm, color: Colors.gray500 },

  list: { padding: Spacing.base, gap: 10, paddingBottom: 40 },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    padding: 12,
    ...Shadow.xs,
  },
  resultImg: { width: 80, height: 80, borderRadius: Radius.lg, backgroundColor: Colors.gray100 },
  noImg: { justifyContent: 'center', alignItems: 'center' },
  resultInfo: { flex: 1 },
  resultName: { fontSize: Typography.base, fontWeight: '600', color: Colors.gray900, marginBottom: 4, lineHeight: 20 },
  resultRating: { fontSize: Typography.xs, color: Colors.warning, marginBottom: 4, fontWeight: '600' },
  resultPrice: { fontSize: Typography.base, fontWeight: '800', color: Colors.primary },
  outOfStock: { fontSize: Typography.xs, color: Colors.gray400, marginTop: 2, fontWeight: '500' },
  resultArrow: { fontSize: 22, color: Colors.gray300 },
});
