import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import BottomNav from '../components/BottomNav';
import MockStatusBar from '../components/MockStatusBar';
import ScreenBackground from '../components/ScreenBackground';
import SectionTitle from '../components/SectionTitle';

export default function ProfileScreen({
  cashierExpenses = [],
  customerOrders = [],
  goBack,
  isDarkMode,
  kitchenInventory = [],
  navigate,
  setIsDarkMode,
  theme,
  updateUserProfile,
  userProfile,
}) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [draft, setDraft] = useState(userProfile);
  const paidOrders = customerOrders.filter((order) => order.cashierStatus === 'paid');
  const activeOrders = customerOrders.filter((order) => ['pending', 'kitchen', 'ready'].includes(order.statusType));
  const deliveredOrders = customerOrders.filter((order) => order.statusType === 'delivered');
  const lowStock = kitchenInventory.filter((item) => Number(item.quantity || 0) <= Number(item.minimum || 0));
  const salesTotal = paidOrders.reduce((total, order) => total + getOrderTotal(order), 0);
  const expensesTotal = cashierExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);
  const stats = [
    { label: 'Pedidos activos', value: activeOrders.length || 3, icon: '🧾' },
    { label: 'Entregados', value: deliveredOrders.length || 11, icon: '✅' },
    { label: 'Stock bajo', value: lowStock.length || 2, icon: '⚠️' },
  ];

  const openEdit = () => {
    setDraft(userProfile);
    setIsEditOpen(true);
  };

  const saveProfile = () => {
    updateUserProfile(() => draft);
    setIsEditOpen(false);
  };

  return (
    <ScreenBackground isDarkMode={isDarkMode} theme={theme} contentStyle={styles.screen}>
      <View style={styles.content}>
        <MockStatusBar isDarkMode={isDarkMode} navigate={navigate} onBack={goBack} setIsDarkMode={setIsDarkMode} showBack theme={theme} />

        <View style={styles.heroRow}>
          <View style={[styles.avatar, { backgroundColor: isDarkMode ? theme.accent : theme.accentAlt, boxShadow: theme.logoShadow }]}>
            <Text style={styles.avatarText}>☕</Text>
          </View>
          <View style={styles.heroCopy}>
            <Text selectable style={[styles.eyebrow, { color: theme.amber }]}>
              Perfil
            </Text>
            <Text selectable style={[styles.title, { color: theme.title }]}>
              {userProfile.name}
            </Text>
            <Text selectable style={[styles.subtitle, { color: theme.muted }]}>
              {userProfile.role} · {userProfile.shift}
            </Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: isDarkMode ? theme.accent : theme.accentAlt, boxShadow: theme.strongShadow }]}>
          <View>
            <Text selectable style={styles.summaryLabel}>
              Sesion activa
            </Text>
            <Text selectable style={styles.summaryValue}>
              CoffeeAdmin
            </Text>
            <Text selectable style={styles.summaryHint}>
              Operacion conectada en tiempo real
            </Text>
          </View>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>🛡️</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View
              key={stat.label}
              style={[
                styles.statCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.surfaceBorder,
                  boxShadow: theme.cardShadow,
                },
              ]}
            >
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text selectable style={[styles.statValue, { color: theme.title }]}>
                {stat.value}
              </Text>
              <Text selectable style={[styles.statLabel, { color: theme.muted }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Informacion personal" subtitle="Datos visibles para la operacion" compact theme={theme} />

        <View style={[styles.infoCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder, boxShadow: theme.cardShadow }]}>
          <InfoRow label="Correo" value={userProfile.email} theme={theme} />
          <InfoRow label="Telefono" value={userProfile.phone} theme={theme} />
          <InfoRow label="Rol" value={userProfile.role} theme={theme} />
          <InfoRow label="Turno" value={userProfile.shift} theme={theme} last />
        </View>

        <View style={styles.actionRow}>
          <ActionButton label="Editar perfil" onPress={openEdit} theme={theme} />
          <ActionButton label="Cerrar sesion" danger onPress={() => setIsLogoutOpen(true)} theme={theme} />
        </View>

        <SectionTitle title="Panel personal" subtitle="Atajos y estado de tu cuenta" compact theme={theme} />

        <View style={styles.optionList}>
          <OptionCard
            detail="Tema, notificaciones y alertas"
            icon="⚙️"
            isDarkMode={isDarkMode}
            onPress={() => navigate('settings')}
            theme={theme}
            title="Ajustes"
          />
          <OptionCard
            detail="Guias rapidas y contacto interno"
            icon="❓"
            isDarkMode={isDarkMode}
            onPress={() => navigate('help')}
            theme={theme}
            title="Ayuda"
          />
          <OptionCard
            detail={`${formatCurrency(salesTotal)} vendidos · ${formatCurrency(expensesTotal)} en gastos`}
            icon="📊"
            isDarkMode={isDarkMode}
            onPress={() => navigate('cashierAccounts')}
            theme={theme}
            title="Resumen financiero"
          />
        </View>

        <View style={[styles.permissionsCard, { backgroundColor: theme.surfaceAlt, borderColor: isDarkMode ? theme.surfaceBorder : 'transparent' }]}>
          <Text selectable style={[styles.permissionsTitle, { color: theme.title }]}>
            Permisos del rol
          </Text>
          <View style={styles.permissionGrid}>
            {['Dashboard', 'Cliente', 'Caja', 'Cocina'].map((permission) => (
              <View key={permission} style={[styles.permissionPill, { backgroundColor: isDarkMode ? 'rgba(245,158,11,0.12)' : '#ffffff' }]}>
                <Text selectable style={[styles.permissionText, { color: theme.amber }]}>
                  {permission}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <BottomNav active="profile" isDarkMode={isDarkMode} navigate={navigate} theme={theme} />

      <ProfileEditModal
        draft={draft}
        isDarkMode={isDarkMode}
        onChange={setDraft}
        onClose={() => setIsEditOpen(false)}
        onSave={saveProfile}
        theme={theme}
        visible={isEditOpen}
      />
      <ConfirmModal
        description="Volveras al login y conservaras los datos de prueba de esta sesion."
        isDarkMode={isDarkMode}
        onCancel={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          setIsLogoutOpen(false);
          navigate('login');
        }}
        theme={theme}
        title="Cerrar sesion"
        visible={isLogoutOpen}
      />
    </ScreenBackground>
  );
}

function InfoRow({ label, last = false, theme, value }) {
  return (
    <View style={[styles.infoRow, !last && styles.infoBorder]}>
      <Text selectable style={[styles.infoLabel, { color: theme.muted }]}>
        {label}
      </Text>
      <Text selectable style={[styles.infoValue, { color: theme.title }]}>
        {value}
      </Text>
    </View>
  );
}

function ActionButton({ danger = false, label, onPress, theme }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.actionButton,
        {
          backgroundColor: danger ? '#dc2626' : theme.accent,
        },
      ]}
    >
      <Text selectable style={styles.actionText}>
        {label}
      </Text>
    </Pressable>
  );
}

