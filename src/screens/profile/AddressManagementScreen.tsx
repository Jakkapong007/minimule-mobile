import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation } from '../../graphql/hooks';
import { ADD_ADDRESS, REMOVE_ADDRESS, SET_DEFAULT_ADDRESS } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Spacing, Typography } from '../../theme';

interface AddressFormState {
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

const EMPTY_FORM: AddressFormState = {
  recipientName: '', phone: '', addressLine1: '', addressLine2: '',
  subdistrict: '', district: '', province: '', postalCode: '',
};

export function AddressManagementScreen({ navigation }: any) {
  const { user, refreshUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AddressFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Addresses</Text>
        <TouchableOpacity onPress={() => setShowForm(v => !v)}>
          <Text style={styles.addBtn}>{showForm ? 'Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Address</Text>
            {([
              ['recipientName', 'Recipient Name *'],
              ['phone', 'Phone Number'],
              ['addressLine1', 'Address Line 1 *'],
              ['addressLine2', 'Address Line 2 (optional)'],
              ['subdistrict', 'Subdistrict'],
              ['district', 'District'],
              ['province', 'Province *'],
              ['postalCode', 'Postal Code *'],
            ] as [keyof AddressFormState, string][]).map(([key, label]) => (
              <View key={key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={form[key]}
                  onChangeText={v => set(key, v)}
                  placeholder={label}
                  placeholderTextColor={Colors.gray400}
                />
              </View>
            ))}
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
              {saving ? <ActivityIndicator size="small" color={Colors.white} /> : <Text style={styles.saveBtnText}>Save Address</Text>}
            </TouchableOpacity>
          </View>
        )}

        {addresses.length === 0 && !showForm ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptySubtitle}>Add a delivery address to get started</Text>
          </View>
        ) : (
          addresses.map((addr: any) => (
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
                  <TouchableOpacity style={styles.actionLink} onPress={() => handleSetDefault(addr.id)}>
                    <Text style={styles.actionLinkText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.removeLink} onPress={() => handleRemove(addr.id)}>
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
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingTop: 52, paddingBottom: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.gray100 },
  backIcon: { fontSize: 22, color: Colors.gray900, width: 32 },
  navTitle: { fontSize: Typography.lg, fontWeight: '700', color: Colors.gray900 },
  addBtn: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '700' },
  scroll: { padding: Spacing.lg, gap: 12, paddingBottom: 40 },
  formCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, gap: 4 },
  formTitle: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900, marginBottom: 8 },
  fieldWrap: { marginBottom: 10 },
  fieldLabel: { fontSize: Typography.xs, fontWeight: '600', color: Colors.gray600, marginBottom: 4 },
  fieldInput: { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.md, paddingHorizontal: 12, paddingVertical: 10, fontSize: Typography.base, color: Colors.gray900 },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: Colors.white, fontWeight: '700', fontSize: Typography.base },
  empty: { flex: 1, alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyIcon: { fontSize: 56, marginBottom: 8 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: Colors.gray900 },
  emptySubtitle: { fontSize: Typography.sm, color: Colors.gray500 },
  addrCard: { backgroundColor: Colors.white, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1.5, borderColor: Colors.gray200 },
  addrCardDefault: { borderColor: Colors.primary },
  defaultBadge: { backgroundColor: Colors.primaryBg, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8 },
  defaultBadgeText: { fontSize: 10, fontWeight: '800', color: Colors.primary, letterSpacing: 0.5 },
  addrName: { fontSize: Typography.base, fontWeight: '700', color: Colors.gray900, marginBottom: 2 },
  addrLine: { fontSize: Typography.sm, color: Colors.gray600, marginBottom: 1 },
  addrActions: { flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray100 },
  actionLink: {},
  actionLinkText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },
  removeLink: {},
  removeLinkText: { fontSize: Typography.sm, color: Colors.error, fontWeight: '600' },
});
