import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import CashierTabs from '../components/CashierTabs';
import EmptyState from '../components/EmptyState';
import MockStatusBar from '../components/MockStatusBar';
import ScreenBackground from '../components/ScreenBackground';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import SummaryCard from '../components/SummaryCard';

const paymentOptions = ['Efectivo', 'Tarjeta', 'Transferencia'];

const initialMovements = [
  { icon: '✅', text: 'Pedido #23 confirmado y enviado a cocina' },
  { icon: '❌', text: 'Pedido #21 cancelado por caja' },
];

export default function CashierOrdersScreen({
  customerOrders,
  goBack,
  isDarkMode,
  openCashierOrderDetail,
  recordEvent,
  setIsDarkMode,
  theme,
  navigate,
  updateCustomerOrder,
}) {
  const [selectedPayments, setSelectedPayments] = useState({});
  const [decision, setDecision] = useState(null);
  const [paymentEdit, setPaymentEdit] = useState(null);
  const [movements, setMovements] = useState(initialMovements);

  const cashierOrders = customerOrders.filter((order) => order.statusType !== 'delivered');
  const pendingOrders = cashierOrders.filter((order) => order.statusType === 'pending');
  const confirmedOrders = cashierOrders.filter((order) => ['kitchen', 'ready'].includes(order.statusType));
  const canceledOrders = cashierOrders.filter((order) => order.statusType === 'cancelled');
  const previewOrder = pendingOrders[0] || cashierOrders[0];
  const orderStats = [
    { icon: '🧾', value: String(pendingOrders.length), label: 'Recibidos' },
    { icon: '✅', value: String(confirmedOrders.length), label: 'Confirmados' },
    { icon: '❌', value: String(canceledOrders.length), label: 'Cancelados' },
  ];

  const getPaymentMethod = (order) => selectedPayments[order.id] || order.paymentMethod || 'Efectivo';

  const updatePaymentMethod = (orderId, paymentMethod) => {
    setSelectedPayments((currentPayments) => ({
      ...currentPayments,
      [orderId]: paymentMethod,
    }));
  };

  const openPaymentEdit = (order) => {
    setPaymentEdit({
      order,
      paymentMethod: order.paymentMethod || 'Efectivo',
    });
  };

  const changePaymentEdit = (paymentMethod) => {
    setPaymentEdit((currentEdit) => (currentEdit ? { ...currentEdit, paymentMethod } : currentEdit));
  };

  const savePaymentEdit = () => {
    if (!paymentEdit) {
      return;
    }

    updateCustomerOrder(paymentEdit.order.id, (order) => ({
      ...order,
      paymentMethod: paymentEdit.paymentMethod,
    }));
    recordEvent?.({
      detail: `${paymentEdit.order.id} cambió método de pago a ${paymentEdit.paymentMethod}.`,
      icon: '💳',
      module: 'Caja',
      severity: 'info',
      title: 'Método de pago editado',
      type: 'activity',
    });
    updatePaymentMethod(paymentEdit.order.id, paymentEdit.paymentMethod);
    setMovements((currentMovements) => [
      { icon: '💳', text: `${paymentEdit.order.id} cambió método a ${paymentEdit.paymentMethod}` },
      ...currentMovements,
    ]);
    setPaymentEdit(null);
  };

  const confirmDecision = () => {
    if (!decision) {
      return;
    }

    const paymentMethod = getPaymentMethod(decision.order);

    if (decision.type === 'confirm') {
      updateCustomerOrder(decision.order.id, (order) => ({
        ...order,
        action: 'Ver detalle',
        actionType: 'detail',
        cashierStatus: 'paid',
        paidAt: 'Hoy',
        paymentMethod,
        status: 'En cocina',
        statusType: 'kitchen',
        stepsDone: Math.max(order.stepsDone || 1, 2),
      }));
      recordEvent?.({
        detail: `${decision.order.id} confirmado con ${paymentMethod} y enviado a cocina.`,
        icon: '💵',
        module: 'Caja',
        severity: 'success',
        title: 'Pago confirmado',
        type: 'notification',
      });
      setMovements((currentMovements) => [
        { icon: '✅', text: `${decision.order.id} confirmado con ${paymentMethod}` },
        ...currentMovements,
      ]);
    } else {
      updateCustomerOrder(decision.order.id, (order) => ({
        ...order,
        action: 'Detalle',
        actionType: 'detail',
        cashierStatus: 'cancelled',
        paymentMethod: null,
        status: 'Cancelado',
        statusType: 'cancelled',
        stepsDone: 1,
      }));
      recordEvent?.({
        detail: `${decision.order.id} fue cancelado por caja. Se actualizan ventas y ganancias.`,
        icon: '❌',
        module: 'Caja',
        severity: 'warning',
        title: 'Pedido cancelado',
        type: 'notification',
      });
      setMovements((currentMovements) => [
        { icon: '❌', text: `${decision.order.id} cancelado por caja` },
        ...currentMovements,
      ]);
    }

    setDecision(null);
  };

  return (
    <ScreenBackground isDarkMode={isDarkMode} theme={theme} contentStyle={styles.screen}>
      <View style={styles.content}>
        <MockStatusBar
          isDarkMode={isDarkMode}
          navigate={navigate}
          onBack={goBack}
          setIsDarkMode={setIsDarkMode}
          showBack
          theme={theme}
        />

        <AppHeader
          eyebrow="Caja"
          title="Pedidos"
          subtitle="Ver detalles y confirmar pagos"
          icon="🧾"
          isDarkMode={isDarkMode}
          theme={theme}
        />

        <CashierTabs active="cashierOrders" isDarkMode={isDarkMode} navigate={navigate} theme={theme} />

        <SummaryCard
          title="Pedidos recibidos"
          amount={`${pendingOrders.length} pendientes`}
          subtitle={pendingOrders.length ? 'Listos para confirmar o cancelar' : 'No hay pedidos pendientes de pago'}
          icon="💵"
          isDarkMode={isDarkMode}
          theme={theme}
        />

        <View style={styles.statsRow}>
          {orderStats.map((stat) => (
            <StatCard key={stat.label} {...stat} compact theme={theme} />
          ))}
        </View>

        <SectionTitle title="Pedidos recibidos" subtitle="Confirma, revisa detalles o cancela el pedido" compact theme={theme} />

        <View style={styles.ordersList}>
          {cashierOrders.length ? (
            cashierOrders.map((order) => (
              <OrderCard
                key={order.id}
                isDarkMode={isDarkMode}
                onCancel={() => setDecision({ order, type: 'cancel' })}
                onConfirm={() => setDecision({ order, type: 'confirm' })}
                onDetail={() => openCashierOrderDetail(order.id)}
                onEditPayment={() => openPaymentEdit(order)}
                onPaymentChange={(paymentMethod) => updatePaymentMethod(order.id, paymentMethod)}
                order={order}
                paymentMethod={getPaymentMethod(order)}
                theme={theme}
              />
            ))
          ) : (
            <EmptyState
              icon="🧾"
              subtitle="Cuando Cliente/Mesero levante un pedido, aparecerá aquí para confirmarlo o cancelarlo."
              theme={theme}
              title="Sin pedidos para caja"
            />
          )}
        </View>

        {previewOrder && <QuickDetailCard isDarkMode={isDarkMode} order={previewOrder} theme={theme} />}

        <View
          style={[
            styles.movementCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              boxShadow: theme.cardShadow,
            },
          ]}
        >
          <View style={styles.movementHeader}>
            <Text selectable style={[styles.movementTitle, { color: theme.title }]}>
              Últimos movimientos
            </Text>
            <View
              style={[
                styles.todayBadge,
                {
                  backgroundColor: theme.actionSoft,
                  borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.18)' : 'rgba(120, 53, 15, 0)',
                },
              ]}
            >
              <Text style={[styles.todayText, { color: theme.amber }]}>Hoy</Text>
            </View>
          </View>

          {movements.slice(0, 4).map((movement, index) => (
            <View key={`${movement.text}-${index}`} style={styles.movementItem}>
              <Text style={styles.movementIcon}>{movement.icon}</Text>
              <Text selectable style={[styles.movementCopy, { color: theme.muted }]}>
                {movement.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <BottomNav active="cashierOrders" isDarkMode={isDarkMode} navigate={navigate} theme={theme} />
      <DecisionModal
        decision={decision}
        isDarkMode={isDarkMode}
        onCancel={() => setDecision(null)}
        onConfirm={confirmDecision}
        paymentMethod={decision ? getPaymentMethod(decision.order) : ''}
        theme={theme}
      />
      <PaymentEditModal
        edit={paymentEdit}
        isDarkMode={isDarkMode}
        onCancel={() => setPaymentEdit(null)}
        onChange={changePaymentEdit}
        onSave={savePaymentEdit}
        theme={theme}
      />
    </ScreenBackground>
  );
}

function OrderCard({ isDarkMode, onCancel, onConfirm, onDetail, onEditPayment, onPaymentChange, order, paymentMethod, theme }) {
  const isPending = order.statusType === 'pending';
  const isCancelled = order.statusType === 'cancelled';
  const canEditPayment = !isPending && !isCancelled && order.cashierStatus === 'paid';
  const canCancelProcessed = canEditPayment;

  return (
    <View
      style={[
        styles.orderCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
          boxShadow: theme.cardShadow,
        },
      ]}
    >
      <View style={styles.orderTop}>
        <View style={styles.orderCopy}>
          <Text selectable style={[styles.orderTitle, { color: theme.title }]}>
            {order.id}
          </Text>
          <Text selectable style={[styles.orderSubtitle, { color: theme.muted }]}>
            {order.detail}
          </Text>
        </View>
        <StatusBadge isDarkMode={isDarkMode} status={order.status} type={order.statusType} theme={theme} />
      </View>

      <View style={[styles.orderTotal, { backgroundColor: theme.actionSoft }]}>
        <Text selectable style={[styles.totalLabel, { color: theme.muted }]}>
          Total del pedido
        </Text>
        <Text selectable style={[styles.totalAmount, { color: isDarkMode ? theme.amber : theme.title }]}>
          {order.amount}
        </Text>
      </View>

      {isPending && (
        <View style={styles.paymentOptions}>
          {paymentOptions.map((option) => {
            const active = option === paymentMethod;

            return (
              <Pressable
                key={option}
                onPress={() => onPaymentChange(option)}
                style={({ pressed }) => [
                  styles.paymentOption,
                  {
                    backgroundColor: active
                      ? isDarkMode
                        ? theme.accent
                        : theme.accentAlt
                      : isDarkMode
                        ? 'rgba(255, 255, 255, 0.10)'
                        : '#ffffff',
                    opacity: pressed ? 0.84 : 1,
                  },
                ]}
              >
                <Text style={[styles.paymentText, { color: active ? '#ffffff' : theme.amber }]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {canEditPayment && (
        <View style={[styles.paymentSummary, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#ffffff' }]}>
          <Text selectable style={[styles.paymentSummaryLabel, { color: theme.muted }]}>
            Método de pago
          </Text>
          <Text selectable style={[styles.paymentSummaryValue, { color: theme.amber }]}>
            {order.paymentMethod || 'Efectivo'}
          </Text>
        </View>
      )}

      <View style={styles.orderActions}>
        {isPending && (
          <Pressable onPress={onConfirm} style={[styles.actionButton, styles.confirmButton]}>
            <Text style={styles.actionText}>Confirmar</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onDetail}
          style={[styles.actionButton, { backgroundColor: isDarkMode ? theme.accent : theme.accentAlt }]}
        >
          <Text style={styles.actionText}>Ver detalles</Text>
        </Pressable>
        {canEditPayment && (
          <Pressable
            onPress={onEditPayment}
            style={[styles.actionButton, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.18)' : '#f3eee9' }]}
          >
            <Text style={[styles.actionText, { color: isDarkMode ? theme.amber : theme.accent }]}>Editar pago</Text>
          </Pressable>
        )}
        {canCancelProcessed && (
          <Pressable onPress={onCancel} style={[styles.actionButton, styles.cancelButton]}>
            <Text style={styles.actionText}>Cancelar</Text>
          </Pressable>
        )}
        {isPending && (
          <Pressable onPress={onCancel} style={[styles.actionButton, styles.cancelButton]}>
            <Text style={styles.actionText}>Cancelar</Text>
          </Pressable>
        )}
        {isCancelled && (
          <View style={[styles.actionButton, { backgroundColor: '#737373' }]}>
            <Text style={styles.actionText}>Sin acción</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function QuickDetailCard({ isDarkMode, order, theme }) {
  return (
    <View
      style={[
        styles.detailCard,
        {
          backgroundColor: theme.surfaceAlt,
          borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.14)' : 'rgba(120, 53, 15, 0)',
        },
      ]}
    >
      <View style={styles.detailHeader}>
        <Text selectable style={[styles.detailTitle, { color: theme.title }]}>
          Detalles del pedido
        </Text>
        <View style={[styles.detailBadge, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.10)' : '#ffffff' }]}>
          <Text style={[styles.detailBadgeText, { color: theme.amber }]}>{order.id.replace('Pedido ', '')}</Text>
        </View>
      </View>

      <View style={styles.detailInfo}>
        <DetailLine label="Mesa:" value={order.table || order.detail.split(' · ')[0]} theme={theme} />
        <DetailLine label="Productos:" value={order.products} theme={theme} />
        <DetailLine label="Método:" value={order.paymentMethod || 'Pendiente'} theme={theme} />
        <DetailLine label="Total:" value={order.amount} theme={theme} />
      </View>
    </View>
  );
}

function StatusBadge({ isDarkMode, status, type, theme }) {
  const colors = {
    cancelled: { backgroundColor: '#fee2e2', borderColor: 'transparent', color: '#b91c1c' },
    kitchen: { backgroundColor: isDarkMode ? 'rgba(251, 146, 60, 0.15)' : '#ffedd5', borderColor: 'transparent', color: isDarkMode ? '#fb923c' : '#c2410c' },
    pending: { backgroundColor: theme.warningBg, borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.25)' : 'transparent', color: theme.warningText },
    ready: { backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7', borderColor: 'transparent', color: isDarkMode ? '#86efac' : '#166534' },
  };
  const badgeColors = colors[type] || colors.pending;

  return (
    <View
      style={[
        styles.pendingBadge,
        {
          backgroundColor: badgeColors.backgroundColor,
          borderColor: badgeColors.borderColor,
        },
      ]}
    >
      <Text style={[styles.pendingText, { color: badgeColors.color }]}>{status}</Text>
    </View>
  );
}

function DetailLine({ label, value, theme }) {
  return (
    <Text selectable style={[styles.detailLine, { color: theme.subtitle }]}>
      <Text style={styles.detailStrong}>{label}</Text> {value}
    </Text>
  );
}

function DecisionModal({ decision, isDarkMode, onCancel, onConfirm, paymentMethod, theme }) {
  const isConfirming = decision?.type === 'confirm';
  const isPaidCancellation = decision?.type === 'cancel' && decision?.order?.cashierStatus === 'paid';

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={Boolean(decision)}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: isDarkMode ? '#231811' : '#ffffff',
              borderColor: theme.surfaceBorder,
              boxShadow: isDarkMode ? '0 18px 42px rgba(0,0,0,0.55)' : '0 18px 42px rgba(0,0,0,0.20)',
            },
          ]}
        >
          <Text selectable style={[styles.modalTitle, { color: theme.title }]}>
            {isConfirming ? 'Confirmar pago' : 'Cancelar pedido'}
          </Text>
          <Text selectable style={[styles.modalCopy, { color: theme.muted }]}>
            {isConfirming
              ? `¿Confirmar ${decision?.order.id} con pago en ${paymentMethod} y enviarlo a cocina?`
              : isPaidCancellation
                ? `¿Seguro que deseas cancelar ${decision?.order.id}? Se quitará de ventas, ganancia y métodos de pago.`
                : `¿Seguro que deseas cancelar ${decision?.order.id}?`}
          </Text>
          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalSecondary,
                {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#efe7e1',
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <Text style={[styles.modalSecondaryText, { color: theme.title }]}>Volver</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalPrimary,
                {
                  backgroundColor: isConfirming ? '#16a34a' : '#dc2626',
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <Text style={styles.modalPrimaryText}>Confirmar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PaymentEditModal({ edit, isDarkMode, onCancel, onChange, onSave, theme }) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={Boolean(edit)}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: isDarkMode ? '#231811' : '#ffffff',
              borderColor: theme.surfaceBorder,
              boxShadow: isDarkMode ? '0 18px 42px rgba(0,0,0,0.55)' : '0 18px 42px rgba(0,0,0,0.20)',
            },
          ]}
        >
          <Text selectable style={[styles.modalTitle, { color: theme.title }]}>
            Editar método de pago
          </Text>
          <Text selectable style={[styles.modalCopy, { color: theme.muted }]}>
            Cambia el método de {edit?.order.id}. La venta conserva el mismo total.
          </Text>

          <View style={styles.editPaymentOptions}>
            {paymentOptions.map((option) => {
              const active = option === edit?.paymentMethod;

              return (
                <Pressable
                  key={option}
                  onPress={() => onChange(option)}
                  style={({ pressed }) => [
                    styles.editPaymentOption,
                    {
                      backgroundColor: active
                        ? isDarkMode
                          ? theme.accent
                          : theme.accentAlt
                        : isDarkMode
                          ? 'rgba(255,255,255,0.08)'
                          : '#f3eee9',
                      opacity: pressed ? 0.84 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.editPaymentText, { color: active ? '#ffffff' : theme.amber }]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalSecondary,
                {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#efe7e1',
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <Text style={[styles.modalSecondaryText, { color: theme.title }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={onSave}
              style={({ pressed }) => [
                styles.modalPrimary,
                {
                  backgroundColor: theme.accent,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <Text style={styles.modalPrimaryText}>Guardar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    minHeight: 1060,
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
    marginTop: 14,
  },
  ordersList: {
    gap: 12,
    marginTop: 12,
  },
  orderCard: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  orderTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderCopy: {
    flex: 1,
    paddingRight: 8,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  orderSubtitle: {
    fontSize: 11,
    paddingTop: 4,
  },
  pendingBadge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  pendingText: {
    fontSize: 9,
    fontWeight: '900',
  },
  orderTotal: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 10,
  },
  totalLabel: {
    fontSize: 11,
  },
  totalAmount: {
    fontSize: 15,
    fontWeight: '900',
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  paymentOption: {
    alignItems: 'center',
    borderRadius: 20,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  paymentText: {
    fontSize: 9,
    fontWeight: '800',
  },
  paymentSummary: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    padding: 10,
  },
  paymentSummaryLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  paymentSummaryValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 12,
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: '#16a34a',
  },
  cancelButton: {
    backgroundColor: '#dc2626',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  detailCard: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  detailHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  detailBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detailBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  detailInfo: {
    marginTop: 12,
  },
  detailLine: {
    fontSize: 11,
    marginTop: 6,
  },
  detailStrong: {
    fontWeight: '900',
  },
  movementCard: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  movementHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  movementTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  todayBadge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  todayText: {
    fontSize: 10,
    fontWeight: '800',
  },
  movementItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
  },
  movementIcon: {
    fontSize: 14,
  },
  movementCopy: {
    flex: 1,
    fontSize: 11,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    borderCurve: 'continuous',
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 360,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  modalCopy: {
    fontSize: 13,
    lineHeight: 18,
    paddingTop: 8,
  },
  editPaymentOptions: {
    gap: 8,
    marginTop: 16,
  },
  editPaymentOption: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    minHeight: 42,
    justifyContent: 'center',
  },
  editPaymentText: {
    fontSize: 12,
    fontWeight: '900',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalSecondary: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    flex: 1,
    height: 42,
    justifyContent: 'center',
  },
  modalPrimary: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    flex: 1,
    height: 42,
    justifyContent: 'center',
  },
  modalSecondaryText: {
    fontSize: 12,
    fontWeight: '900',
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
});