function OptionCard({ detail, icon, isDarkMode, onPress, theme, title }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.optionCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
          boxShadow: theme.cardShadow,
        },
      ]}
    >
      <View style={[styles.optionIcon, { backgroundColor: theme.softIcon }]}>
        <Text style={styles.optionIconText}>{icon}</Text>
      </View>
      <View style={styles.optionCopy}>
        <Text selectable style={[styles.optionTitle, { color: theme.title }]}>
          {title}
        </Text>
        <Text selectable style={[styles.optionDetail, { color: theme.muted }]}>
          {detail}
        </Text>
      </View>
      <Text style={[styles.optionArrow, { color: isDarkMode ? theme.amber : theme.accent }]}>›</Text>
    </Pressable>
  );
}

function ProfileEditModal({ draft, isDarkMode, onChange, onClose, onSave, theme, visible }) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View style={styles.modalLayer}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: isDarkMode ? '#231811' : '#ffffff', borderColor: theme.surfaceBorder }]}>
          <View style={styles.grabber} />
          <Text selectable style={[styles.sheetTitle, { color: theme.title }]}>
            Editar perfil
          </Text>
          <FormInput label="Nombre" onChange={(value) => onChange({ ...draft, name: value })} theme={theme} value={draft.name} />
          <FormInput label="Correo" onChange={(value) => onChange({ ...draft, email: value })} theme={theme} value={draft.email} />
          <FormInput label="Telefono" onChange={(value) => onChange({ ...draft, phone: value })} theme={theme} value={draft.phone} />
          <FormInput label="Turno" onChange={(value) => onChange({ ...draft, shift: value })} theme={theme} value={draft.shift} />
          <View style={styles.sheetActions}>
            <SheetButton label="Cancelar" onPress={onClose} secondary theme={theme} />
            <SheetButton label="Guardar" onPress={onSave} theme={theme} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ConfirmModal({ description, isDarkMode, onCancel, onConfirm, theme, title, visible }) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={visible}>
      <View style={styles.centerLayer}>
        <View style={[styles.confirmBox, { backgroundColor: isDarkMode ? '#231811' : '#ffffff', borderColor: theme.surfaceBorder }]}>
          <Text selectable style={[styles.sheetTitle, { color: theme.title }]}>
            {title}
          </Text>
          <Text selectable style={[styles.confirmText, { color: theme.muted }]}>
            {description}
          </Text>
          <View style={styles.sheetActions}>
            <SheetButton label="Cancelar" onPress={onCancel} secondary theme={theme} />
            <SheetButton label="Confirmar" onPress={onConfirm} theme={theme} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FormInput({ label, onChange, theme, value }) {
  return (
    <View style={[styles.inputBox, { backgroundColor: theme.actionSoft, borderColor: theme.surfaceBorder }]}>
      <Text selectable style={[styles.inputLabel, { color: theme.muted }]}>
        {label}
      </Text>
      <TextInput
        onChangeText={onChange}
        placeholder={label}
        placeholderTextColor={theme.muted}
        style={[styles.input, { color: theme.title }]}
        value={value}
      />
    </View>
  );
}

