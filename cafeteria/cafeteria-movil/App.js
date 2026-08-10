import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';

import CashierAccountsScreen from './src/screens/CashierAccountsScreen';
import CashierOrderDetailScreen from './src/screens/CashierOrderDetailScreen';
import CashierOrdersScreen from './src/screens/CashierOrdersScreen';
import CashierPurchasesScreen from './src/screens/CashierPurchasesScreen';
import CashierScreen from './src/screens/CashierScreen';
import CustomerMarketingScreen from './src/screens/CustomerMarketingScreen';
import CustomerOrdersScreen from './src/screens/CustomerOrdersScreen';
import CustomerOrderScreen from './src/screens/CustomerOrderScreen';
import CustomerScreen from './src/screens/CustomerScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import KitchenInventoryScreen from './src/screens/KitchenInventoryScreen';
import KitchenMenuScreen from './src/screens/KitchenMenuScreen';
import KitchenOrdersScreen from './src/screens/KitchenOrdersScreen';
import KitchenScreen from './src/screens/KitchenScreen';
import LoginScreen from './src/screens/LoginScreen';
import HelpScreen from './src/screens/HelpScreen';
import ActivityScreen from './src/screens/ActivityScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SessionContext from './src/context/SessionContext';
import { themes } from './src/theme/themes';
import { api, login } from './src/services/api';

const initialCustomerOrders = [
  {
    id: 'Pedido #31',
    detail: 'Mesa 2 · Café americano, pan dulce',
    status: 'En cocina',
    statusType: 'kitchen',
    stepsDone: 2,
    amount: '$95.00',
    action: 'Ver detalle',
    products: '2 cafés americanos, 1 pan dulce',
    notes: 'Sin azúcar en un café.',
  },
  {
    id: 'Pedido #32',
    detail: 'Mesa 4 · Latte, frappé, galleta',
    status: 'Listo',
    statusType: 'ready',
    stepsDone: 3,
    amount: '$160.00',
    action: 'Entregar',
    actionType: 'deliver',
    products: '1 latte, 1 frappé, 1 galleta artesanal',
    notes: 'Frappé sin crema.',
  },
  {
    id: 'Pedido #29',
    detail: 'Mesa 1 · Chocolate caliente',
    status: 'Entregado',
    statusType: 'delivered',
    stepsDone: 4,
    amount: '$48.00',
    action: 'Detalle',
    products: '1 chocolate caliente',
    notes: 'Entregado al cliente.',
  },
];

const initialCustomerDraft = {
  selectedTable: 'Mesa 3',
  observations: 'Sin azúcar en un café. Pan dulce para llevar.',
  products: [
    {
      icon: '☕',
      name: 'Café americano',
      price: 35,
      quantity: 2,
    },
    {
      icon: '🥐',
      name: 'Pan dulce',
      price: 25,
      quantity: 1,
    },
    {
      icon: '🥤',
      name: 'Frappé',
      price: 55,
      quantity: 0,
    },
    {
      icon: '🥛',
      name: 'Latte',
      price: 45,
      quantity: 0,
    },
    {
      icon: '🍳',
      name: 'Combo desayuno',
      price: 55,
      quantity: 0,
    },
    {
      icon: '🍫',
      name: 'Chocolate caliente',
      price: 48,
      quantity: 0,
    },
    {
      icon: '🥪',
      name: 'Sándwich de jamón',
      price: 65,
      quantity: 0,
    },
    {
      icon: '🍪',
      name: 'Galleta artesanal',
      price: 22,
      quantity: 0,
    },
    {
      icon: '🧊',
      name: 'Café frío',
      price: 42,
      quantity: 0,
    },
  ],
};

