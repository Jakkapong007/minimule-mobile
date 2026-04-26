import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery } from '../../graphql/hooks';
import { CREATE_POST, CATEGORIES } from '../../graphql/queries';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

const VISIBILITY_OPTIONS = [
  { value: 'public' as const, icon: '🌐', label: 'Public' },
  { value: 'private' as const, icon: '🔒', label: 'Private' },
];

export function CreatePostScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState('');
  const [caption, setCaption] = useState('');
  const [isSticker, setIsSticker] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [captionFocused, setCaptionFocused] = useState(false);

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>New Post</Text>
        <TouchableOpacity
          style={[styles.shareBtn, (!imageUri || loading) && styles.shareBtnOff]}
          onPress={handleShare}
          disabled={!imageUri || loading}
        >
          {loading
            ? <ActivityIndicator size="small" color={Colors.white} />
            : <Text style={styles.shareBtnText}>Share</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.85}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          ) : (
            <View style={styles.placeholder}>
              <View style={styles.placeholderIconWrap}>
                <Text style={styles.placeholderIcon}>📷</Text>
              </View>
              <Text style={styles.placeholderText}>Tap to choose a photo</Text>
              <Text style={styles.placeholderSub}>JPG, PNG up to 10MB</Text>
            </View>
          )}
          {!!imageUri && (
            <View style={styles.changeOverlay}>
              <Text style={styles.changeOverlayText}>Change</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={[styles.captionInput, captionFocused && styles.captionInputFocus]}
            placeholder="Tell your story…"
            placeholderTextColor={Colors.gray400}
            value={caption}
            onChangeText={setCaption}
            onFocus={() => setCaptionFocused(true)}
            onBlur={() => setCaptionFocused(false)}
            multiline
            maxLength={500}
          />
          <Text style={styles.charCount}>{caption.length}/500</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow} contentContainerStyle={styles.catRowContent}>
            {categories.map((c: any) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catChip, categoryId === c.id && styles.catChipActive]}
                onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
              >
                <Text style={[styles.catChipText, categoryId === c.id && styles.catChipTextActive]}>{c.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>🎯 Sticker Design</Text>
              <Text style={styles.toggleSub}>Allow others to order this as a sticker</Text>
            </View>
            <Switch
              value={isSticker}
              onValueChange={setIsSticker}
              trackColor={{ false: Colors.gray200, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Visibility</Text>
          <View style={styles.visRow}>
            {VISIBILITY_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.visBtn, visibility === opt.value && styles.visBtnActive]}
                onPress={() => setVisibility(opt.value)}
              >
                <Text style={styles.visIcon}>{opt.icon}</Text>
                <Text style={[styles.visText, visibility === opt.value && styles.visTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark ?? Colors.gray50 },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: 14,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100,
  },
  cancelBtn: { minWidth: 60 },
  cancel: { fontSize: Typography.base, color: Colors.gray500 },
  navTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },
  shareBtn: { backgroundColor: Colors.primary, paddingHorizontal: 20, paddingVertical: 9, borderRadius: Radius.full, minWidth: 60, alignItems: 'center', ...Shadow.primary },
  shareBtnOff: { opacity: 0.4, ...Shadow.sm },
  shareBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.sm },
  scroll: { paddingBottom: 60 },
  imagePicker: { margin: Spacing.lg, borderRadius: Radius.xl, overflow: 'hidden', borderWidth: 2, borderColor: Colors.gray200, borderStyle: 'dashed', backgroundColor: Colors.white },
  preview: { width: '100%', height: 300 },
  placeholder: { height: 220, justifyContent: 'center', alignItems: 'center', gap: 10 },
  placeholderIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  placeholderIcon: { fontSize: 32 },
  placeholderText: { fontSize: Typography.base, fontWeight: '600', color: Colors.gray700 },
  placeholderSub: { fontSize: Typography.sm, color: Colors.gray400 },
  changeOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 8, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center' },
  changeOverlayText: { color: Colors.white, fontSize: Typography.sm, fontWeight: '600' },
  card: { marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadow.xs },
  label: { fontSize: Typography.xs, fontWeight: '700', color: Colors.gray500, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  captionInput: { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.md, padding: 12, fontSize: Typography.base, color: Colors.gray900, minHeight: 88, textAlignVertical: 'top' },
  captionInputFocus: { borderColor: Colors.primary, backgroundColor: Colors.white },
  charCount: { fontSize: Typography.xs, color: Colors.gray400, textAlign: 'right', marginTop: 6 },
  catRow: { marginHorizontal: -4 },
  catRowContent: { paddingHorizontal: 4, gap: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.gray200 },
  catChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  catChipText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray600 },
  catChipTextActive: { color: Colors.primary },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleLabel: { fontSize: Typography.base, fontWeight: '600', color: Colors.gray900 },
  toggleSub: { fontSize: Typography.sm, color: Colors.gray500, marginTop: 3 },
  visRow: { flexDirection: 'row', gap: 10 },
  visBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.gray200 },
  visBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  visIcon: { fontSize: 16 },
  visText: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray600 },
  visTextActive: { color: Colors.primary },
});