function SheetButton({ label, onPress, secondary = false, theme }) {
  return (
    <Pressable onPress={onPress} style={[styles.sheetButton, { backgroundColor: secondary ? theme.actionSoft : theme.accent }]}>
      <Text selectable style={[styles.sheetButtonText, { color: secondary ? theme.title : '#ffffff' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function getOrderTotal(order) {
  if (typeof order.total === 'number') {
    return order.total;
  }

  return Number(String(order.amount || '0').replace(/[^0-9.]/g, '')) || 0;
}

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

const styles = StyleSheet.create({
  screen: {
    minHeight: 1160,
    paddingBottom: 104,
  },
  content: {
    flex: 1,
    paddingBottom: 22,
    paddingHorizontal: 31,
    paddingTop: 31,
    position: 'relative',
    zIndex: 1,
  },
  heroRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
    paddingTop: 28,
  },
  avatar: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  avatarText: {
    fontSize: 29,
  },
  heroCopy: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    fontSize: 31,
    fontWeight: '900',
    lineHeight: 35,
    paddingTop: 4,
  },
  subtitle: {
    fontSize: 13,
    paddingTop: 4,
  },
  summaryCard: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    padding: 19,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    paddingTop: 6,
  },
  summaryHint: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    paddingTop: 5,
  },
  summaryIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderCurve: 'continuous',
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  summaryIconText: {
    fontSize: 26,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  statCard: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 92,
    justifyContent: 'center',
    padding: 10,
  },
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 21,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    paddingTop: 5,
  },
  statLabel: {
    fontSize: 10,
    paddingTop: 3,
    textAlign: 'center',
  },
  infoCard: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  infoRow: {
    gap: 4,
    paddingVertical: 11,
  },
  infoBorder: {
    borderBottomColor: 'rgba(120, 53, 15, 0.12)',
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 11,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  actionButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 17,
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  optionList: {
    gap: 10,
    paddingTop: 12,
  },
  optionCard: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 70,
    padding: 13,
  },
  optionIcon: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 15,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  optionIconText: {
    fontSize: 20,
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  optionDetail: {
    fontSize: 11,
    lineHeight: 15,
    paddingTop: 3,
  },
  optionArrow: {
    fontSize: 26,
    fontWeight: '900',
  },
  permissionsCard: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 14,
    padding: 15,
  },
  permissionsTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  permissionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 12,
  },
  permissionPill: {
    borderCurve: 'continuous',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  permissionText: {
    fontSize: 11,
    fontWeight: '900',
  },
  modalLayer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 24,
  },
  grabber: {
    alignSelf: 'center',
    backgroundColor: 'rgba(120, 113, 108, 0.45)',
    borderRadius: 999,
    height: 5,
    marginBottom: 8,
    width: 70,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '900',
  },
  inputBox: {
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  input: {
    fontSize: 15,
    fontWeight: '800',
    minHeight: 30,
    padding: 0,
    paddingTop: 4,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  sheetButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 16,
    flex: 1,
    minHeight: 50,
    justifyContent: 'center',
  },
  sheetButtonText: {
    fontSize: 13,
    fontWeight: '900',
  },
  centerLayer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  confirmBox: {
    borderCurve: 'continuous',
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 20,
    width: '100%',
  },
  confirmText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