const initialKitchenMenuItems = [
  {
    id: 'menu-coffee',
    category: 'Bebidas',
    icon: '☕',
    name: 'Café americano',
    price: 35,
    available: true,
    featured: true,
    type: 'Platillo',
    description: 'Bebida caliente',
  },
  {
    id: 'menu-bread',
    category: 'Panadería',
    icon: '🥐',
    name: 'Pan dulce',
    price: 25,
    available: true,
    featured: false,
    type: 'Platillo',
    description: 'Panadería',
  },
  {
    id: 'menu-frappe',
    category: 'Bebidas',
    icon: '🥤',
    name: 'Frappé',
    price: 55,
    available: true,
    featured: false,
    type: 'Platillo',
    description: 'Bebida fría',
  },
  {
    id: 'menu-latte',
    category: 'Bebidas',
    icon: '🥛',
    name: 'Latte',
    price: 45,
    available: true,
    featured: false,
    type: 'Platillo',
    description: 'Café con leche',
  },
  {
    id: 'menu-breakfast-combo',
    category: 'Combos',
    icon: '🍳',
    name: 'Combo desayuno',
    price: 55,
    available: true,
    featured: true,
    type: 'Combo',
    description: 'Café + pan',
  },
  {
    id: 'menu-hot-chocolate',
    category: 'Temporada',
    icon: '🍫',
    name: 'Chocolate caliente',
    price: 48,
    available: true,
    featured: false,
    type: 'Especial',
    description: 'Temporada',
  },
  {
    id: 'menu-sandwich',
    category: 'Alimentos',
    icon: '🥪',
    name: 'Sándwich de jamón',
    price: 65,
    available: true,
    featured: false,
    type: 'Platillo',
    description: 'Alimento preparado',
  },
  {
    id: 'menu-cookie',
    category: 'Panadería',
    icon: '🍪',
    name: 'Galleta artesanal',
    price: 22,
    available: true,
    featured: false,
    type: 'Platillo',
    description: 'Postre',
  },
  {
    id: 'menu-cold-coffee',
    category: 'Bebidas',
    icon: '🧊',
    name: 'Café frío',
    price: 42,
    available: true,
    featured: false,
    type: 'Platillo',
    description: 'Bebida fría',
  },
];

const initialCashierExpenses = [
  {
    id: 'expense-operation',
    amount: 920,
    category: 'OperaciÃ³n',
    description: 'Gastos registrados',
  },
  {
    id: 'expense-purchase-milk',
    amount: 320,
    category: 'Suministros',
    description: 'Compra de leche',
  },
  {
    id: 'expense-purchase-coffee',
    amount: 480,
    category: 'Suministros',
    description: 'Compra de cafÃ© molido',
  },
];

const initialCashierPurchases = [
  {
    id: 'purchase-milk',
    expenseId: 'expense-purchase-milk',
    icon: 'ðŸ¥›',
    name: 'Leche',
    quantity: '10',
    unit: 'litros',
    detail: '10 litros Â· Hoy 10:30 AM',
    amount: 320,
    status: 'Registrada',
    type: 'paid',
    urgent: false,
  },
  {
    id: 'purchase-coffee',
    expenseId: 'expense-purchase-coffee',
    icon: 'â˜•',
    name: 'CafÃ© molido',
    quantity: '5',
    unit: 'kg',
    detail: '5 kg Â· Hoy 11:15 AM',
    amount: 480,
    status: 'Registrada',
    type: 'paid',
    urgent: false,
  },
  {
    id: 'purchase-cups',
    icon: 'ðŸ¥¤',
    name: 'Vasos',
    quantity: '100',
    unit: 'piezas',
    detail: '100 piezas Â· Pendiente',
    amount: 150,
    status: 'Pendiente',
    type: 'pending',
    urgent: true,
  },
];

const initialKitchenInventory = [
  {
    id: 'supply-coffee',
    icon: '☕',
    name: 'Café molido',
    quantity: 5,
    unit: 'kg',
    minimum: 2,
    category: 'Bebidas',
    updatedAt: 'Hoy 11:15 AM',
  },
  {
    id: 'supply-milk',
    icon: '🥛',
    name: 'Leche',
    quantity: 2,
    unit: 'litros',
    minimum: 5,
    category: 'Lácteos',
    updatedAt: 'Hoy 10:30 AM',
  },
  {
    id: 'supply-chocolate',
    icon: '🍫',
    name: 'Chocolate',
    quantity: 1,
    unit: 'kg',
    minimum: 3,
    category: 'Bebidas',
    updatedAt: 'Hoy 9:20 AM',
  },
  {
    id: 'supply-cups',
    icon: '🥤',
    name: 'Vasos',
    quantity: 42,
    unit: 'piezas',
    minimum: 60,
    category: 'Desechables',
    updatedAt: 'Ayer',
  },
  {
    id: 'supply-napkins',
    icon: '🧻',
    name: 'Servilletas',
    quantity: 8,
    unit: 'paquetes',
    minimum: 4,
    category: 'Desechables',
    updatedAt: 'Ayer',
  },
];

