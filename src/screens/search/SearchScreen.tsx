import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '../../graphql/hooks';
import { SEARCH_PRODUCTS, MY_SEARCH_HISTORY, CLEAR_SEARCH_HISTORY } from '../../graphql/queries';
import { Colors, Radius, Spacing, Typography } from '../../theme';

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
            <TouchableOpacity onPress={() => { setQuery(''); setSubmitted(''); }}>
              <Text style={styles.clearBtn}>✕</Text>
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
                <TouchableOpacity onPress={handleClearHistory}>
                  <Text style={styles.clearAll}>Clear all</Text>
                </TouchableOpacity>
              </View>
              {history.map((h) => (
                <TouchableOpacity key={h} style={styles.historyItem} onPress={() => submit(h)}>
                  <Text style={styles.historyIcon}>🕐</Text>
                  <Text style={styles.historyText}>{h}</Text>
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
          <ActivityIndicator color={Colors.primary} />
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
                <Text style={styles.resultPrice}>฿{p.price.toLocaleString()}</Text>
                {p.stockQty === 0 && <Text style={styles.outOfStock}>Out of Stock</Text>}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  backIcon: { fontSize: 22, color: Colors.gray900 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray50, borderRadius: Radius.full, paddingHorizontal: 14, height: 42, gap: 8 },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: Typography.base, color: Colors.gray900 },
  clearBtn: { fontSize: 14, color: Colors.gray400, padding: 2 },
  historySection: { flex: 1 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  historyTitle: { fontSize: Typography.sm, fontWeight: '700', color: Colors.gray900 },
  clearAll: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  historyIcon: { fontSize: 16 },
  historyText: { fontSize: Typography.base, color: Colors.gray700 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray900, marginBottom: 8 },
  emptySubtitle: { fontSize: Typography.sm, color: Colors.gray500 },
  list: { padding: Spacing.lg, gap: 2 },
  resultCard: { flexDirection: 'row', gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  resultImg: { width: 80, height: 80, borderRadius: Radius.md, backgroundColor: Colors.gray100 },
  noImg: { justifyContent: 'center', alignItems: 'center' },
  resultInfo: { flex: 1, justifyContent: 'center' },
  resultName: { fontSize: Typography.base, fontWeight: '600', color: Colors.gray900, marginBottom: 4 },
  resultRating: { fontSize: Typography.xs, color: Colors.warning, marginBottom: 4 },
  resultPrice: { fontSize: Typography.base, fontWeight: '800', color: Colors.primary },
  outOfStock: { fontSize: Typography.xs, color: Colors.gray400, marginTop: 2 },
});
