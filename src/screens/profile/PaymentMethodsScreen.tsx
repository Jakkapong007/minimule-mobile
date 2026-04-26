import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '../../graphql/hooks';
import { MY_PAYMENT_METHODS, ADD_PAYMENT_METHOD, REMOVE_PAYMENT_METHOD, SET_DEFAULT_PAYMENT_METHOD } from '../../graphql/queries';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

const TYPE_ICONS: Record<string, string> = { visa: '💳', mastercard: '💳', amex: '💳', promptpay: '📱', bank_transfer: '🏦', credit_card: '💳' };
const TYPE_LABELS: Record<string, string> = { credit_card: '💳 Card', promptpay: '📱 PromptPay', bank_transfer: '🏦 Bank' };

function methodLabel(m: any): string {
  if (m.type === 'credit_card') return `${m.brand ?? 'Card'} •••• ${m.lastFour ?? '****'}`;
  if (m.type === 'promptpay') return 'PromptPay';
  return 'Bank Transfer';
}

export function PaymentMethodsScreen({ navigation }: any) {
  const { data, loading, refetch } = useQuery(MY_PAYMENT_METHODS);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'credit_card' | 'promptpay' | 'bank_transfer'>('credit_card');
  const [last4, setLast4] = useState('');
  const [brand, setBrand] = useState('');
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const [addMethod] = useMutation(ADD_PAYMENT_METHOD);
  const [removeMethod] = useMutation(REMOVE_PAYMENT_METHOD);
  const [setDefault] = useMutation(SET_DEFAULT_PAYMENT_METHOD);

  const methods: any[] = data?.myPaymentMethods ?? [];

  async function handleSave() {
    setSaving(true);
    try {
      await addMethod({ variables: { input: { type, last4Digits: last4 || null, brand: brand || null, isDefault: methods.length === 0 } } });
      refetch();
      setShowForm(false);
      setLast4('');
      setBrand('');
    } catch (e: any) {
      alert(e.message ?? 'Failed to add payment method');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await removeMethod({ variables: { id } });
      refetch();
    } catch (e: any) {
      alert(e.message ?? 'Failed to remove');
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await setDefault({ variables: { id } });
      refetch();
    } catch (e: any) {
      alert(e.message ?? 'Failed to set default');
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Payment Methods</Text>
        <TouchableOpacity style={styles.addBtnWrap} onPress={() => setShowForm(v => !v)} activeOpacity={0.7}>
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add Payment Method</Text>
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.typeRow}>
              {(['credit_card', 'promptpay', 'bank_transfer'] as const).map(t => (
                <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]} onPress={() => setType(t)} activeOpacity={0.8}>
                  <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>{TYPE_LABELS[t]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {type === 'credit_card' && (
              <>
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Card Brand</Text>
                  <TextInput
                    style={[styles.fieldInput, focused === 'brand' && styles.fieldInputFocused]}
                    value={brand} onChangeText={setBrand}
                    placeholder="Visa, Mastercard…"
                    placeholderTextColor={Colors.gray300}
                    onFocus={() => setFocused('brand')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Last 4 digits</Text>
                  <TextInput
                    style={[styles.fieldInput, focused === 'last4' && styles.fieldInputFocused]}
                    value={last4} onChangeText={setLast4}
                    placeholder="1234"
                    placeholderTextColor={Colors.gray300}
                    keyboardType="numeric" maxLength={4}
                    onFocus={() => setFocused('last4')}
                    onBlur={() => setFocused(null)}
                  />
                </View>
              </>
            )}
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        )}

        {methods.length === 0 && !showForm && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No payment methods</Text>
            <Text style={styles.emptySubtitle}>Add a payment method to checkout faster</Text>
          </View>
        )}

        {methods.map((m: any) => (
          <View key={m.id} style={[styles.methodCard, m.isDefault && styles.methodCardDefault]}>
            {m.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
              </View>
            )}
            <View style={styles.methodRow}>
              <View style={styles.methodIconWrap}>
                <Text style={styles.methodIcon}>{TYPE_ICONS[m.brand?.toLowerCase() ?? ''] ?? TYPE_ICONS[m.type] ?? '💳'}</Text>
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{methodLabel(m)}</Text>
                <Text style={styles.methodType}>{m.type.replace('_', ' ').toUpperCase()}</Text>
              </View>
            </View>
            <View style={styles.methodActions}>
              {!m.isDefault && (
                <TouchableOpacity onPress={() => handleSetDefault(m.id)} activeOpacity={0.7}>
                  <Text style={styles.defaultLinkText}>Set as Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleRemove(m.id)} activeOpacity={0.7}>
                <Text style={styles.removeLinkText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.backgroundDark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingTop: 56, paddingBottom: 14,
    backgroundColor: Colors.white, ...Shadow.xs,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  backIcon: { fontSize: 18, color: Colors.gray900 },
  navTitle: { fontSize: Typography.lg, fontWeight: '800', color: Colors.gray900, letterSpacing: -0.3 },
  addBtnWrap: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: Colors.primaryBg, borderRadius: Radius.full },
  addBtnText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '700' },

  scroll: { padding: Spacing.base, gap: 12, paddingBottom: 40 },

  formCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.base, ...Shadow.sm },
  formTitle: { fontSize: Typography.base, fontWeight: '800', color: Colors.gray900, marginBottom: 14, letterSpacing: -0.2 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.gray200, alignItems: 'center', backgroundColor: Colors.gray50 },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  typeBtnText: { fontSize: Typography.xs, fontWeight: '700', color: Colors.gray600 },
  typeBtnTextActive: { color: Colors.primary },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: Typography.xs, fontWeight: '700', color: Colors.gray500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.lg, paddingHorizontal: Spacing.base, paddingVertical: 12, fontSize: Typography.base, color: Colors.gray900, backgroundColor: Colors.gray50 },
  fieldInputFocused: { borderColor: Colors.primary, backgroundColor: Colors.white },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', marginTop: 4, ...Shadow.primary },
  saveBtnText: { color: Colors.white, fontWeight: '800', fontSize: Typography.base },

  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyIcon: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.gray900, letterSpacing: -0.3 },
  emptySubtitle: { fontSize: Typography.sm, color: Colors.gray500, textAlign: 'center' },

  methodCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1.5, borderColor: Colors.gray200, ...Shadow.xs },
  methodCardDefault: { borderColor: Colors.primary },
  defaultBadge: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 12 },
  defaultBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 0.8 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  methodIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  methodIcon: { fontSize: 24 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },
  methodType: { fontSize: Typography.xs, color: Colors.gray500, marginTop: 3, fontWeight: '600', letterSpacing: 0.5 },
  methodActions: { flexDirection: 'row', gap: 16, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  defaultLinkText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '700' },
  removeLinkText: { fontSize: Typography.sm, color: Colors.error, fontWeight: '700' },
});
