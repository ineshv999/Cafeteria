import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import AppHeader from '../components/AppHeader';
import AppIcon from '../components/AppIcon';
import EmptyState from '../components/EmptyState';
import KitchenTabs from '../components/KitchenTabs';
import MockStatusBar from '../components/MockStatusBar';
import ScreenBackground from '../components/ScreenBackground';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import SummaryCard from '../components/SummaryCard';
import { kitchenOrders } from '../data/appData';

const fallbackOrders = kitchenOrders.map((order, index) => ({
  ...order,
  amount: index === 0 ? '$180.00' : '$205.00',
  kitchenStage: order.statusType === 'progress' ? 'preparing' : 'queue',
  notes: 'Sin observaciones.',
  products: order.detail.replace(' · ', ': '),
  table: order.detail.split(' · ')[0],
}));

export default function KitchenOrdersScreen({
  customerOrders = [],
  goBack,
  isDarkMode,
  setIsDarkMode,
  theme,
  navigate,
  recordEvent,
  updateCustomerOrder,
}) {
  const [localOrders, setLocalOrders] = useState(fallbackOrders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [decision, setDecision] = useState(null);
  const [delayTarget, setDelayTarget] = useState(null);
  const [delayNote, setDelayNote] = useState('');
  const [movements, setMovements] = useState([
    { icon: '✅', text: 'Pedido #14 marcado como listo' },
    { icon: '🔥', text: 'Pedido #16 continúa en preparación' },
  ]);

  const liveOrders = customerOrders
    .filter((order) => order.cashierStatus === 'paid' && ['kitchen', 'ready'].includes(order.statusType))
    .map(normalizeOrder);
  const orders = liveOrders.length ? liveOrders : localOrders;
  const queueCount = orders.filter((order) => order.kitchenStage === 'queue').length;
  const preparingCount = orders.filter((order) => order.kitchenStage === 'preparing').length;
  const readyCount = orders.filter((order) => order.kitchenStage === 'ready' || order.statusType === 'ready').length;
  const activeCount = queueCount + preparingCount;
  const stats = [
    { icon: '⏳', value: String(queueCount), label: 'Pendientes' },
    { icon: '🔍', value: String(preparingCount), label: 'Preparación' },
    { icon: '✅', value: String(readyCount), label: 'Listos' },
  ];

  const updateKitchenOrder = (orderId, updater) => {
    if (updateCustomerOrder && customerOrders.some((order) => order.id === orderId)) {
      updateCustomerOrder(orderId, updater);
      return;
    }

    setLocalOrders((currentOrders) => currentOrders.map((order) => (order.id === orderId ? updater(order) : order)));
  };

  const confirmDecision = () => {
    if (!decision) {
      return;
    }

    if (decision.type === 'prepare') {
      updateKitchenOrder(decision.order.id, (order) => ({
        ...order,
        kitchenStage: 'preparing',
        status: 'En preparación',
        statusType: 'kitchen',
        stepsDone: Math.max(order.stepsDone || 2, 2),
      }));
      setMovements((currentMovements) => [
        { icon: '🔥', text: `${decision.order.id} pasó a preparación.` },
        ...currentMovements,
      ]);
      recordEvent?.({
        detail: `${decision.order.id} pasó a preparación en cocina.`,
        icon: '🔥',
        module: 'Cocina',
        severity: 'info',
        title: 'Pedido en preparación',
        type: 'activity',
      });
    }

    if (decision.type === 'ready') {
      updateKitchenOrder(decision.order.id, (order) => ({
        ...order,
        action: 'Entregar',
        actionType: 'deliver',
        kitchenStage: 'ready',
        status: 'Listo',
        statusType: 'ready',
        stepsDone: 3,
      }));
      setMovements((currentMovements) => [
        { icon: '✅', text: `${decision.order.id} marcado como listo.` },
        ...currentMovements,
      ]);
      recordEvent?.({
        detail: `${decision.order.id} quedó listo para entregar al cliente.`,
        icon: '✅',
        module: 'Cocina',
        severity: 'success',
        title: 'Pedido listo',
        type: 'notification',
      });
    }

    setDecision(null);
  };

  const saveDelayNote = () => {
    const cleanNote = delayNote.trim();

    if (!delayTarget || !cleanNote) {
      return;
    }

    updateKitchenOrder(delayTarget.id, (order) => ({
      ...order,
      hasKitchenNotice: true,
      kitchenNote: cleanNote,
      notes: `${order.notes || 'Sin observaciones.'}\nCocina: ${cleanNote}`.trim(),
      waiterNotice: {
        createdAt: 'Ahora',
        message: cleanNote,
        type: 'delay',
      },
    }));
    setMovements((currentMovements) => [
      { icon: '⚠️', text: `${delayTarget.id}: ${cleanNote}` },
      ...currentMovements,
    ]);
    recordEvent?.({
      detail: `${delayTarget.id}: ${cleanNote}`,
      icon: '⏳',
      module: 'Cocina',
      severity: 'warning',
      title: 'Demora reportada',
      type: 'notification',
    });
    setDelayTarget(null);
    setDelayNote('');
  };

  return (
    <ScreenBackground isDarkMode={isDarkMode} theme={theme} contentStyle={styles.screen}>
      <View style={styles.content}>
        <MockStatusBar isDarkMode={isDarkMode} navigate={navigate} onBack={goBack} setIsDarkMode={setIsDarkMode} showBack theme={theme} />

        <AppHeader
          eyebrow="Módulo"
          title="Pedidos"
          subtitle="Control de pedidos"
          icon="👨‍🍳"
          isDarkMode={isDarkMode}
          theme={theme}
          titleSize={27}
        />

        <KitchenTabs active="kitchenOrders" isDarkMode={isDarkMode} navigate={navigate} theme={theme} />

        <SummaryCard
          title="Pedidos en cocina"
          amount={`${activeCount} activos`}
          subtitle={`${queueCount} pendientes · ${preparingCount} en preparación`}
          icon="🔥"
          isDarkMode={isDarkMode}
          theme={theme}
        />

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} compact theme={theme} />
          ))}
        </View>

        <SectionTitle title="Pedidos recientes" subtitle="Actualiza el estado de cada pedido" compact theme={theme} />

        <View style={styles.ordersList}>
          {orders.length ? (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                isDarkMode={isDarkMode}
                onDelay={() => {
                  setDelayTarget(order);
                  setDelayNote(order.kitchenNote || '');
                }}
                onDetail={() => setSelectedOrder(order)}
                onPrepare={() => setDecision({ order, type: 'prepare' })}
                onReady={() => setDecision({ order, type: 'ready' })}
                order={order}
                theme={theme}
              />
            ))
          ) : (
            <EmptyState
              icon="👨‍🍳"
              subtitle="Cuando caja confirme un pago, el pedido aparecerá aquí para preparar."
              theme={theme}
              title="Cocina sin pedidos activos"
            />
          )}
        </View>

        <View
          style={[
            styles.queueCard,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.14)' : 'transparent',
            },
          ]}
        >
          <View style={styles.queueHeader}>
            <Text selectable style={[styles.queueTitle, { color: theme.title }]}>
              Flujo de cocina
            </Text>
            <View style={[styles.queueBadge, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.10)' : '#ffffff' }]}>
              <Text selectable style={[styles.queueBadgeText, { color: theme.amber }]}>
                Hoy
              </Text>
            </View>
          </View>

          {movements.slice(0, 5).map((movement, index) => (
            <View key={`${movement.text}-${index}`} style={styles.queueItem}>
              <AppIcon color={theme.amber} name={movement.icon} size={18} />
              <Text selectable style={[styles.queueCopy, { color: theme.muted }]}>
                {movement.text}
              </Text>
            </View>
          ))}
        </View>
      </View>


      <OrderDetailModal
        isDarkMode={isDarkMode}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        theme={theme}
      />
      <KitchenDecisionModal
        decision={decision}
        isDarkMode={isDarkMode}
        onCancel={() => setDecision(null)}
        onConfirm={confirmDecision}
        theme={theme}
      />
      <DelayNoteSheet
        isDarkMode={isDarkMode}
        note={delayNote}
        onCancel={() => {
          setDelayTarget(null);
          setDelayNote('');
        }}
        onChange={setDelayNote}
        onSave={saveDelayNote}
        order={delayTarget}
        theme={theme}
      />
    </ScreenBackground>
  );
}

