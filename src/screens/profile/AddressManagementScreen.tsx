import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation } from '../../graphql/hooks';
import { ADD_ADDRESS, REMOVE_ADDRESS, SET_DEFAULT_ADDRESS } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

interface AddressFormState {
  recipientName: string; phone: string;
  addressLine1: string; addressLine2: string;
  subdistrict: string; district: string;
  province: string; postalCode: string;
}

const EMPTY_FORM: AddressFormState = {
  recipientName: '', phone: '', addressLine1: '', addressLine2: '',
  subdistrict: '', district: '', province: '', postalCode: '',
};

const FIELDS: { key: keyof AddressFormState; label: string; required?: boolean }[] = [
  { key: 'recipientName', label: 'Recipient Name', required: true },
  { key: 'phone',         label: 'Phone Number' },
  { key: 'addressLine1',  label: 'Address Line 1', required: true },
  { key: 'addressLine2',  label: 'Address Line 2' },
  { key: 'subdistrict',   label: 'Subdistrict' },
  { key: 'district',      label: 'District' },
  { key: 'province',      label: 'Province', required: true },
  { key: 'postalCode',    label: 'Postal Code', required: true },
];

export function AddressManagementScreen({ navigation }: any) {
  const { user, refreshUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const [addAddress] = useMutation(ADD_ADDRESS);
  const [removeAddress] = useMutation(REMOVE_ADDRESS);
  const [setDefaultAddress] = useMutation(SET_DEFAULT_ADDRESS);

  const addresses: any[] = user?.addresses ?? [];

  function set(field: keyof AddressFormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    if (!form.recipientName || !form.addressLine1 || !form.province || !form.postalCode) {
      alert('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      await addAddress({ variables: { input: { ...form, isDefault: addresses.length === 0 } } });
      await refreshUser?.();
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (e: any) {
      alert(e.message ?? 'Failed to save address');
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await removeAddress({ variables: { id } });
      await refreshUser?.();
    } catch (e: any) {
      alert(e.message ?? 'Failed to remove address');
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await setDefaultAddress({ variables: { id } });
      await refreshUser?.();
    } catch (e: any) {
      alert(e.message ?? 'Failed to set default');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Addresses</Text>
        <TouchableOpacity style={styles.addBtnWrap} onPress={() => setShowForm(v => !v)} activeOpacity={0.7}>
          <Text style={styles.addBtnText}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Address</Text>
            {FIELDS.map(({ key, label, required }) => (
              <View key={key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{label}{required ? ' *' : ''}</Text>
                <TextInput
                  style={[styles.fieldInput, focused === key && styles.fieldInputFocused]}
                  value={form[key]}
                  onChangeText={v => set(key, v)}
                  placeholder={label}
                  placeholderTextColor={Colors.gray300}
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused(null)}
                />
              </View>
            ))}
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator size="small" color={Colors.white} />
                : <Text style={styles.saveBtnText}>Save Address</Text>
              }
            </TouchableOpacity>
          </View>
        )}

        {addresses.length === 0 && !showForm && (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptySubtitle}>Add a delivery address to get started</Text>
          </View>
        )}

        {addresses.map((addr: any) => (
          <View key={addr.id} style={[styles.addrCard, addr.isDefault && styles.addrCardDefault]}>
            {addr.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>DEFAULT</Text>
              </View>
            )}
            <Text style={styles.addrName}>{addr.recipientName}</Text>
            {!!addr.phone && <Text style={styles.addrLine}>{addr.phone}</Text>}
            <Text style={styles.addrLine}>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</Text>
            {!!addr.subdistrict && <Text style={styles.addrLine}>{addr.subdistrict}, {addr.district}</Text>}
            <Text style={styles.addrLine}>{addr.province} {addr.postalCode}</Text>
            <View style={styles.addrActions}>
              {!addr.isDefault && (
                <TouchableOpacity onPress={() => handleSetDefault(addr.id)} activeOpacity={0.7}>
                  <Text style={styles.defaultLinkText}>Set as Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => handleRemove(addr.id)} activeOpacity={0.7}>
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

  formCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.base, gap: 4, ...Shadow.sm },
  formTitle: { fontSize: Typography.base, fontWeight: '800', color: Colors.gray900, marginBottom: 10, letterSpacing: -0.2 },
  fieldWrap: { marginBottom: 10 },
  fieldLabel: { fontSize: Typography.xs, fontWeight: '700', color: Colors.gray500, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.lg, paddingHorizontal: Spacing.base, paddingVertical: 12, fontSize: Typography.base, color: Colors.gray900, backgroundColor: Colors.gray50 },
  fieldInputFocused: { borderColor: Colors.primary, backgroundColor: Colors.white },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 15, alignItems: 'center', marginTop: 8, ...Shadow.primary },
  saveBtnText: { color: Colors.white, fontWeight: '800', fontSize: Typography.base },

  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyIcon: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: Colors.gray900, letterSpacing: -0.3 },
  emptySubtitle: { fontSize: Typography.sm, color: Colors.gray500 },

  addrCard: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1.5, borderColor: Colors.gray200, ...Shadow.xs },
  addrCardDefault: { borderColor: Colors.primary },
  defaultBadge: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 10 },
  defaultBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 0.8 },
  addrName: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900, marginBottom: 4 },
  addrLine: { fontSize: Typography.sm, color: Colors.gray600, marginBottom: 2, lineHeight: 18 },
  addrActions: { flexDirection: 'row', gap: 16, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  defaultLinkText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '700' },
  removeLinkText: { fontSize: Typography.sm, color: Colors.error, fontWeight: '700' },
});
