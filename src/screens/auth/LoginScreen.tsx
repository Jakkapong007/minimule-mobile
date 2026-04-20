import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useMutation } from '../../graphql/hooks';
import { LOGIN } from '../../graphql/queries';
import { useAuth } from '../../context/AuthContext';
import { Colors, Radius, Spacing, Typography } from '../../theme';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>mini</Text>
            <View style={styles.logoBadge}><Text style={styles.logoBadgeText}>MULE</Text></View>
          </View>
          <Text style={styles.tagline}>Stickers. Art. Community.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} placeholder="you@example.com" placeholderTextColor={Colors.gray400} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />

          <Text style={styles.label}>Password</Text>
          <TextInput style={[styles.input, styles.inputLast]} placeholder="••••••••" placeholderTextColor={Colors.gray400} value={password} onChangeText={setPassword} secureTextEntry />

          <TouchableOpacity style={[styles.btn, loading && styles.btnOff]} onPress={handle} disabled={loading} activeOpacity={0.8}>
            <Text style={styles.btnText}>{loading ? 'Signing in…' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} /><Text style={styles.orText}>or</Text><View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Register')}>
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
  container: { flex: 1, backgroundColor: Colors.gray50 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  header: { alignItems: 'center', marginBottom: 36 },
  logoBox: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  logoText: { fontSize: 36, fontWeight: '900', color: Colors.gray900, letterSpacing: -1 },
  logoBadge: { backgroundColor: Colors.primary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  logoBadgeText: { fontSize: 20, fontWeight: '900', color: Colors.white, letterSpacing: 1 },
  tagline: { fontSize: Typography.sm, color: Colors.gray500, letterSpacing: 0.5 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xl, padding: Spacing.xxl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.gray900, marginBottom: 4 },
  subtitle: { fontSize: Typography.sm, color: Colors.gray500, marginBottom: Spacing.xl },
  errorBox: { backgroundColor: Colors.errorBg, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg },
  errorText: { color: Colors.error, fontSize: Typography.sm },
  label: { fontSize: Typography.sm, fontWeight: '600', color: Colors.gray700, marginBottom: 6, marginTop: Spacing.lg },
  input: { borderWidth: 1.5, borderColor: Colors.gray200, borderRadius: Radius.md, paddingHorizontal: Spacing.lg, paddingVertical: 13, fontSize: Typography.base, color: Colors.gray900 },
  inputLast: { marginBottom: Spacing.xl },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center' },
  btnOff: { opacity: 0.6 },
  btnText: { color: Colors.white, fontSize: Typography.base, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: Colors.gray200 },
  orText: { marginHorizontal: 12, color: Colors.gray400, fontSize: Typography.sm },
  row: { flexDirection: 'row', justifyContent: 'center' },
  muted: { fontSize: Typography.sm, color: Colors.gray500 },
  link: { fontSize: Typography.sm, color: Colors.primary, fontWeight: '600' },
  hint: { textAlign: 'center', marginTop: Spacing.xl, fontSize: 11, color: Colors.gray400 },
});
