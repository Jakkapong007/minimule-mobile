import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useQuery } from '../../graphql/hooks';
import { FEED, SHOWCASE } from '../../graphql/queries';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

const { width } = Dimensions.get('window');
const COL = 2;
const CARD_W = (width - Spacing.lg * 2 - Spacing.sm) / COL;

const TABS = ['For You', 'Showcase'] as const;

export function FeedScreen({ navigation }: any) {
  const [tab, setTab] = useState<typeof TABS[number]>('For You');
  const [refreshing, setRefreshing] = useState(false);

  const feedQ = useQuery(FEED, { variables: { limit: 30, offset: 0 }, skip: tab !== 'For You' });
  const showQ = useQuery(SHOWCASE, { variables: { limit: 30, offset: 0 }, skip: tab !== 'Showcase' });

  const q = tab === 'For You' ? feedQ : showQ;
  const posts: any[] = (tab === 'For You' ? q.data?.feed : q.data?.showcase) ?? [];

  async function onRefresh() {
    setRefreshing(true);
    await q.refetch?.();
    setRefreshing(false);
  }

  const leftCol = posts.filter((_, i) => i % 2 === 0);
  const rightCol = posts.filter((_, i) => i % 2 !== 0);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>mini</Text>
          <View style={styles.logoBadge}><Text style={styles.logoBadgeText}>MULE</Text></View>
        </View>
        <View style={styles.tabRow}>
          {TABS.map(t => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)} activeOpacity={0.8}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {q.loading && !posts.length ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={[{ key: 'masonry' }]}
          renderItem={() => (
            <View style={styles.masonryRow}>
              <View style={styles.col}>
                {leftCol.map(p => <PostCard key={p.id} post={p} nav={navigation} />)}
              </View>
              <View style={styles.col}>
                {rightCol.map(p => <PostCard key={p.id} post={p} nav={navigation} />)}
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function PostCard({ post, nav }: Readonly<{ post: any; nav: any }>) {
  const h = 160 + ((post.id.codePointAt(0) ?? 0) % 3) * 60;
  return (
    <TouchableOpacity
      style={[styles.card, { marginBottom: Spacing.sm }]}
      onPress={() => nav.navigate('PostDetail', { postId: post.id })}
      activeOpacity={0.92}
    >
      <View style={styles.imgWrap}>
        <Image source={{ uri: post.imageUrl }} style={[styles.cardImg, { height: h }]} resizeMode="cover" />
        <View style={styles.imgOverlay} />
        {post.isStickerDesign && (
          <View style={styles.stickerBadge}>
            <Text style={styles.stickerBadgeText}>🎯 Sticker</Text>
          </View>
        )}
      </View>
      <View style={styles.cardBody}>
        {post.caption ? <Text style={styles.caption} numberOfLines={2}>{post.caption}</Text> : null}
        <View style={styles.statsRow}>
          <Text style={styles.stat}>♥ {post.likeCount}</Text>
          {post.voteCount > 0 && <Text style={styles.stat}>▲ {post.voteCount}</Text>}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  topBar: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 0,
    ...Shadow.xs,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 14 },
  logoText: { fontSize: 24, fontWeight: '900', color: Colors.gray900, letterSpacing: -0.8 },
  logoBadge: { backgroundColor: Colors.primary, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, ...Shadow.primary },
  logoBadgeText: { fontSize: 14, fontWeight: '900', color: Colors.white, letterSpacing: 0.5 },
  tabRow: { flexDirection: 'row', gap: 6 },
  tab: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: Radius.full },
  tabActive: { backgroundColor: Colors.gray900 },
  tabText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray400, letterSpacing: 0.2 },
  tabTextActive: { color: Colors.white },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.lg, paddingBottom: 100 },
  masonryRow: { flexDirection: 'row', gap: Spacing.sm },
  col: { flex: 1 },

  card: { borderRadius: Radius.xl, overflow: 'hidden', backgroundColor: Colors.white, ...Shadow.sm },
  imgWrap: { position: 'relative' },
  cardImg: { width: '100%' },
  imgOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, backgroundColor: 'transparent' },
  stickerBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: Radius.full,
    paddingHorizontal: 9, paddingVertical: 3,
  },
  stickerBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.white },
  cardBody: { padding: 10 },
  caption: { fontSize: 12, color: Colors.gray700, lineHeight: 17, marginBottom: 6 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { fontSize: 11, color: Colors.gray400, fontWeight: '600' },
});