const initialUserProfile = {
  name: 'Fer',
  role: 'Administrador',
  email: 'fer.admin@coffee.local',
  phone: '55 1234 9876',
  shift: 'Turno matutino',
};

const allRoleScreens = [
  'activity',
  'cashier',
  'cashierAccounts',
  'cashierOrderDetail',
  'cashierOrders',
  'cashierPurchases',
  'customer',
  'customerMarketing',
  'customerOrder',
  'customerOrders',
  'dashboard',
  'help',
  'kitchen',
  'kitchenInventory',
  'kitchenMenu',
  'kitchenOrders',
  'login',
  'notifications',
  'profile',
  'settings',
];

const roleOptions = [
  {
    id: 'waiter',
    icon: '🧍',
    label: 'Mesero',
    description: 'Pedidos, mesas y promociones',
    name: 'Aarón',
    email: 'mesero@coffee.local',
    defaultScreen: 'dashboard',
    moduleTargets: ['customer'],
    drawerTargets: ['dashboard', 'customer', 'notifications', 'activity', 'profile', 'settings', 'help'],
    allowedScreens: ['dashboard', 'customer', 'customerMarketing', 'customerOrder', 'customerOrders', 'notifications', 'activity', 'profile', 'settings', 'help', 'login'],
  },
  {
    id: 'cashier',
    icon: '💵',
    label: 'Cajero',
    description: 'Pagos, cuentas y compras',
    name: 'Fer',
    email: 'caja@coffee.local',
    defaultScreen: 'dashboard',
    moduleTargets: ['cashier'],
    drawerTargets: ['dashboard', 'cashier', 'notifications', 'activity', 'profile', 'settings', 'help'],
    allowedScreens: ['dashboard', 'cashier', 'cashierAccounts', 'cashierOrderDetail', 'cashierOrders', 'cashierPurchases', 'notifications', 'activity', 'profile', 'settings', 'help', 'login'],
  },
  {
    id: 'kitchen',
    icon: '👨‍🍳',
    label: 'Cocina',
    description: 'Pedidos, inventario y menú',
    name: 'Claude',
    email: 'cocina@coffee.local',
    defaultScreen: 'dashboard',
    moduleTargets: ['kitchen', 'kitchenInventory'],
    drawerTargets: ['dashboard', 'kitchen', 'notifications', 'activity', 'profile', 'settings', 'help'],
    allowedScreens: ['dashboard', 'kitchen', 'kitchenInventory', 'kitchenMenu', 'kitchenOrders', 'notifications', 'activity', 'profile', 'settings', 'help', 'login'],
  },
  {
    id: 'admin',
    icon: '☕',
    label: 'Administrador',
    description: 'Acceso completo al sistema',
    name: 'Fer',
    email: 'fer.admin@coffee.local',
    defaultScreen: 'dashboard',
    moduleTargets: ['customer', 'cashier', 'kitchen', 'kitchenInventory'],
    drawerTargets: ['dashboard', 'customer', 'cashier', 'kitchen', 'notifications', 'activity', 'profile', 'settings', 'help'],
    allowedScreens: allRoleScreens,
  },
];

const roleMap = roleOptions.reduce((roles, role) => ({ ...roles, [role.id]: role }), {});

