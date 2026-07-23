import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import AppHeader from '../components/AppHeader';
import AppIcon from '../components/AppIcon';
import CustomerTabs from '../components/CustomerTabs';
import MockStatusBar from '../components/MockStatusBar';
import ScreenBackground from '../components/ScreenBackground';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import SummaryCard from '../components/SummaryCard';

const promotions = [
  {
    title: 'Combo desayuno',
    detail: 'Café americano + pan dulce',
    badge: 'Activa',
    badgeType: 'active',
    label: 'Precio promoción',
    value: '$55.00',
    featured: true,
    orderItem: {
      icon: '🍳',
      name: 'Combo desayuno',
      price: 55,
    },
  },
  {
    title: '2x1 Frappé',
    detail: 'Disponible de 3:00 PM a 5:00 PM',
    badge: 'Horario',
    badgeType: 'time',
    label: 'Ahorro estimado',
    value: '$45.00',
    orderItem: {
      icon: '🥤',
      name: '2x1 Frappé',
      price: 55,
    },
  },
  {
    title: 'Latte + galleta',
    detail: 'Ideal para venta por la tarde',
    badge: 'Nueva',
    badgeType: 'time',
    label: 'Precio sugerido',
    value: '$68.00',
    orderItem: {
      icon: '🥛',
      name: 'Latte + galleta',
      price: 68,
    },
  },
];

const recommended = [
  {
    icon: '☕',
    title: 'Café americano',
    detail: 'Más vendido',
    price: '$35',
    orderItem: {
      icon: '☕',
      name: 'Café americano',
      price: 35,
    },
  },
  {
    icon: '🥐',
    title: 'Pan dulce',
    detail: 'Ideal para combo',
    price: '$25',
    orderItem: {
      icon: '🥐',
      name: 'Pan dulce',
      price: 25,
    },
  },
  {
    icon: '🥤',
    title: 'Frappé',
    detail: 'Bebida fría recomendada',
    price: '$55',
    orderItem: {
      icon: '🥤',
      name: 'Frappé',
      price: 55,
    },
  },
  {
    icon: '🥛',
    title: 'Latte',
    detail: 'Buena venta de tarde',
    price: '$45',
    orderItem: {
      icon: '🥛',
      name: 'Latte',
      price: 45,
    },
  },
];

const initialFeedback = [
  { icon: '⭐', text: 'Clientes aceptan más el combo desayuno por la mañana.' },
  { icon: '💬', text: 'Recomendar frappé cuando el cliente pide bebida fría.' },
];

