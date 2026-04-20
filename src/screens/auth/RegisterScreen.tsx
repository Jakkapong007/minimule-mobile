import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation } from '../../graphql/hooks';
import { REGISTER, LOGIN } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Spacing, Typography } from '../../theme';

export function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const [register, { loading: r }] = useMutation(REGISTER);
  const [login, { loading: l }] = useMutation(LOGIN);
  const loading = r || l;

  async function handle() {
    if (!name.trim() || !email.trim() || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    try {
      await register({ variables: { email: email.trim().toLowerCase(), password, name: name.trim() } });
      const { data } = await login({ variables: { email: email.trim().toLowerCase(), password } });
      if (data?.login) await signIn(data.login);
    } catch (e: any) {
      setError(e.message?.replace('GraphQL error: ', '') ?? 'Registration failed.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>mini</Text>
            <View style={styles.logoBadge}><Text style={styles.logoBadgeText}>MULE</Text></View>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Join the miniMule community</Text>
          {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
          {[
            { label: 'Full Name', value: name, set: setName, placeholder: 'Your name', kb: 'default' as const },
            { label: 'Email', value: email, set: setEmail, placeholder: 'you@example.com', kb: 'email-address' as const },
            { label: 'Password', value: password, set: setPassword, placeholder: '8+ characters', kb: 'default' as const, secure: true },
          ].map(f => (
            <View key={f.label}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput style={styles.input} placeholder={f.placeholder} placeholderTextColor={Colors.gray400} value={f.value} onChangeText={f.set} keyboardType={f.kb} autoCapitalize={f.kb === 'email-address' ? 'none' : 'words'} secureTextEntry={!!f.secure} />
            </View>
          ))}
          <TouchableOpacity style={[styles.btn, loading && styles.btnOff]} onPress={handle} disabled={loading} activeOpacity={0.8}>
            <Text style={styles.btnText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.muted}>Already have an account? </Text>
            <Text style={styles.link}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray50 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logoText: { fontSize: 36, fontWeight: '900', color: Colors.gray900, letterSpacing: -1 },
  logoBadge: { backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  logoBadgeText: { fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xxl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.gray900, marginBottom: 4 },
  subtitle: { fontSize: Typography.sm, color: Colors.gray500, marginBottom: Spacing.xl },
  errorBox: { backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  errorText: { color: Colors.error, fontSize: Typography.sm },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray700, marginBottom: 6, marginTop: Spacing.lg },
  input: { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: 13, fontSize: Typography.base, color: Colors.gray900, marginBottom: 0 },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.xl },
  btnOff: { opacity: 0.6 },
  btnText: { color: Colors.white, fontSize: Typography.base, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'center' },
  muted: { fontSize: Typography.sm, color: Colors.gray500 },
  link: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },
});