const apiRoleMap = { administrador: 'admin', admin: 'admin', mesero: 'waiter', caja: 'cashier', cajero: 'cashier', cocina: 'kitchen' };
const normalizeRole = (role) => apiRoleMap[String(role || '').toLowerCase()] || 'waiter';
const statusTypeFor = (status) => {
  const value = String(status || '').toLowerCase();
  if (value.includes('prepar')) return 'kitchen';
  if (value === 'listo') return 'ready';
  if (value === 'pagado') return 'delivered';
  if (value.includes('cancel')) return 'cancelled';
  return 'pending';
};
const mapOrder = (order) => ({
  id: `Pedido #${order.id_pedido}`, apiId: order.id_pedido, table: `Mesa ${order.id_mesa}`,
  detail: `Mesa ${order.id_mesa}`, status: order.estado, statusType: statusTypeFor(order.estado),
  kitchenStage: statusTypeFor(order.estado) === 'kitchen' ? 'preparing' : statusTypeFor(order.estado) === 'ready' ? 'ready' : 'queue',
  cashierStatus: order.estado === 'Pagado' ? 'paid' : 'pending',
  stepsDone: order.estado === 'Pagado' ? 4 : order.estado === 'Listo' ? 3 : order.estado === 'Pendiente' ? 1 : 2,
  amount: `$${Number(order.total || 0).toFixed(2)}`, total: Number(order.total || 0),
  notes: 'Sin observaciones.', products: 'Consulta el detalle del pedido',
});
const mapProduct = (product) => ({
  id: product.id_producto, menuId: product.id_producto, name: product.nombre,
  description: product.descripcion || '', price: Number(product.precio), available: product.activo,
  category: `Categoría ${product.id_categoria}`, icon: '☕', quantity: 0,
});
const mapIngredient = (item) => ({
  id: item.id_ingrediente, name: item.nombre, quantity: Number(item.stock),
  minimum: Number(item.stock_minimo), unit: item.unidad_medida, active: item.activo,
});

const initialAppSettings = {
  autoSync: true,
  cashierConfirmations: true,
  compactCards: false,
  kitchenDelayAlerts: true,
  lowStockAlerts: true,
  orderNotifications: true,
};

