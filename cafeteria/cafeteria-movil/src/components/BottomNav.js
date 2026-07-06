import { Pressable, StyleSheet, Text, View } from 'react-native';

const defaultItems = [
  { icon: '🏠', label: 'Inicio', target: 'dashboard' },
  { icon: '👨‍🍳', label: 'Cocina', target: 'kitchen' },
  { icon: '📦', label: 'Stock', target: 'kitchenInventory' },
  { icon: '👤', label: 'Perfil', target: 'profile' },
];

export default function BottomNav({ active, isDarkMode, navigate, theme }) {
  const items =
    active === 'cashier'
      ? [
          { icon: '🏠', label: 'Inicio', target: 'dashboard' },
          { icon: '💵', label: 'Caja', target: 'cashier' },
          { icon: '🧾', label: 'Pedidos', target: 'cashierOrders' },
          { icon: '👤', label: 'Perfil', target: 'profile' },
        ]
      : active === 'cashierOrders'
        ? [
            { icon: '🏠', label: 'Inicio', target: 'dashboard' },
            { icon: '💵', label: 'Caja', target: 'cashier' },
            { icon: '🧾', label: 'Pedidos', target: 'cashierOrders' },
            { icon: '👤', label: 'Perfil', target: 'profile' },
          ]
        : active === 'customer'
          ? [
              { icon: '🏠', label: 'Inicio', target: 'customer' },
              { icon: '📝', label: 'Pedidos', target: 'customerOrders' },
              { icon: '📢', label: 'Promo', target: 'customerMarketing' },
              { icon: '👤', label: 'Perfil', target: 'profile' },
            ]
          : active === 'customerOrder'
            ? [
                { icon: '🏠', label: 'Inicio', target: 'customer' },
                { icon: '📝', label: 'Pedido', target: 'customerOrder' },
                { icon: '🧾', label: 'Mis pedidos', target: 'customerOrders' },
                { icon: '👤', label: 'Perfil', target: 'profile' },
              ]
            : active === 'customerOrders'
              ? [
                  { icon: '🏠', label: 'Inicio', target: 'customer' },
                  { icon: '🧾', label: 'Pedidos', target: 'customerOrders' },
                  { icon: '📢', label: 'Promo', target: 'customerMarketing' },
                  { icon: '👤', label: 'Perfil', target: 'profile' },
                ]
              : active === 'customerMarketing'
                ? [
                    { icon: '🏠', label: 'Inicio', target: 'customer' },
                    { icon: '📝', label: 'Pedido', target: 'customerOrder' },
                    { icon: '📢', label: 'Promo', target: 'customerMarketing' },
                    { icon: '👤', label: 'Perfil', target: 'profile' },
                  ]
                : active === 'kitchenOrders'
                  ? [
                      { icon: '🏠', label: 'Inicio', target: 'dashboard' },
                      { icon: '👨‍🍳', label: 'Cocina', target: 'kitchen' },
                      { icon: '📦', label: 'Stock', target: 'kitchenInventory' },
                      { icon: '👤', label: 'Perfil', target: 'profile' },
                    ]
      : defaultItems;

  return (
    <View
      style={[
        styles.bottomNav,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
          boxShadow: isDarkMode ? '0 10px 28px rgba(0, 0, 0, 0.35)' : '0 10px 28px rgba(0, 0, 0, 0.12)',
        },
      ]}
    >
      {items.map((item) => {
        const isActive = item.target === active;

        return (
          <Pressable
            key={item.label}
            accessibilityLabel={item.label}
            onPress={() => {
              if (
                item.target === 'dashboard' ||
                item.target === 'cashier' ||
                item.target === 'cashierOrders' ||
                item.target === 'customer' ||
                item.target === 'customerMarketing' ||
                item.target === 'customerOrder' ||
                item.target === 'customerOrders' ||
                item.target === 'kitchen' ||
                item.target === 'kitchenInventory'
                || item.target === 'kitchenOrders' ||
                item.target === 'profile' ||
                item.target === 'notifications' ||
                item.target === 'activity'
              ) {
                navigate(item.target);
              }
            }}
            style={styles.navItem}
          >
            <Text style={[styles.navIcon, { color: isActive ? theme.amber : theme.navInactive }]}>{item.icon}</Text>
            <Text selectable style={[styles.navLabel, { color: isActive ? theme.amber : theme.navInactive }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 24,
    borderWidth: 1,
    bottom: 18,
    flexDirection: 'row',
    height: 62,
    justifyContent: 'space-around',
    left: 31,
    position: 'absolute',
    right: 31,
    zIndex: 3,
  },
  navItem: {
    alignItems: 'center',
    minWidth: 42,
  },
  navIcon: {
    fontSize: 19,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    paddingTop: 2,
  },
});
