import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation } from '../../graphql/hooks';
import { LOGIN } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../theme';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signIn } = useAuth();
  const [login, { loading }] = useMutation(LOGIN);

  async function handle() {
    if (!email.trim() || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    try {
      const { data } = await login({ variables: { email: email.trim().toLowerCase(), password } });
      if (data?.login) await signIn(data.login);
    } catch (e: any) {
      setError(e.message?.replace('GraphQL error: ', '') ?? 'Login failed.');
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        <View style={styles.hero}>
          <View style={styles.logoRow}>
            <Text style={styles.logoText}>mini</Text>
            <View style={styles.logoBadge}><Text style={styles.logoBadgeText}>MULE</Text></View>
          </View>
          <Text style={styles.tagline}>Stickers. Art. Community.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, focusedField === 'email' && styles.inputFocused]}
              placeholder="you@example.com"
              placeholderTextColor={Colors.gray300}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, focusedField === 'password' && styles.inputFocused]}
              placeholder="••••••••"
              placeholderTextColor={Colors.gray300}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnOff]}
            onPress={handle}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.registerRow} onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
            <Text style={styles.muted}>Don't have an account? </Text>
            <Text style={styles.link}>Create one</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>Demo: customer@minimule.com / password123</Text>
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
  tagline: { fontSize: Typography.sm, color: Colors.gray400, letterSpacing: 1.5, textTransform: 'uppercase' },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
    ...Shadow.lg,
  },
  title: { fontSize: 24, fontWeight: '800', color: Colors.gray900, marginBottom: 4, letterSpacing: -0.5 },
  subtitle: { fontSize: Typography.sm, color: Colors.gray500, marginBottom: Spacing.xl },

  errorBox: { backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.error },
  errorText: { color: Colors.error, fontSize: Typography.sm, fontWeight: '500' },

  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: Typography.xs, fontWeight: '700', color: Colors.gray500, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.lg, paddingHorizontal: Spacing.base, paddingVertical: 14, fontSize: Typography.base, color: Colors.gray900, backgroundColor: Colors.gray50 },
  inputFocused: { borderColor: Colors.primary, backgroundColor: Colors.white },

  btn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingVertical: 16, alignItems: 'center', marginTop: Spacing.sm, ...Shadow.primary },
  btnOff: { opacity: 0.6, shadowOpacity: 0 },
  btnText: { color: Colors.white, fontSize: Typography.base, fontWeight: '800', letterSpacing: 0.5 },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: Colors.gray100 },
  orText: { marginHorizontal: 14, color: Colors.gray300, fontSize: Typography.xs, fontWeight: '600', letterSpacing: 0.5 },

  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  muted: { fontSize: Typography.sm, color: Colors.gray500 },
  link: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '700' },

  hint: { textAlign: 'center', marginTop: Spacing.xl, fontSize: 11, color: Colors.gray600, letterSpacing: 0.3 },
});