function normalizeOrder(order) {
  const stage =
    order.kitchenStage ||
    (order.statusType === 'ready' ? 'ready' : String(order.status || '').toLowerCase().includes('prepar') ? 'preparing' : 'queue');

  return {
    ...order,
    kitchenStage: stage,
    products: order.products || order.productItems?.map((item) => `${item.quantity} ${item.name}`).join(', '),
    table: order.table || order.detail?.split(' · ')[0],
  };
}

function OrderCard({ isDarkMode, onDelay, onDetail, onPrepare, onReady, order, theme }) {
  const stage = order.kitchenStage;
  const isQueue = stage === 'queue';
  const isPreparing = stage === 'preparing';
  const isReady = stage === 'ready' || order.statusType === 'ready';
  const badge = getStatusBadge(order, isDarkMode, theme);

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
          <Text selectable style={[styles.orderDetail, { color: theme.muted }]}>
            {order.detail}
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: badge.bg,
              borderColor: badge.border,
            },
          ]}
        >
          <Text selectable style={[styles.badgeText, { color: badge.text }]}>
            {order.status}
          </Text>
        </View>
      </View>

      <View style={styles.stageRow}>
        <StagePill active={isQueue} label="Pendiente" theme={theme} />
        <StagePill active={isPreparing} label="Preparación" theme={theme} />
        <StagePill active={isReady} label="Listo" theme={theme} />
      </View>

      {order.kitchenNote ? (
        <View style={[styles.noteBox, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.10)' : '#fff7ed' }]}>
          <Text selectable style={[styles.noteText, { color: theme.title }]}>
            {order.kitchenNote}
          </Text>
        </View>
      ) : null}

      <View style={styles.orderActions}>
        <Pressable
          onPress={onDetail}
          style={({ pressed }) => [
            styles.detailButton,
            {
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#efe7e1',
              opacity: pressed ? 0.86 : 1,
            },
          ]}
        >
          <Text selectable style={[styles.detailButtonText, { color: theme.amber }]}>
            Ver detalle
          </Text>
        </Pressable>
        {!isReady ? (
          <Pressable
            onPress={isQueue ? onPrepare : onReady}
            style={({ pressed }) => [
              styles.mainButton,
              {
                backgroundColor: isDarkMode ? theme.accent : theme.accentAlt,
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <Text style={styles.mainButtonText}>{isQueue ? 'Preparar' : 'Marcar listo'}</Text>
          </Pressable>
        ) : (
          <View style={[styles.mainButton, { backgroundColor: '#16a34a' }]}>
            <Text style={styles.mainButtonText}>Listo</Text>
          </View>
        )}
      </View>

      {!isReady ? (
        <Pressable
          onPress={onDelay}
          style={({ pressed }) => [
            styles.delayButton,
            {
              backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.12)' : theme.actionSoft,
              opacity: pressed ? 0.86 : 1,
            },
          ]}
        >
          <Text style={[styles.delayButtonText, { color: theme.amber }]}>Reportar demora</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function StagePill({ active, label, theme }) {
  return (
    <View style={[styles.stagePill, { backgroundColor: active ? theme.accent : theme.actionSoft }]}>
      <Text style={[styles.stagePillText, { color: active ? '#ffffff' : theme.amber }]}>{label}</Text>
    </View>
  );
}

function OrderDetailModal({ isDarkMode, onClose, order, theme }) {
  if (!order) {
    return null;
  }

  const items = order.productItems?.length
    ? order.productItems
    : String(order.products || order.detail || 'Pedido sin productos')
        .split(',')
        .map((name) => ({ name: name.trim() }));

  return (
    <Modal animationType="fade" onRequestClose={onClose} transparent visible={Boolean(order)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, getModalSurface(isDarkMode, theme)]}>
          <Text selectable style={[styles.modalTitle, { color: theme.title }]}>
            {order.id}
          </Text>
          <Text selectable style={[styles.modalCopy, { color: theme.muted }]}>
            {order.table || order.detail}
          </Text>

          <View style={[styles.detailBox, { backgroundColor: theme.actionSoft }]}>
            {items.map((item, index) => (
              <View key={`${item.name}-${index}`} style={styles.productRow}>
                <Text selectable style={[styles.productName, { color: theme.title }]}>
                  {item.quantity ? `${item.quantity}x ${item.name}` : item.name}
                </Text>
                <Text selectable style={[styles.productPrice, { color: theme.amber }]}>
                  {item.total ? `$${item.total.toFixed(2)}` : ''}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.detailBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f7eee5' }]}>
            <Text selectable style={[styles.detailLabel, { color: theme.muted }]}>
              Observaciones
            </Text>
            <Text selectable style={[styles.detailValue, { color: theme.title }]}>
              {order.notes || 'Sin observaciones.'}
            </Text>
            {order.kitchenNote ? (
              <>
                <Text selectable style={[styles.detailLabel, { color: theme.muted }]}>
                  Nota de cocina
                </Text>
                <Text selectable style={[styles.detailValue, { color: theme.title }]}>
                  {order.kitchenNote}
                </Text>
              </>
            ) : null}
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.modalPrimaryFull,
              {
                backgroundColor: isDarkMode ? theme.accent : theme.accentAlt,
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <Text style={styles.modalPrimaryText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function KitchenDecisionModal({ decision, isDarkMode, onCancel, onConfirm, theme }) {
  const isPrepare = decision?.type === 'prepare';

  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={Boolean(decision)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, getModalSurface(isDarkMode, theme)]}>
          <Text selectable style={[styles.modalTitle, { color: theme.title }]}>
            {isPrepare ? 'Enviar a preparación' : 'Marcar como listo'}
          </Text>
          <Text selectable style={[styles.modalCopy, { color: theme.muted }]}>
            {isPrepare
              ? `¿Tomar ${decision?.order.id} y pasarlo a preparación?`
              : `¿Confirmar que ${decision?.order.id} está listo para entregar?`}
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
              <Text style={[styles.modalSecondaryText, { color: theme.title }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalPrimary,
                {
                  backgroundColor: isPrepare ? theme.accent : '#16a34a',
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

function DelayNoteSheet({ isDarkMode, note, onCancel, onChange, onSave, order, theme }) {
  return (
    <Modal animationType="slide" onRequestClose={onCancel} transparent visible={Boolean(order)}>
      <View style={styles.sheetOverlay}>
        <View style={[styles.sheetCard, getModalSurface(isDarkMode, theme)]}>
          <View style={[styles.sheetGrabber, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.18)' : '#d6d3d1' }]} />
          <Text selectable style={[styles.modalTitle, { color: theme.title }]}>
            Reportar demora
          </Text>
          <Text selectable style={[styles.modalCopy, { color: theme.muted }]}>
            Agrega una nota visible en el detalle del pedido.
          </Text>
          <View
            style={[
              styles.noteInputWrap,
              {
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : '#f7eee5',
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            <TextInput
              multiline
              onChangeText={onChange}
              placeholder="Ej. Falta leche, demora 5 minutos..."
              placeholderTextColor={theme.muted}
              style={[styles.noteInput, { color: theme.title }]}
              value={note}
            />
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
              <Text style={styles.modalPrimaryText}>Guardar nota</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function getStatusBadge(order, isDarkMode, theme) {
  if (order.kitchenStage === 'ready' || order.statusType === 'ready') {
    return {
      bg: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
      border: isDarkMode ? 'rgba(34, 197, 94, 0.25)' : 'transparent',
      text: isDarkMode ? '#86efac' : '#166534',
    };
  }

  if (order.kitchenStage === 'preparing') {
    return {
      bg: theme.progressBg,
      border: isDarkMode ? theme.progressText : 'transparent',
      text: theme.progressText,
    };
  }

  return {
    bg: theme.warningBg,
    border: isDarkMode ? theme.warningText : 'transparent',
    text: theme.warningText,
  };
}

function getModalSurface(isDarkMode, theme) {
  return {
    backgroundColor: isDarkMode ? '#231811' : '#ffffff',
    borderColor: theme.surfaceBorder,
    boxShadow: isDarkMode ? '0 18px 42px rgba(0,0,0,0.55)' : '0 18px 42px rgba(0,0,0,0.20)',
  };
}

const styles = StyleSheet.create({
  screen: {
    minHeight: 1040,
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
    gap: 10,
    paddingTop: 12,
  },
  orderCard: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
  },
  orderTop: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  orderCopy: {
    flex: 1,
    paddingRight: 4,
  },
  orderTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  orderDetail: {
    fontSize: 11,
    lineHeight: 14,
    paddingTop: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  stageRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  stagePill: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 12,
    flex: 1,
    minHeight: 28,
    justifyContent: 'center',
  },
  stagePillText: {
    fontSize: 9,
    fontWeight: '900',
  },
  noteBox: {
    borderCurve: 'continuous',
    borderRadius: 14,
    marginTop: 10,
    padding: 10,
  },
  noteText: {
    fontSize: 11,
    fontWeight: '800',
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  detailButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    flex: 1,
    height: 38,
    justifyContent: 'center',
  },
  detailButtonText: {
    fontSize: 11,
    fontWeight: '900',
  },
  mainButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    flex: 1.12,
    height: 38,
    justifyContent: 'center',
  },
  mainButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  delayButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 12,
    height: 34,
    justifyContent: 'center',
    marginTop: 9,
  },
  delayButtonText: {
    fontSize: 10,
    fontWeight: '900',
  },
  queueCard: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  queueHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  queueBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  queueBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  queueItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
  },
  queueIcon: {
    fontSize: 14,
  },
  queueCopy: {
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
    maxWidth: 390,
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
  detailBox: {
    borderCurve: 'continuous',
    borderRadius: 16,
    marginTop: 14,
    padding: 14,
  },
  productRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  productName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    paddingRight: 8,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: '900',
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    paddingTop: 8,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    paddingTop: 3,
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
  modalPrimaryFull: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    marginTop: 16,
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
  sheetOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 22,
  },
  sheetGrabber: {
    alignSelf: 'center',
    borderRadius: 20,
    height: 5,
    marginBottom: 16,
    width: 46,
  },
  noteInputWrap: {
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 14,
    minHeight: 92,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  noteInput: {
    fontSize: 13,
    fontWeight: '700',
    minHeight: 74,
    outlineStyle: 'none',
    textAlignVertical: 'top',
  },
});
