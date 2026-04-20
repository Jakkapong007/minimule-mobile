import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery } from '../../graphql/hooks';
import { CREATE_POST, CATEGORIES } from '../../graphql/queries';
import { Colors, Radius, Spacing, Typography } from '../../theme';

export function CreatePostScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState('');
  const [caption, setCaption] = useState('');
  const [isSticker, setIsSticker] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const { data: catData } = useQuery(CATEGORIES);
  const [createPost, { loading }] = useMutation(CREATE_POST);
  const categories = catData?.categories ?? [];

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { alert('Camera roll permission is required.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85, allowsEditing: true });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  }

  async function handleShare() {
    if (!imageUri) { alert('Please select an image.'); return; }
    try {
      await createPost({
        variables: {
          input: {
            imageUrl: imageUri,
            caption: caption.trim() || null,
            isStickerDesign: isSticker,
            visibility,
            categoryId: categoryId ?? null,
          },
        },
      });
      navigation.navigate('Feed');
    } catch (e: any) {
      alert(e.message ?? 'Failed to post');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
        <Text style={styles.navTitle}>New Post</Text>
        <TouchableOpacity style={[styles.shareBtn, (!imageUri || loading) && styles.shareBtnOff]} onPress={handleShare} disabled={!imageUri || loading}>
          {loading ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.shareBtnText}>Share</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderIcon}>📷</Text>
              <Text style={styles.placeholderText}>Tap to choose a photo</Text>
              <Text style={styles.placeholderSub}>JPG, PNG up to 10MB</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.formSection}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={styles.captionInput}
            placeholder="Tell your story…"
            placeholderTextColor={Colors.gray400}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{caption.length}/500</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
            {categories.map((c: any) => (
              <TouchableOpacity key={c.id} style={[styles.catChip, categoryId === c.id && styles.catChipActive]} onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}>
                <Text style={[styles.catChipText, categoryId === c.id && styles.catChipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formSection}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>🎯 Sticker Design</Text>
              <Text style={styles.toggleSub}>Allow others to order as a sticker</Text>
            </View>
            <Switch value={isSticker} onValueChange={setIsSticker} trackColor={{ true: Colors.primary }} thumbColor={Colors.white} />
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.label}>Visibility</Text>
          <View style={styles.visRow}>
            {(['public', 'private'] as const).map(v => (
              <TouchableOpacity key={v} style={[styles.visBtn, visibility === v && styles.visBtnActive]} onPress={() => setVisibility(v)}>
                <Text style={styles.visIcon}>{v === 'public' ? '🌐' : '🔒'}</Text>
                <Text style={[styles.visText, visibility === v && styles.visTextActive]}>{v === 'public' ? 'Public' : 'Private'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  cancel: { fontSize: Typography.base, color: Colors.gray600 },
  navTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },
  shareBtn: { backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 8, borderRadius: Radius.full },
  shareBtnOff: { opacity: 0.4 },
  shareBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.sm },
  scroll: { paddingBottom: 60 },
  imagePicker: { margin: Spacing.lg, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 2, borderColor: Colors.gray200, borderStyle: 'dashed' },
  preview: { width: '100%', height: 280 },
  placeholder: { height: 220, justifyContent: 'center', alignItems: 'center', gap: 8 },
  placeholderIcon: { fontSize: 44 },
  placeholderText: { fontSize: Typography.base, fontWeight: '600', color: Colors.gray700 },
  placeholderSub: { fontSize: Typography.sm, color: Colors.gray400 },
  formSection: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray700, marginBottom: 8, marginTop: Spacing.lg },
  captionInput: { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.md, padding: 12, fontSize: Typography.base, color: Colors.gray900, minHeight: 80, textAlignVertical: 'top' },
  charCount: { fontSize: Typography.xs, color: Colors.gray400, textAlign: 'right', marginTop: 4 },
  catRow: { marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.gray200, marginRight: 8 },
  catChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  catChipText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray600 },
  catChipTextActive: { color: Colors.primary },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Spacing.lg },
  toggleLabel: { fontSize: Typography.base, fontWeight: '600', color: Colors.gray900 },
  toggleSub: { fontSize: Typography.sm, color: Colors.gray500, marginTop: 2 },
  visRow: { flexDirection: 'row', gap: 10 },
  visBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.gray200 },
  visBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  visIcon: { fontSize: 16 },
  visText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray600 },
  visTextActive: { color: Colors.primary },
});