const initialSystemEvents = [
  {
    id: 'event-start-ready',
    createdAt: 'Hoy 9:41',
    detail: 'Pedido #32 listo para entregar a Mesa 4.',
    icon: '✅',
    module: 'Cocina',
    severity: 'success',
    title: 'Pedido listo',
    type: 'notification',
  },
  {
    id: 'event-start-stock',
    createdAt: 'Hoy 9:38',
    detail: 'Leche y chocolate estan por debajo del minimo configurado.',
    icon: '⚠️',
    module: 'Inventario',
    severity: 'warning',
    title: 'Stock bajo',
    type: 'notification',
  },
  {
    id: 'event-start-payment',
    createdAt: 'Hoy 9:35',
    detail: 'Caja confirmo un pago y envio el pedido a cocina.',
    icon: '💵',
    module: 'Caja',
    severity: 'success',
    title: 'Pago confirmado',
    type: 'activity',
  },
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [screen, setScreen] = useState('login');
  const [currentRoleId, setCurrentRoleId] = useState('admin');
  const [history, setHistory] = useState([]);
  const [customerOrders, setCustomerOrders] = useState(initialCustomerOrders);
  const [customerDraft, setCustomerDraft] = useState(initialCustomerDraft);
  const [cashierExpenses, setCashierExpenses] = useState(initialCashierExpenses);
  const [cashierPurchases, setCashierPurchases] = useState(initialCashierPurchases);
  const [kitchenInventory, setKitchenInventory] = useState(initialKitchenInventory);
  const [kitchenMenuItems, setKitchenMenuItems] = useState(initialKitchenMenuItems);
  const [userProfile, setUserProfile] = useState(initialUserProfile);
  const [appSettings, setAppSettings] = useState(initialAppSettings);
  const [systemEvents, setSystemEvents] = useState(initialSystemEvents);
  const [selectedCashierOrderId, setSelectedCashierOrderId] = useState(null);
  const theme = isDarkMode ? themes.dark : themes.light;
  const currentRole = roleMap[currentRoleId] || roleMap.admin;

  const canAccessScreen = (target, role = currentRole) => role.allowedScreens.includes(target);

  const navigate = (target) => {
    if (target === screen) {
      return;
    }

    if (target === 'login') {
      setHistory([]);
      setScreen('login');
      return;
    }

    if (!canAccessScreen(target)) {
      setHistory((currentHistory) => [...currentHistory, screen]);
      setScreen(currentRole.defaultScreen);
      return;
    }

    setHistory((currentHistory) => [...currentHistory, screen]);
    setScreen(target);
  };

  const goBack = () => {
    setHistory((currentHistory) => {
      const previousScreen = currentHistory[currentHistory.length - 1] || 'dashboard';
      setScreen(previousScreen);
      return currentHistory.slice(0, -1);
    });
  };

  const recordEvent = (event) => {
    setSystemEvents((currentEvents) => [
      {
        createdAt: 'Ahora',
        id: `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        severity: 'info',
        type: 'activity',
        ...event,
      },
      ...currentEvents,
    ].slice(0, 80));
  };

  const syncRoleData = async (roleId) => {
    const requests = [];
    if (roleId === 'admin' || roleId === 'waiter') {
      requests.push(api.get('/pedidos/').then((items) => setCustomerOrders(items.map(mapOrder))));
      requests.push(api.get('/productos/?activo=true').then((items) => {
        const products = items.map(mapProduct);
        setKitchenMenuItems(products);
        setCustomerDraft((draft) => ({ ...draft, products }));
      }));
    }
    if (roleId === 'admin' || roleId === 'kitchen') {
      requests.push(api.get('/cocina/pedidos').then((items) => setCustomerOrders(items.map(mapOrder))));
      requests.push(api.get('/cocina/menu/productos').then((items) => setKitchenMenuItems(items.map(mapProduct))));
      requests.push(api.get('/cocina/suministros').then((items) => setKitchenInventory(items.map(mapIngredient))));
    }
    if (roleId === 'admin' || roleId === 'cashier') {
      requests.push(api.get('/caja/pedidos').then((items) => setCustomerOrders(items.map(mapOrder))));
      requests.push(api.get('/caja/gastos').then((items) => setCashierExpenses(items.map((item) => ({
        id: item.id_gasto, description: item.concepto, category: item.categoria,
        amount: Number(item.monto), notes: item.descripcion,
      })))));
      requests.push(api.get('/caja/compras').then((items) => setCashierPurchases(items.map((item) => ({
        id: item.id_compra, name: item.proveedor, amount: Number(item.total),
        status: 'Registrada', type: 'paid',
      })))));
    }
    await Promise.all(requests);
  };

  const loginAsRole = async (username, password) => {
    const session = await login(username, password);
    const nextRole = roleMap[normalizeRole(session.rol)] || roleMap.waiter;

    setCurrentRoleId(nextRole.id);
    setUserProfile((currentProfile) => ({
      ...currentProfile,
      email: username,
      name: session.usuario,
      role: nextRole.label,
    }));
    setHistory([]);
    setScreen(nextRole.defaultScreen);
    await syncRoleData(nextRole.id);
    recordEvent({
      detail: `${nextRole.name} inició sesión como ${nextRole.label}.`,
      icon: nextRole.icon,
      module: 'Sistema',
      severity: 'info',
      title: 'Inicio de sesión',
      type: 'activity',
    });
  };

  const addCustomerOrder = async (order) => {
    const idMesa = Number(String(order.table || '').match(/\d+/)?.[0]);
    if (!idMesa) throw new Error('Selecciona una mesa válida.');
    const created = await api.post('/pedidos/', { id_mesa: idMesa });
    for (const product of order.productItems || []) {
      if (product.menuId || product.id) {
        await api.post('/detalle-pedido/', {
          id_pedido: created.id_pedido,
          id_producto: product.menuId || product.id,
          cantidad: product.quantity,
        });
      }
    }
    const savedOrder = mapOrder(created);
    setCustomerOrders((currentOrders) => [savedOrder, ...currentOrders]);
    recordEvent({
      detail: `${order.id} levantado para ${order.table || 'mesa'} por ${order.amount}.`,
      icon: '🧾',
      module: 'Cliente / Mesero',
      severity: 'info',
      title: 'Pedido creado',
      type: 'notification',
    });
  };

  const updateCustomerOrder = async (orderId, updater) => {
    const current = customerOrders.find((order) => order.id === orderId);
    if (!current?.apiId) return;
    const updated = updater(current);
    let saved;
    if (updated.statusType === 'kitchen') {
      saved = await api.put(`/cocina/pedidos/${current.apiId}/preparar`);
    } else if (updated.statusType === 'ready') {
      saved = await api.put(`/cocina/pedidos/${current.apiId}/listo`);
    } else if (updated.cashierStatus === 'paid') {
      saved = await api.put(`/caja/pedidos/${current.apiId}/cobrar`);
    } else {
      return;
    }
    const normalized = mapOrder(saved);
    setCustomerOrders((currentOrders) =>
      currentOrders.map((order) => (order.id === orderId ? { ...order, ...updated, ...normalized } : order)),
    );
  };

  const openCashierOrderDetail = (orderId) => {
    setSelectedCashierOrderId(orderId);
    navigate('cashierOrderDetail');
  };

  const updateCustomerDraft = (updater) => {
    setCustomerDraft((currentDraft) => updater(currentDraft));
  };

  const resetCustomerDraft = () => {
    setCustomerDraft(initialCustomerDraft);
  };

  const addMarketingItemToDraft = (item) => {
    setCustomerDraft((currentDraft) => {
      const productExists = currentDraft.products.some((product) => product.name === item.name);
      const products = productExists
        ? currentDraft.products.map((product) =>
            product.name === item.name ? { ...product, quantity: product.quantity + 1 } : product,
          )
        : [...currentDraft.products, { ...item, quantity: 1 }];
      const note = `Sugerido por marketing: ${item.name}.`;
      const hasNote = currentDraft.observations.includes(note);

      return {
        ...currentDraft,
        observations: hasNote ? currentDraft.observations : `${currentDraft.observations}\n${note}`.trim(),
        products,
      };
    });
  };

  const addCashierExpense = (expense) => {
    setCashierExpenses((currentExpenses) => [expense, ...currentExpenses]);
    recordEvent({
      detail: `${expense.description || 'Gasto'} por $${Number(expense.amount || 0).toFixed(2)}.`,
      icon: '🧾',
      module: 'Caja',
      severity: 'warning',
      title: 'Gasto registrado',
      type: 'activity',
    });
  };

  const updateCashierExpense = (expenseId, updater) => {
    setCashierExpenses((currentExpenses) =>
      currentExpenses.map((expense) => (expense.id === expenseId ? updater(expense) : expense)),
    );
  };

  const deleteCashierExpense = (expenseId) => {
    setCashierExpenses((currentExpenses) => currentExpenses.filter((expense) => expense.id !== expenseId));
    recordEvent({
      detail: 'Se elimino un gasto de cuentas.',
      icon: '🗑️',
      module: 'Caja',
      severity: 'warning',
      title: 'Gasto eliminado',
      type: 'activity',
    });
  };

  const addCashierPurchase = (purchase) => {
    setCashierPurchases((currentPurchases) => [purchase, ...currentPurchases]);
    recordEvent({
      detail: `${purchase.name} por $${Number(purchase.amount || 0).toFixed(2)} quedó ${purchase.status || 'registrada'}.`,
      icon: '🛒',
      module: 'Caja',
      severity: purchase.type === 'pending' ? 'warning' : 'success',
      title: 'Compra registrada',
      type: 'notification',
    });
  };

  const updateCashierPurchase = (purchaseId, updater) => {
    setCashierPurchases((currentPurchases) =>
      currentPurchases.map((purchase) => (purchase.id === purchaseId ? updater(purchase) : purchase)),
    );
  };

  const deleteCashierPurchase = (purchaseId) => {
    setCashierPurchases((currentPurchases) => currentPurchases.filter((purchase) => purchase.id !== purchaseId));
  };

  const addKitchenInventoryItem = (item) => {
    setKitchenInventory((currentInventory) => [item, ...currentInventory]);
    recordEvent({
      detail: `${item.name} agregado con ${item.quantity} ${item.unit}.`,
      icon: '📦',
      module: 'Inventario',
      severity: 'success',
      title: 'Insumo agregado',
      type: 'activity',
    });
  };

  const updateKitchenInventoryItem = (itemId, updater) => {
    setKitchenInventory((currentInventory) =>
      currentInventory.map((item) => (item.id === itemId ? updater(item) : item)),
    );
  };

  const deleteKitchenInventoryItem = (itemId) => {
    setKitchenInventory((currentInventory) => currentInventory.filter((item) => item.id !== itemId));
    recordEvent({
      detail: 'Se elimino un insumo del inventario.',
      icon: '🗑️',
      module: 'Inventario',
      severity: 'warning',
      title: 'Insumo eliminado',
      type: 'activity',
    });
  };

  const addKitchenMenuItem = (item) => {
    setKitchenMenuItems((currentItems) => [item, ...currentItems]);
    recordEvent({
      detail: `${item.name} agregado al menu por $${Number(item.price || 0).toFixed(2)}.`,
      icon: '🍽️',
      module: 'Cocina',
      severity: 'success',
      title: 'Producto de menu agregado',
      type: 'activity',
    });
  };

  const updateKitchenMenuItem = (itemId, updater) => {
    setKitchenMenuItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? updater(item) : item)),
    );
  };

  const deleteKitchenMenuItem = (itemId) => {
    setKitchenMenuItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
    setCustomerDraft((currentDraft) => ({
      ...currentDraft,
      products: currentDraft.products.filter((product) => product.menuId !== itemId),
    }));
    recordEvent({
      detail: 'Se elimino un producto del menu y del pedido en curso.',
      icon: '🗑️',
      module: 'Cocina',
      severity: 'warning',
      title: 'Producto eliminado',
      type: 'activity',
    });
  };

  const updateUserProfile = (updater) => {
    setUserProfile((currentProfile) => updater(currentProfile));
  };

  const updateAppSetting = (key, value) => {
    setAppSettings((currentSettings) => ({
      ...currentSettings,
      [key]: value,
    }));
  };

  const sharedProps = {
    appSettings,
    systemEvents,
    recordEvent,
    addCustomerOrder,
    addCashierExpense,
    addCashierPurchase,
    addKitchenInventoryItem,
    addKitchenMenuItem,
    addMarketingItemToDraft,
    cashierExpenses,
    cashierPurchases,
    customerDraft,
    customerOrders,
    currentRole,
    currentRoleId,
    deleteCashierExpense,
    deleteCashierPurchase,
    deleteKitchenInventoryItem,
    deleteKitchenMenuItem,
    goBack,
    isDarkMode,
    kitchenInventory,
    kitchenMenuItems,
    loginAsRole,
    navigate,
    openCashierOrderDetail,
    resetCustomerDraft,
    roleOptions,
    selectedCashierOrderId,
    setSelectedCashierOrderId,
    setIsDarkMode,
    theme,
    updateAppSetting,
    updateCashierExpense,
    updateCashierPurchase,
    updateCustomerDraft,
    updateCustomerOrder,
    updateKitchenInventoryItem,
    updateKitchenMenuItem,
    updateUserProfile,
    userProfile,
  };

  return (
    <SessionContext.Provider value={{ currentRole, currentRoleId, userProfile }}>
      <KeyboardAvoidingView style={[styles.app, { backgroundColor: theme.background }]} behavior="padding">
        <StatusBar hidden style={theme.statusBar} />

        {screen === 'login' && <LoginScreen {...sharedProps} />}
        {screen === 'dashboard' && <DashboardScreen {...sharedProps} />}
        {screen === 'activity' && <ActivityScreen {...sharedProps} />}
        {screen === 'cashier' && <CashierScreen {...sharedProps} />}
        {screen === 'cashierAccounts' && <CashierAccountsScreen {...sharedProps} />}
        {screen === 'cashierOrderDetail' && <CashierOrderDetailScreen {...sharedProps} />}
        {screen === 'cashierOrders' && <CashierOrdersScreen {...sharedProps} />}
        {screen === 'cashierPurchases' && <CashierPurchasesScreen {...sharedProps} />}
        {screen === 'customer' && <CustomerScreen {...sharedProps} />}
        {screen === 'customerMarketing' && <CustomerMarketingScreen {...sharedProps} />}
        {screen === 'customerOrder' && <CustomerOrderScreen {...sharedProps} />}
        {screen === 'customerOrders' && <CustomerOrdersScreen {...sharedProps} />}
        {screen === 'help' && <HelpScreen {...sharedProps} />}
        {screen === 'kitchen' && <KitchenScreen {...sharedProps} />}
        {screen === 'kitchenInventory' && <KitchenInventoryScreen {...sharedProps} />}
        {screen === 'kitchenMenu' && <KitchenMenuScreen {...sharedProps} />}
        {screen === 'kitchenOrders' && <KitchenOrdersScreen {...sharedProps} />}
        {screen === 'notifications' && <NotificationsScreen {...sharedProps} />}
        {screen === 'profile' && <ProfileScreen {...sharedProps} />}
        {screen === 'settings' && <SettingsScreen {...sharedProps} />}
      </KeyboardAvoidingView>
    </SessionContext.Provider>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
});
