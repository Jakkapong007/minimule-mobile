import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation, useQuery } from '../../graphql/hooks';
import { MY_PAYMENT_METHODS, ADD_PAYMENT_METHOD, REMOVE_PAYMENT_METHOD, SET_DEFAULT_PAYMENT_METHOD } from '../../graphql/queries';
import { Colors, Radius, Spacing, Typography } from '../../theme';

const CARD_ICONS: Record<string, string> = { visa: '💳', mastercard: '💳', amex: '💳', promptpay: '📱', bank_transfer: '🏦' };

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

  const [addMethod] = useMutation(ADD_PAYMENT_METHOD);
  const [removeMethod] = useMutation(REMOVE_PAYMENT_METHOD);
  const [setDefault] = useMutation(SET_DEFAULT_PAYMENT_METHOD);

  const methods: any[] = data?.myPaymentMethods ?? [];

  async function handleSave() {
    setSaving(true);
    try {
      await addMethod({
        variables: {
          input: {
            type,
            last4Digits: last4 || null,
            brand: brand || null,
            isDefault: methods.length === 0,
          },
        },
      });
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

  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={() => setShowForm(v => !v)}>
          <Text style={styles.addBtn}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add Payment Method</Text>
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.typeRow}>
              {(['credit_card', 'promptpay', 'bank_transfer'] as const).map(t => (
                <TouchableOpacity key={t} style={[styles.typeBtn, type === t && styles.typeBtnActive]} onPress={() => setType(t)}>
                  <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>
                    {t === 'credit_card' ? '💳 Card' : t === 'promptpay' ? '📱 PromptPay' : '🏦 Bank'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {type === 'credit_card' && (
              <>
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Card Brand (Visa, Mastercard…)</Text>
                  <TextInput style={styles.fieldInput} value={brand} onChangeText={setBrand} placeholder="Visa" placeholderTextColor={Colors.gray400} />
                </View>
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Last 4 digits</Text>
                  <TextInput style={styles.fieldInput} value={last4} onChangeText={setLast4} placeholder="1234" placeholderTextColor={Colors.gray400} keyboardType="numeric" maxLength={4} />
                </View>
              </>
            )}
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.saveBtnText}>Save</Text>}
            </TouchableOpacity>
          </View>
        )}

        {methods.length === 0 && !showForm ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>💳</Text>
            <Text style={styles.emptyTitle}>No payment methods</Text>
            <Text style={styles.emptySubtitle}>Add a payment method to checkout faster</Text>
          </View>
        ) : (
          methods.map((m: any) => (
            <View key={m.id} style={[styles.methodCard, m.isDefault && styles.methodCardDefault]}>
              {m.isDefault && (
                <View style={styles.defaultBadge}><Text style={styles.defaultBadgeText}>DEFAULT</Text></View>
              )}
              <View style={styles.methodRow}>
                <Text style={styles.methodIcon}>{CARD_ICONS[m.brand?.toLowerCase() ?? ''] ?? CARD_ICONS[m.type] ?? '💳'}</Text>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{methodLabel(m)}</Text>
                  <Text style={styles.methodType}>{m.type.replace('_', ' ').toUpperCase()}</Text>
                </View>
              </View>
              <View style={styles.methodActions}>
                {!m.isDefault && (
                  <TouchableOpacity onPress={() => handleSetDefault(m.id)}>
                    <Text style={styles.actionLinkText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => handleRemove(m.id)}>
                  <Text style={styles.removeLinkText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  backIcon: { fontSize: 22, color: Colors.gray900, width: 32 },
  navTitle: { fontSize: Typography.lg, fontWeight: '700', color: Colors.gray900 },
  addBtn: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '700' },
  scroll: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  formCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg },
  formTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900, marginBottom: 12 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  typeBtn: { flex: 1, paddingVertical: 9, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.gray200, alignItems: 'center' },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  typeBtnText: { fontSize: Typography.xs, fontWeight: '600', color: Colors.gray600 },
  typeBtnTextActive: { color: Colors.primary },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: Typography.xs, fontWeight: '600', color: Colors.gray600, marginBottom: 4 },
  fieldInput: { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: Typography.base, color: Colors.gray900 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.base },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray900 },
  emptySubtitle: { fontSize: Typography.sm, color: Colors.gray500, textAlign: 'center' },
  methodCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.gray200 },
  methodCardDefault: { borderColor: Colors.primary },
  defaultBadge: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 10 },
  defaultBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 0.5 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  methodIcon: { fontSize: 28 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900 },
  methodType: { fontSize: Typography.xs, color: Colors.gray500, marginTop: 2 },
  methodActions: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  actionLinkText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },
  removeLinkText: { fontSize: Typography.sm, color: Colors.error, fontWeight: '600' },
});
