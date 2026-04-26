import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation } from '../../graphql/hooks';
import { REGISTER, LOGIN } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

export function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
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

  const fields = [
    { key: 'name',     label: 'Full Name', value: name,     set: setName,     placeholder: 'Your name',       kb: 'default' as const, secure: false },
    { key: 'email',    label: 'Email',     value: email,    set: setEmail,    placeholder: 'you@example.com', kb: 'email-address' as const, secure: false },
    { key: 'password', label: 'Password',  value: password, set: setPassword, placeholder: '8+ characters',   kb: 'default' as const, secure: true },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.hero}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>mini</Text>
            <View style={styles.logoBadge}><Text style={styles.logoBadgeText}>MULE</Text></View>
          </View>
          <Text style={styles.tagline}>Join the community</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Free forever. No credit card needed.</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          {fields.map(f => (
            <View key={f.key} style={styles.fieldGroup}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={[styles.input, focusedField === f.key && styles.inputFocused]}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.gray300}
                value={f.value}
                onChangeText={f.set}
                onFocus={() => setFocusedField(f.key)}
                onBlur={() => setFocusedField(null)}
                keyboardType={f.kb}
                autoCapitalize={f.kb === 'email-address' ? 'none' : 'words'}
                secureTextEntry={f.secure}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnOff]}
            onPress={handle}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{loading ? 'Creating account…' : 'Create Account'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginRow} onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={styles.muted}>Already have an account? </Text>
            <Text style={styles.link}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },

  hero: { alignItems: 'center', marginBottom: 40 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  logoText: { fontSize: 42, fontWeight: '900', color: Colors.white, letterSpacing: -1.5 },
  logoBadge: { backgroundColor: Colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 7, ...Shadow.primary },
  logoBadgeText: { fontSize: 22, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  tagline: { fontSize: Typography.xs, color: Colors.gray400, letterSpacing: 1.5, textTransform: 'uppercase' },

  card: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: Spacing.xxl, ...Shadow.lg },
  title: { fontSize: 24, fontWeight: '800', color: Colors.gray900, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: Typography.sm, color: Colors.gray500, marginBottom: Spacing.xl },

  errorBox: { backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.error },
  errorText: { color: Colors.error, fontSize: Typography.sm, fontWeight: '500' },

  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: Typography.xs, fontWeight: '700', color: Colors.gray500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.lg, paddingHorizontal: Spacing.base, paddingVertical: 14, fontSize: Typography.base, color: Colors.gray900, backgroundColor: Colors.gray50 },
  inputFocused: { borderColor: Colors.primary, backgroundColor: Colors.white },

  btn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl, ...Shadow.primary },
  btnOff: { opacity: 0.6, shadowOpacity: 0 },
  btnText: { color: Colors.white, fontSize: Typography.base, fontWeight: '800', letterSpacing: 0.5 },

  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  muted: { fontSize: Typography.sm, color: Colors.gray500 },
  link: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '700' },
});
