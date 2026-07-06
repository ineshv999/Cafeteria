import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import MockStatusBar from '../components/MockStatusBar';
import ScreenBackground from '../components/ScreenBackground';

export default function LoginScreen({ isDarkMode, loginAsRole, navigate, roleOptions = [], setIsDarkMode, theme }) {
  const [selectedRoleId, setSelectedRoleId] = useState(roleOptions[0]?.id || 'admin');
  const selectedRole = roleOptions.find((role) => role.id === selectedRoleId) || roleOptions[0];

  return (
    <ScreenBackground isDarkMode={isDarkMode} theme={theme} contentStyle={styles.screen}>
      <View style={styles.content}>
        <MockStatusBar
          isDarkMode={isDarkMode}
          menuMode="themeOnly"
          navigate={navigate}
          setIsDarkMode={setIsDarkMode}
          theme={theme}
        />

        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: isDarkMode ? '#92400e' : theme.accent,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0)',
                boxShadow: theme.logoShadow,
              },
            ]}
          >
            <Text style={styles.coffeeIcon}>☕</Text>
          </View>
        </View>

        <View style={styles.titleSection}>
          <Text selectable style={[styles.title, { color: theme.title }]}>
            CoffeeAdmin
          </Text>
          <Text selectable style={[styles.subtitle, { color: theme.subtitle }]}>
            Controla pedidos, caja e inventario
          </Text>
        </View>

        <View style={styles.formSection}>
          <LoginInput icon="✉" placeholder="Correo o usuario" theme={theme} />
          <LoginInput icon="🔒" placeholder="Contraseña" secureTextEntry theme={theme} />
        </View>

        <View style={styles.roleSection}>
          <Text selectable style={[styles.roleHeading, { color: theme.title }]}>
            Entrar como
          </Text>
          <View style={styles.roleGrid}>
            {roleOptions.map((role) => {
              const isActive = role.id === selectedRoleId;

              return (
                <Pressable
                  key={role.id}
                  onPress={() => setSelectedRoleId(role.id)}
                  style={({ pressed }) => [
                    styles.roleCard,
                    {
                      backgroundColor: isActive ? theme.accent : theme.surface,
                      borderColor: isActive ? theme.accent : theme.surfaceBorder,
                      boxShadow: isActive ? '0 10px 22px rgba(217, 119, 6, 0.22)' : theme.cardShadow,
                      opacity: pressed ? 0.86 : 1,
                    },
                  ]}
                >
                  <Text style={styles.roleIcon}>{role.icon}</Text>
                  <Text selectable style={[styles.roleLabel, { color: isActive ? '#ffffff' : theme.title }]}>
                    {role.label}
                  </Text>
                  <Text selectable style={[styles.roleDescription, { color: isActive ? 'rgba(255,255,255,0.78)' : theme.muted }]}>
                    {role.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={() => {
            if (loginAsRole && selectedRole) {
              loginAsRole(selectedRole.id);
              return;
            }

            navigate('dashboard');
          }}
          style={({ pressed }) => [
            styles.loginButton,
            {
              backgroundColor: isDarkMode ? theme.accent : theme.accentAlt,
              boxShadow: isDarkMode
                ? '0 14px 30px rgba(217, 119, 6, 0.35)'
                : '0 12px 25px rgba(120, 53, 15, 0.35)',
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <Text style={styles.loginText}>Iniciar sesión</Text>
          <Text style={styles.loginArrow}>➜</Text>
        </Pressable>

        <Text selectable style={[styles.roleText, { color: theme.muted }]}>
          Los permisos cambian según el rol seleccionado
        </Text>

        <View
          style={[
            styles.designCard,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.14)' : 'rgba(120, 53, 15, 0)',
            },
          ]}
        >
          <Text selectable style={[styles.cardTitle, { color: theme.title }]}>
            Tu cafetería de confianza
          </Text>
          <Text selectable style={[styles.cardCopy, { color: theme.muted }]}>
            Cálido y sencillo para pasar un buen rato
          </Text>
        </View>
      </View>
    </ScreenBackground>
  );
}

function LoginInput({ icon, placeholder, secureTextEntry, theme }) {
  return (
    <View
      style={[
        styles.inputBox,
        {
          backgroundColor: theme.surface,
          borderColor: theme.inputBorder,
          boxShadow: theme.cardShadow,
        },
      ]}
    >
      <Text style={[styles.inputIcon, { color: theme.amber }]}>{icon}</Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={theme.muted}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        keyboardType={secureTextEntry ? 'default' : 'email-address'}
        style={[styles.input, { color: theme.statusText }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    minHeight: 860,
  },
  content: {
    flex: 1,
    minHeight: 860,
    paddingBottom: 24,
    paddingHorizontal: 36,
    paddingTop: 36,
    position: 'relative',
    zIndex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 52,
  },
  logoCircle: {
    alignItems: 'center',
    borderRadius: 48,
    borderWidth: 1,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  coffeeIcon: {
    color: '#ffffff',
    fontSize: 44,
  },
  titleSection: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  formSection: {
    gap: 16,
    paddingTop: 32,
  },
  inputBox: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    height: 56,
    paddingHorizontal: 18,
    width: '100%',
  },
  inputIcon: {
    fontSize: 18,
    width: 20,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  loginButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 10,
    height: 58,
    justifyContent: 'center',
    marginTop: 22,
    width: '100%',
  },
  roleSection: {
    gap: 10,
    paddingTop: 22,
  },
  roleHeading: {
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  roleCard: {
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: 4,
    minHeight: 96,
    padding: 12,
  },
  roleIcon: {
    fontSize: 21,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '900',
  },
  roleDescription: {
    fontSize: 10,
    lineHeight: 14,
  },
  loginText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  loginArrow: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  roleText: {
    fontSize: 12,
    marginTop: 20,
    textAlign: 'center',
  },
  designCard: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 24,
    borderWidth: 1,
    gap: 4,
    marginTop: 42,
    padding: 16,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardCopy: {
    fontSize: 12,
    textAlign: 'center',
  },
});
