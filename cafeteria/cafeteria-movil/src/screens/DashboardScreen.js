import { StyleSheet, Text, View } from 'react-native';

import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import MockStatusBar from '../components/MockStatusBar';
import ModuleCard from '../components/ModuleCard';
import ScreenBackground from '../components/ScreenBackground';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import SummaryCard from '../components/SummaryCard';
import { dashboardModules, dashboardStats } from '../data/appData';

const weeklySales = [
  { day: 'Lun', value: 420 },
  { day: 'Mar', value: 510 },
  { day: 'Mié', value: 360 },
  { day: 'Jue', value: 580 },
  { day: 'Vie', value: 690 },
  { day: 'Sáb', value: 820 },
  { day: 'Dom', value: 740 },
];

const hourlySales = [
  { label: '7-10', value: 38 },
  { label: '10-13', value: 62 },
  { label: '13-16', value: 44 },
  { label: '16-19', value: 71 },
  { label: '19-22', value: 29 },
];

const bestSellers = [
  { icon: '☕', label: 'Café americano', value: 64 },
  { icon: '🥐', label: 'Pan dulce', value: 48 },
  { icon: '🥤', label: 'Frappé', value: 36 },
  { icon: '🍫', label: 'Chocolate', value: 28 },
  { icon: '⭐', label: 'Combo desayuno', value: 22 },
];

const orderStates = [
  { label: 'Pendientes', value: 9, color: '#f59e0b' },
  { label: 'En cocina', value: 14, color: '#d97706' },
  { label: 'Listos', value: 7, color: '#16a34a' },
  { label: 'Cancelados', value: 2, color: '#dc2626' },
];

const criticalStock = [
  { icon: '🥛', label: 'Leche', detail: '2 L disponibles', level: 'Crítico' },
  { icon: '🍫', label: 'Chocolate', detail: '1 kg disponible', level: 'Bajo' },
  { icon: '🥤', label: 'Vasos', detail: '32 piezas', level: 'Comprar' },
];

const financeStats = [
  { label: 'Ventas', value: 4850 },
  { label: 'Gastos', value: 1870 },
  { label: 'Ganancia', value: 2980 },
];

const paymentMethods = [
  { label: 'Efectivo', value: 46 },
  { label: 'Tarjeta', value: 38 },
  { label: 'Transferencia', value: 16 },
];

const modulePerformance = [
  { icon: '🧍', label: 'Mesero', value: '15 pedidos', detail: '4 en proceso' },
  { icon: '💵', label: 'Caja', value: '18 pagos', detail: '$4,850 ventas' },
  { icon: '👨‍🍳', label: 'Cocina', value: '12 listos', detail: '5 en preparación' },
];