export default function CustomerMarketingScreen({
  addMarketingItemToDraft,
  goBack,
  isDarkMode,
  setIsDarkMode,
  theme,
  navigate,
}) {
  const [suggestedPromos, setSuggestedPromos] = useState({});
  const [suggestedProducts, setSuggestedProducts] = useState({});
  const [feedback, setFeedback] = useState(initialFeedback);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const promoSuggestions = Object.values(suggestedPromos).reduce((total, count) => total + count, 0);
  const productSuggestions = Object.values(suggestedProducts).reduce((total, count) => total + count, 0);
  const suggestionTotal = promoSuggestions + productSuggestions;
  const acceptedRate = Math.min(99, 92 + Math.floor(suggestionTotal / 2));
  const marketingStats = [
    { icon: '📢', value: String(promotions.length), label: 'Promos' },
    { icon: '☕', value: String(18 + suggestionTotal), label: 'Vendidos' },
    { icon: '⭐', value: `${acceptedRate}%`, label: 'Aceptación' },
  ];

  const openPromotionSuggestion = (promotion) => {
    setSelectedSuggestion({
      ...promotion,
      confirmText: 'Confirmar sugerencia',
      kind: 'promotion',
      message: `¿Deseas sugerir "${promotion.title}" al cliente y agregarlo al pedido en curso?`,
    });
  };

  const openProductSuggestion = (product) => {
    setSelectedSuggestion({
      ...product,
      confirmText: 'Sugerir producto',
      kind: 'product',
      label: product.detail,
      message: `¿Deseas sugerir "${product.title}" al cliente y agregarlo al pedido en curso?`,
      value: product.price,
    });
  };

  const confirmSuggestion = () => {
    if (!selectedSuggestion) {
      return;
    }

    if (selectedSuggestion.kind === 'promotion') {
      addMarketingItemToDraft(selectedSuggestion.orderItem);
      setSuggestedPromos((currentSuggestions) => ({
        ...currentSuggestions,
        [selectedSuggestion.title]: (currentSuggestions[selectedSuggestion.title] || 0) + 1,
      }));
      setFeedback((currentFeedback) => [
        { icon: '✅', text: `${selectedSuggestion.title} fue sugerida al cliente.` },
        ...currentFeedback,
      ]);
    } else {
      addMarketingItemToDraft(selectedSuggestion.orderItem);
      setSuggestedProducts((currentSuggestions) => ({
        ...currentSuggestions,
        [selectedSuggestion.title]: (currentSuggestions[selectedSuggestion.title] || 0) + 1,
      }));
      setFeedback((currentFeedback) => [
        { icon: '☕', text: `${selectedSuggestion.title} agregado como recomendación al cliente.` },
        ...currentFeedback,
      ]);
    }

    setSelectedSuggestion(null);
    navigate('customerOrder');
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
          eyebrow="Cliente / Mesero"
          title="Marketing"
          subtitle="Promociones y sugerencias al cliente"
          icon="📢"
          isDarkMode={isDarkMode}
          theme={theme}
          titleSize={27}
        />

        <CustomerTabs active="customerMarketing" isDarkMode={isDarkMode} navigate={navigate} theme={theme} />

        <SummaryCard
          title="Promoción activa"
          amount="Combo desayuno"
          subtitle="Café + pan dulce por $55.00"
          icon="⭐"
          isDarkMode={isDarkMode}
          theme={theme}
        />

        <View style={styles.statsRow}>
          {marketingStats.map((stat) => (
            <StatCard key={stat.label} {...stat} compact theme={theme} />
          ))}
        </View>

        <SectionTitle
          title="Promociones para sugerir"
          subtitle="Ofrece promociones al levantar pedidos"
          compact
          theme={theme}
        />

        <View style={styles.promoList}>
          {promotions.map((promotion) => (
            <PromoCard
              key={promotion.title}
              isDarkMode={isDarkMode}
              onSuggest={() => openPromotionSuggestion(promotion)}
              promotion={promotion}
              suggestedCount={suggestedPromos[promotion.title] || 0}
              theme={theme}
            />
          ))}
        </View>

        <SectionTitle title="Productos recomendados" compact theme={theme} />

        <View style={styles.recommendedGrid}>
          {recommended.map((item) => (
            <RecommendedCard
              key={item.title}
              isDarkMode={isDarkMode}
              item={item}
              onSuggest={() => openProductSuggestion(item)}
              suggestedCount={suggestedProducts[item.title] || 0}
              theme={theme}
            />
          ))}
        </View>

        <View
          style={[
            styles.feedbackCard,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: isDarkMode ? 'rgba(245, 158, 11, 0.14)' : 'transparent',
            },
          ]}
        >
          <View style={styles.feedbackHeader}>
            <Text selectable style={[styles.feedbackTitle, { color: theme.title }]}>
              Comentarios de clientes
            </Text>
            <View style={[styles.todayBadge, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.10)' : '#ffffff' }]}>
              <Text selectable style={[styles.todayText, { color: theme.amber }]}>
                Hoy
              </Text>
            </View>
          </View>

          {feedback.slice(0, 4).map((item, index) => (
            <View key={`${item.text}-${index}`} style={styles.feedbackItem}>
              <AppIcon color={theme.amber} name={item.icon} size={18} />
              <Text selectable style={[styles.feedbackText, { color: theme.muted }]}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>
      </View>


      <SuggestionModal
        isDarkMode={isDarkMode}
        onCancel={() => setSelectedSuggestion(null)}
        onConfirm={confirmSuggestion}
        suggestion={selectedSuggestion}
        theme={theme}
      />
    </ScreenBackground>
  );
}

function PromoCard({ isDarkMode, onSuggest, promotion, suggestedCount, theme }) {
  const badgeColors =
    promotion.badgeType === 'active'
      ? {
          backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7',
          borderColor: isDarkMode ? 'rgba(34, 197, 94, 0.25)' : 'transparent',
          color: isDarkMode ? '#86efac' : '#166534',
        }
      : {
          backgroundColor: isDarkMode ? 'rgba(251, 146, 60, 0.15)' : '#ffedd5',
          borderColor: isDarkMode ? 'rgba(251, 146, 60, 0.25)' : 'transparent',
          color: isDarkMode ? '#fb923c' : '#c2410c',
        };

  return (
    <View
      style={[
        styles.promoCard,
        promotion.featured && !isDarkMode && styles.lightFeaturedPromo,
        {
          backgroundColor: promotion.featured && !isDarkMode ? '#fef3c7' : theme.surface,
          borderColor: promotion.featured && !isDarkMode ? 'rgba(120, 53, 15, 0.08)' : theme.surfaceBorder,
          boxShadow: theme.cardShadow,
        },
      ]}
    >
      <View style={styles.promoTop}>
        <View style={styles.promoCopy}>
          <Text selectable style={[styles.promoTitle, { color: theme.title }]}>
            {promotion.title}
          </Text>
          <Text selectable style={[styles.promoDetail, { color: theme.muted }]}>
            {promotion.detail}
          </Text>
        </View>
        <View style={styles.badgeStack}>
          <View
            style={[
              styles.promoBadge,
              {
                backgroundColor: badgeColors.backgroundColor,
                borderColor: badgeColors.borderColor,
              },
            ]}
          >
            <Text selectable style={[styles.promoBadgeText, { color: badgeColors.color }]}>
              {promotion.badge}
            </Text>
          </View>
          {suggestedCount > 0 && (
            <View style={[styles.suggestedBadge, { backgroundColor: theme.actionSoft }]}>
              <Text selectable style={[styles.suggestedBadgeText, { color: theme.amber }]}>
                x{suggestedCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View
        style={[
          styles.promoPrice,
          {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(120, 53, 15, 0.08)',
          },
        ]}
      >
        <Text selectable style={[styles.promoPriceLabel, { color: theme.muted }]}>
          {promotion.label}
        </Text>
        <Text selectable style={[styles.promoPriceValue, { color: theme.amber }]}>
          {promotion.value}
        </Text>
      </View>

      <Pressable
        onPress={onSuggest}
        style={({ pressed }) => [
          styles.suggestButton,
          {
            backgroundColor: isDarkMode ? theme.accent : theme.accentAlt,
            opacity: pressed ? 0.82 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Text style={styles.suggestButtonText}>{suggestedCount > 0 ? 'Sugerir otra vez' : 'Sugerir al cliente'}</Text>
      </Pressable>
    </View>
  );
}

function RecommendedCard({ isDarkMode, item, onSuggest, suggestedCount, theme }) {
  return (
    <Pressable
      onPress={onSuggest}
      style={({ pressed }) => [
        styles.recommendedCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.surfaceBorder,
          boxShadow: theme.cardShadow,
          opacity: pressed ? 0.88 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.recommendedTop}>
        <View style={[styles.itemIcon, { backgroundColor: theme.softIcon }]}>
          <AppIcon color={theme.amber} name={item.icon} size={22} />
        </View>
        {suggestedCount > 0 && (
          <View style={[styles.smallCountBadge, { backgroundColor: isDarkMode ? 'rgba(245, 158, 11, 0.16)' : '#fef3c7' }]}>
            <Text selectable style={[styles.smallCountText, { color: theme.amber }]}>
              x{suggestedCount}
            </Text>
          </View>
        )}
      </View>
      <Text selectable style={[styles.recommendedTitle, { color: theme.title }]}>
        {item.title}
      </Text>
      <Text selectable style={[styles.recommendedDetail, { color: theme.muted }]}>
        {item.detail}
      </Text>
      <View style={styles.recommendedBottom}>
        <Text selectable style={[styles.recommendedPrice, { color: theme.amber }]}>
          {item.price}
        </Text>
        <Text selectable style={[styles.recommendedAction, { color: theme.amber }]}>
          Sugerir
        </Text>
      </View>
    </Pressable>
  );
}

function SuggestionModal({ isDarkMode, onCancel, onConfirm, suggestion, theme }) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={Boolean(suggestion)}>
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
            Confirmar sugerencia
          </Text>
          <Text selectable style={[styles.modalText, { color: theme.muted }]}>
            {suggestion?.message}
          </Text>
          <View
            style={[
              styles.modalSummary,
              {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.06)' : 'rgba(120, 53, 15, 0.08)',
              },
            ]}
          >
            <Text selectable style={[styles.modalSummaryTitle, { color: theme.title }]}>
              {suggestion?.title}
            </Text>
            <Text selectable style={[styles.modalSummaryText, { color: theme.muted }]}>
              {suggestion?.detail || suggestion?.label}
            </Text>
            <Text selectable style={[styles.modalSummaryValue, { color: theme.amber }]}>
              {suggestion?.value}
            </Text>
          </View>
          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                styles.modalButton,
                styles.cancelButton,
                {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f3eee9',
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <Text selectable style={[styles.cancelButtonText, { color: theme.title }]}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={({ pressed }) => [
                styles.modalButton,
                {
                  backgroundColor: theme.accent,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <Text selectable style={styles.confirmButtonText}>
                {suggestion?.confirmText || 'Confirmar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    minHeight: 1080,
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
  promoList: {
    gap: 10,
    paddingTop: 10,
  },
  promoCard: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    padding: 13,
  },
  lightFeaturedPromo: {
    borderWidth: 1,
  },
  promoTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  promoCopy: {
    flex: 1,
    paddingRight: 4,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  promoDetail: {
    fontSize: 10,
    lineHeight: 14,
    paddingTop: 4,
  },
  badgeStack: {
    alignItems: 'flex-end',
    gap: 5,
  },
  promoBadge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  promoBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  suggestedBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  suggestedBadgeText: {
    fontSize: 9,
    fontWeight: '900',
  },
  promoPrice: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 11,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  promoPriceLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  promoPriceValue: {
    fontSize: 13,
    fontWeight: '900',
  },
  suggestButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 13,
    height: 38,
    justifyContent: 'center',
    marginTop: 11,
  },
  suggestButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  recommendedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 10,
  },
  recommendedCard: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    minHeight: 142,
    padding: 13,
    width: '47.7%',
  },
  recommendedTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemIcon: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  itemIconText: {
    fontSize: 21,
  },
  smallCountBadge: {
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  smallCountText: {
    fontSize: 9,
    fontWeight: '900',
  },
  recommendedTitle: {
    fontSize: 13,
    fontWeight: '900',
    paddingTop: 10,
  },
  recommendedDetail: {
    fontSize: 11,
    minHeight: 30,
    paddingTop: 4,
  },
  recommendedBottom: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  recommendedPrice: {
    fontSize: 14,
    fontWeight: '900',
  },
  recommendedAction: {
    fontSize: 10,
    fontWeight: '900',
  },
  feedbackCard: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 12,
    padding: 14,
  },
  feedbackHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  todayBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  todayText: {
    fontSize: 10,
    fontWeight: '900',
  },
  feedbackItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 9,
  },
  feedbackIcon: {
    fontSize: 14,
  },
  feedbackText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    borderCurve: 'continuous',
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 360,
    padding: 18,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  modalText: {
    fontSize: 13,
    lineHeight: 18,
    paddingTop: 8,
  },
  modalSummary: {
    borderCurve: 'continuous',
    borderRadius: 18,
    marginTop: 14,
    padding: 14,
  },
  modalSummaryTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  modalSummaryText: {
    fontSize: 12,
    paddingTop: 4,
  },
  modalSummaryValue: {
    fontSize: 17,
    fontWeight: '900',
    paddingTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 10,
  },
  cancelButton: {
    borderWidth: 0,
  },
  cancelButtonText: {
    fontSize: 12,
    fontWeight: '900',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    textAlign: 'center',
  },
});
