import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import MockStatusBar from '../components/MockStatusBar';
import ScreenBackground from '../components/ScreenBackground';

export default function LoginScreen({ isDarkMode, loginAsRole, navigate, setIsDarkMode, theme }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password) {
      setError('Escribe tu correo o usuario y contraseña.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await loginAsRole(username.trim(), password);
    } catch (loginError) {
      setError(loginError.message || 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenBackground isDarkMode={isDarkMode} theme={theme} contentStyle={styles.screen}>
      <View style={styles.content}>
        <MockStatusBar isDarkMode={isDarkMode} menuMode="themeOnly" navigate={navigate} setIsDarkMode={setIsDarkMode} theme={theme} />
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: isDarkMode ? '#92400e' : theme.accent, boxShadow: theme.logoShadow }]}>
            <Text style={styles.coffeeIcon}>☕</Text>
          </View>
        </View>
        <View style={styles.titleSection}>
          <Text selectable style={[styles.title, { color: theme.title }]}>CoffeeAdmin</Text>
          <Text selectable style={[styles.subtitle, { color: theme.subtitle }]}>Controla pedidos, caja e inventario</Text>
        </View>
        <View style={styles.formSection}>
          <LoginInput icon="✉" onChangeText={setUsername} placeholder="Correo o usuario" theme={theme} value={username} />
          <LoginInput icon="🔒" onChangeText={setPassword} placeholder="Contraseña" secureTextEntry theme={theme} value={password} />
        </View>
        {!!error && <Text selectable style={styles.errorText}>{error}</Text>}
        <Pressable disabled={isSubmitting} onPress={submit} style={({ pressed }) => [styles.loginButton, { backgroundColor: isDarkMode ? theme.accent : theme.accentAlt, opacity: pressed || isSubmitting ? 0.72 : 1 }]}>
          <Text style={styles.loginText}>{isSubmitting ? 'Conectando...' : 'Iniciar sesión'}</Text>
          <Text style={styles.loginArrow}>➜</Text>
        </Pressable>
        <Text selectable style={[styles.roleText, { color: theme.muted }]}>El rol y los permisos se obtienen de la API</Text>
        <View style={[styles.designCard, { backgroundColor: theme.surfaceAlt }]}>
          <Text selectable style={[styles.cardTitle, { color: theme.title }]}>Tu cafetería de confianza</Text>
          <Text selectable style={[styles.cardCopy, { color: theme.muted }]}>Conexión segura con CoffeeAdmin API</Text>
        </View>
      </View>
    </ScreenBackground>
  );
}

function LoginInput({ icon, onChangeText, placeholder, secureTextEntry, theme, value }) {
  return (
    <View style={[styles.inputBox, { backgroundColor: theme.surface, borderColor: theme.inputBorder, boxShadow: theme.cardShadow }]}>
      <Text style={[styles.inputIcon, { color: theme.amber }]}>{icon}</Text>
      <TextInput autoCapitalize="none" keyboardType={secureTextEntry ? 'default' : 'email-address'} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.muted} secureTextEntry={secureTextEntry} style={[styles.input, { color: theme.statusText }]} value={value} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { minHeight: 860 },
  content: { flex: 1, minHeight: 860, paddingBottom: 24, paddingHorizontal: 36, paddingTop: 36 },
  logoContainer: { alignItems: 'center', paddingTop: 52 },
  logoCircle: { alignItems: 'center', borderRadius: 48, height: 96, justifyContent: 'center', width: 96 },
  coffeeIcon: { fontSize: 44 },
  titleSection: { alignItems: 'center', gap: 8, paddingTop: 32 },
  title: { fontSize: 32, fontWeight: '900' },
  subtitle: { fontSize: 14, textAlign: 'center' },
  formSection: { gap: 16, paddingTop: 32 },
  inputBox: { alignItems: 'center', borderRadius: 18, borderWidth: 1, flexDirection: 'row', gap: 14, height: 56, paddingHorizontal: 18 },
  inputIcon: { fontSize: 18, width: 20 },
  input: { flex: 1, fontSize: 14, height: '100%' },
  errorText: { color: '#dc2626', fontSize: 12, marginTop: 14, textAlign: 'center' },
  loginButton: { alignItems: 'center', borderRadius: 18, flexDirection: 'row', gap: 10, height: 58, justifyContent: 'center', marginTop: 22 },
  loginText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  loginArrow: { color: '#ffffff', fontSize: 18, fontWeight: '800' },
  roleText: { fontSize: 12, marginTop: 20, textAlign: 'center' },
  designCard: { alignItems: 'center', borderRadius: 24, gap: 4, marginTop: 42, padding: 16 },
  cardTitle: { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  cardCopy: { fontSize: 12, textAlign: 'center' },
});