export default function DashboardScreen({ currentRole, isDarkMode, setIsDarkMode, theme, navigate, userProfile }) {
  const maxSales = Math.max(...weeklySales.map((sale) => sale.value));
  const maxHourlySales = Math.max(...hourlySales.map((sale) => sale.value));
  const maxBestSeller = Math.max(...bestSellers.map((product) => product.value));
  const maxOrderState = Math.max(...orderStates.map((state) => state.value));
  const maxFinance = Math.max(...financeStats.map((stat) => stat.value));
  const visibleModules = currentRole?.moduleTargets
    ? dashboardModules.filter((module) => currentRole.moduleTargets.includes(module.target))
    : dashboardModules;

  return (
    <ScreenBackground isDarkMode={isDarkMode} theme={theme} contentStyle={styles.screen}>
      <View style={styles.content}>
        <MockStatusBar isDarkMode={isDarkMode} navigate={navigate} setIsDarkMode={setIsDarkMode} theme={theme} />

        <AppHeader
          eyebrow="Bienvenido"
          title={userProfile?.name || 'Fer'}
          subtitle={`${userProfile?.role || 'Administrador'} · Sistema de cafetería`}
          icon={currentRole?.icon || '☕'}
          isDarkMode={isDarkMode}
          theme={theme}
        />

        <SummaryCard
          title="Resumen del día"
          amount="$2,450.00"
          subtitle="Ventas registradas hoy"
          icon="📊"
          isDarkMode={isDarkMode}
          theme={theme}
        />

        <View style={styles.statsRow}>
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} {...stat} theme={theme} />
          ))}
        </View>

        <SectionTitle title="Módulos principales" subtitle="Selecciona el área que deseas usar" theme={theme} />

        <View style={styles.modulesGrid}>
          {visibleModules.map((module) => (
            <ModuleCard
              key={module.title}
              item={module}
              isDarkMode={isDarkMode}
              theme={theme}
              onPress={() => {
                navigate(module.target);
              }}
            />
          ))}
        </View>

        <View
          style={[
            styles.recentCard,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.14)' : 'rgba(120, 53, 15, 0)',
            },
          ]}
        >
          <View style={styles.recentHeader}>
            <Text selectable style={[styles.recentTitle, { color: theme.title }]}>
              Último pedido
            </Text>
            <View
              style={[
                styles.activeBadge,
                {
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.10)' : '#ffffff',
                  borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.18)' : 'rgba(120, 53, 15, 0)',
                },
              ]}
            >
              <Text style={[styles.activeBadgeText, { color: theme.amber }]}>Activo</Text>
            </View>
          </View>

          <View style={styles.orderInfo}>
            <View>
              <Text selectable style={[styles.orderTitle, { color: theme.title }]}>
                Pedido #15
              </Text>
              <Text selectable style={[styles.orderDetail, { color: theme.muted }]}>
                Mesa 3 · En preparación
              </Text>
            </View>
            <Text selectable style={[styles.orderAmount, { color: isDarkMode ? theme.amber : theme.title }]}>
              $180.00
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.weeklyCard,
            {
              backgroundColor: isDarkMode ? 'rgba(87, 53, 34, 0.50)' : 'rgba(120, 53, 15, 0.10)',
              borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.14)' : 'rgba(120, 53, 15, 0.08)',
            },
          ]}
        >
          <Text selectable style={[styles.weeklyTitle, { color: theme.title }]}>
            Ventas de la semana
          </Text>

          <View style={styles.chartRow}>
            {weeklySales.map((sale) => {
              const barHeight = 36 + (sale.value / maxSales) * 66;

              return (
                <View key={sale.day} style={styles.chartItem}>
                  <Text selectable style={[styles.chartValue, { color: theme.muted }]}>
                    {sale.value}
                  </Text>
                  <View
                    style={[
                      styles.chartBar,
                      {
                        height: barHeight,
                        backgroundColor: isDarkMode ? '#d97706' : theme.accentAlt,
                      },
                    ]}
                  />
                  <Text selectable style={[styles.chartLabel, { color: theme.muted }]}>
                    {sale.day}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        <AnalyticsCard isDarkMode={isDarkMode} theme={theme} title="Ventas por hora">
          <View style={styles.hourGrid}>
            {hourlySales.map((sale) => (
              <View key={sale.label} style={styles.hourItem}>
                <View
                  style={[
                    styles.hourBarTrack,
                    {
                      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(120, 53, 15, 0.08)',
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.hourBarFill,
                      {
                        height: `${Math.max(22, (sale.value / maxHourlySales) * 100)}%`,
                        backgroundColor: isDarkMode ? '#d97706' : theme.accentAlt,
                      },
                    ]}
                  />
                </View>
                <Text selectable style={[styles.hourValue, { color: theme.title }]}>
                  {sale.value}
                </Text>
                <Text selectable style={[styles.hourLabel, { color: theme.muted }]}>
                  {sale.label}
                </Text>
              </View>
            ))}
          </View>
        </AnalyticsCard>

        <AnalyticsCard isDarkMode={isDarkMode} theme={theme} title="Productos más vendidos">
          <View style={styles.metricList}>
            {bestSellers.map((product) => (
              <HorizontalMetric
                key={product.label}
                color={isDarkMode ? '#d97706' : theme.accentAlt}
                icon={product.icon}
                label={product.label}
                max={maxBestSeller}
                theme={theme}
                value={product.value}
                valueSuffix="u"
              />
            ))}
          </View>
        </AnalyticsCard>

        <AnalyticsCard isDarkMode={isDarkMode} theme={theme} title="Pedidos por estado">
          <View style={styles.metricList}>
            {orderStates.map((state) => (
              <HorizontalMetric
                key={state.label}
                color={state.color}
                label={state.label}
                max={maxOrderState}
                theme={theme}
                value={state.value}
              />
            ))}
          </View>
        </AnalyticsCard>

        <AnalyticsCard isDarkMode={isDarkMode} theme={theme} title="Stock crítico">
          <View style={styles.stockList}>
            {criticalStock.map((item) => (
              <View
                key={item.label}
                style={[
                  styles.stockRow,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.70)',
                  },
                ]}
              >
                <Text style={styles.stockIcon}>{item.icon}</Text>
                <View style={styles.stockCopy}>
                  <Text selectable style={[styles.stockTitle, { color: theme.title }]}>
                    {item.label}
                  </Text>
                  <Text selectable style={[styles.stockDetail, { color: theme.muted }]}>
                    {item.detail}
                  </Text>
                </View>
                <View style={[styles.stockBadge, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.14)' : '#ffedd5' }]}>
                  <Text selectable style={[styles.stockBadgeText, { color: isDarkMode ? '#fb923c' : '#c2410c' }]}>
                    {item.level}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </AnalyticsCard>

        <AnalyticsCard isDarkMode={isDarkMode} theme={theme} title="Ganancia vs gastos">
          <View style={styles.metricList}>
            {financeStats.map((stat) => (
              <HorizontalMetric
                key={stat.label}
                color={stat.label === 'Gastos' ? '#dc2626' : stat.label === 'Ganancia' ? '#16a34a' : theme.accentAlt}
                label={stat.label}
                max={maxFinance}
                money
                theme={theme}
                value={stat.value}
              />
            ))}
          </View>
        </AnalyticsCard>

        <AnalyticsCard isDarkMode={isDarkMode} theme={theme} title="Métodos de pago">
          <View style={styles.paymentRow}>
            {paymentMethods.map((method) => (
              <View
                key={method.label}
                style={[
                  styles.paymentItem,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.72)',
                  },
                ]}
              >
                <Text selectable style={[styles.paymentValue, { color: theme.title }]}>
                  {method.value}%
                </Text>
                <View style={[styles.paymentPill, { backgroundColor: isDarkMode ? '#d97706' : theme.accentAlt, width: `${method.value}%` }]} />
                <Text selectable style={[styles.paymentLabel, { color: theme.muted }]}>
                  {method.label}
                </Text>
              </View>
            ))}
          </View>
        </AnalyticsCard>

        <AnalyticsCard isDarkMode={isDarkMode} theme={theme} title="Rendimiento por módulo">
          <View style={styles.modulePerfGrid}>
            {modulePerformance.map((module) => (
              <View
                key={module.label}
                style={[
                  styles.modulePerfCard,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.72)',
                  },
                ]}
              >
                <Text style={styles.modulePerfIcon}>{module.icon}</Text>
                <Text selectable style={[styles.modulePerfTitle, { color: theme.title }]}>
                  {module.label}
                </Text>
                <Text selectable style={[styles.modulePerfValue, { color: theme.amber }]}>
                  {module.value}
                </Text>
                <Text selectable style={[styles.modulePerfDetail, { color: theme.muted }]}>
                  {module.detail}
                </Text>
              </View>
            ))}
          </View>
        </AnalyticsCard>

        <View
          style={[
            styles.ticketCard,
            {
              backgroundColor: isDarkMode ? 'rgba(217, 119, 6, 0.16)' : 'rgba(120, 53, 15, 0.10)',
              borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.18)' : 'rgba(120, 53, 15, 0.08)',
            },
          ]}
        >
          <View>
            <Text selectable style={[styles.ticketLabel, { color: theme.muted }]}>
              Ticket promedio
            </Text>
            <Text selectable style={[styles.ticketValue, { color: theme.title }]}>
              $145.00
            </Text>
            <Text selectable style={[styles.ticketDetail, { color: theme.muted }]}>
              +8% comparado con ayer
            </Text>
          </View>
          <View style={[styles.ticketIconWrap, { backgroundColor: isDarkMode ? 'rgba(245,158,11,0.14)' : '#ffffff' }]}>
            <Text style={styles.ticketIcon}>🧾</Text>
          </View>
        </View>
      </View>

      <BottomNav active="dashboard" isDarkMode={isDarkMode} navigate={navigate} theme={theme} />
    </ScreenBackground>
  );
}

function AnalyticsCard({ children, isDarkMode, theme, title }) {
  return (
    <View
      style={[
        styles.analyticsCard,
        {
          backgroundColor: isDarkMode ? 'rgba(87, 53, 34, 0.50)' : 'rgba(120, 53, 15, 0.08)',
          borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.14)' : 'rgba(120, 53, 15, 0.06)',
        },
      ]}
    >
      <Text selectable style={[styles.analyticsTitle, { color: theme.title }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function HorizontalMetric({ color, icon, label, max, money = false, theme, value, valueSuffix = '' }) {
  const displayValue = money ? `$${value.toLocaleString('en-US')}` : `${value}${valueSuffix}`;

  return (
    <View style={styles.horizontalMetric}>
      <View style={styles.metricHeader}>
        <Text selectable style={[styles.metricLabel, { color: theme.title }]}>
          {icon ? `${icon} ` : ''}
          {label}
        </Text>
        <Text selectable style={[styles.metricValue, { color: theme.amber }]}>
          {displayValue}
        </Text>
      </View>
      <View style={[styles.metricTrack, { backgroundColor: 'rgba(120, 53, 15, 0.12)' }]}>
        <View style={[styles.metricFill, { backgroundColor: color, width: `${Math.max(8, (value / max) * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    minHeight: 1820,
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
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 14,
  },
  recentCard: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 15,
  },
  recentHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  activeBadge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  orderInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
  },
  orderTitle: {
    fontSize: 13,
    fontWeight: '900',
  },
  orderDetail: {
    fontSize: 11,
    paddingTop: 3,
  },
  orderAmount: {
    fontSize: 14,
    fontWeight: '900',
  },
  weeklyCard: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 17,
    paddingTop: 17,
    paddingBottom: 18,
  },
  weeklyTitle: {
    fontSize: 19,
    fontWeight: '900',
  },
  chartRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 145,
    paddingTop: 16,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartValue: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    paddingBottom: 6,
  },
  chartBar: {
    borderCurve: 'continuous',
    borderRadius: 10,
    width: 16,
  },
  chartLabel: {
    fontSize: 11,
    paddingTop: 7,
  },
  analyticsCard: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  analyticsTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  hourGrid: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
    minHeight: 136,
    paddingTop: 14,
  },
  hourItem: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  hourBarTrack: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    height: 78,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    width: 24,
  },
  hourBarFill: {
    borderCurve: 'continuous',
    borderRadius: 14,
    width: '100%',
  },
  hourValue: {
    fontSize: 11,
    fontWeight: '900',
    paddingTop: 7,
  },
  hourLabel: {
    fontSize: 10,
    paddingTop: 3,
  },
  metricList: {
    gap: 12,
    paddingTop: 14,
  },
  horizontalMetric: {
    gap: 7,
  },
  metricHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  metricLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  metricValue: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
  },
  metricTrack: {
    borderCurve: 'continuous',
    borderRadius: 999,
    height: 9,
    overflow: 'hidden',
  },
  metricFill: {
    borderCurve: 'continuous',
    borderRadius: 999,
    height: '100%',
  },
  stockList: {
    gap: 10,
    paddingTop: 14,
  },
  stockRow: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 12,
  },
  stockIcon: {
    fontSize: 20,
  },
  stockCopy: {
    flex: 1,
  },
  stockTitle: {
    fontSize: 12,
    fontWeight: '900',
  },
  stockDetail: {
    fontSize: 10,
    paddingTop: 2,
  },
  stockBadge: {
    borderCurve: 'continuous',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  stockBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
  },
  paymentItem: {
    borderCurve: 'continuous',
    borderRadius: 16,
    flex: 1,
    padding: 11,
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '900',
  },
  paymentPill: {
    borderCurve: 'continuous',
    borderRadius: 999,
    height: 7,
    marginTop: 8,
    minWidth: 10,
  },
  paymentLabel: {
    fontSize: 10,
    paddingTop: 8,
  },
  modulePerfGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 14,
  },
  modulePerfCard: {
    borderCurve: 'continuous',
    borderRadius: 16,
    flex: 1,
    padding: 11,
  },
  modulePerfIcon: {
    fontSize: 19,
  },
  modulePerfTitle: {
    fontSize: 11,
    fontWeight: '900',
    paddingTop: 8,
  },
  modulePerfValue: {
    fontSize: 11,
    fontWeight: '900',
    paddingTop: 5,
  },
  modulePerfDetail: {
    fontSize: 9,
    lineHeight: 12,
    paddingTop: 4,
  },
  ticketCard: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    padding: 17,
  },
  ticketLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  ticketValue: {
    fontSize: 27,
    fontWeight: '900',
    paddingTop: 4,
  },
  ticketDetail: {
    fontSize: 11,
    paddingTop: 4,
  },
  ticketIconWrap: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    width: 54,
  },
  ticketIcon: {
    fontSize: 25,
  },
});
