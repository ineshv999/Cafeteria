import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';

import AppHeader from '../components/AppHeader';
import BottomNav from '../components/BottomNav';
import EmptyState from '../components/EmptyState';
import KitchenTabs from '../components/KitchenTabs';
import MockStatusBar from '../components/MockStatusBar';
import ScreenBackground from '../components/ScreenBackground';
import SectionTitle from '../components/SectionTitle';
import StatCard from '../components/StatCard';
import SummaryCard from '../components/SummaryCard';

const fallbackMenuItems = [
  { id: 'menu-coffee', category: 'Bebidas', icon: '☕', name: 'Café americano', price: 35, available: true, featured: true, type: 'Platillo', description: 'Bebida caliente' },
  { id: 'menu-bread', category: 'Panadería', icon: '🥐', name: 'Pan dulce', price: 25, available: true, featured: false, type: 'Platillo', description: 'Panadería' },
  { id: 'menu-breakfast-combo', category: 'Combos', icon: '🍳', name: 'Combo desayuno', price: 55, available: true, featured: true, type: 'Combo', description: 'Café + pan' },
  { id: 'menu-hot-chocolate', category: 'Temporada', icon: '🍫', name: 'Chocolate caliente', price: 48, available: true, featured: false, type: 'Especial', description: 'Temporada' },
];

const emptyDraft = {
  available: true,
  category: 'Bebidas',
  description: '',
  featured: false,
  icon: '☕',
  name: '',
  price: '',
  type: 'Platillo',
};

const quickActions = [
  { icon: '➕', label: 'Agregar platillo', type: 'Platillo' },
  { icon: '🎁', label: 'Agregar promoción', type: 'Combo' },
  { icon: '⭐', label: 'Agregar menú especial', type: 'Especial', wide: true },
];

const filterOptions = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'available' },
  { label: 'Pausados', value: 'hidden' },
];

export default function KitchenMenuScreen({
  addKitchenMenuItem,
  deleteKitchenMenuItem,
  goBack,
  isDarkMode,
  kitchenMenuItems = [],
  navigate,
  recordEvent,
  setIsDarkMode,
  theme,
  updateCustomerDraft,
  updateKitchenMenuItem,
}) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [movements, setMovements] = useState([
    { icon: '☕', text: 'Café americano marcado como destacado' },
    { icon: '🎁', text: 'Combo desayuno disponible para pedidos' },
  ]);

  const menuItems = kitchenMenuItems.length ? kitchenMenuItems : fallbackMenuItems;
  const availableCount = menuItems.filter((item) => item.available).length;
  const hiddenCount = menuItems.length - availableCount;
  const comboCount = menuItems.filter((item) => item.type === 'Combo').length;
  const featuredCount = menuItems.filter((item) => item.featured).length;
  const filteredItems = menuItems.filter((item) => {
    const matchesQuery = `${item.name} ${item.category} ${item.type}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'available' && item.available) ||
      (activeFilter === 'hidden' && !item.available);

    return matchesQuery && matchesFilter;
  });
  const groupedItems = useMemo(() => groupByCategory(filteredItems), [filteredItems]);
  const stats = [
    { icon: '✅', value: String(availableCount), label: 'Activos' },
    { icon: '🎁', value: String(comboCount), label: 'Combos' },
    { icon: '⏸️', value: String(hiddenCount), label: 'Pausados' },
  ];

  const addMovement = (movement) => {
    setMovements((currentMovements) => [movement, ...currentMovements].slice(0, 5));
  };

  const openNewItem = (type = 'Platillo') => {
    setEditingItem(null);
    setDraft({
      ...emptyDraft,
      category: type === 'Combo' ? 'Combos' : type === 'Especial' ? 'Temporada' : 'Bebidas',
      featured: type !== 'Platillo',
      icon: type === 'Combo' ? '🎁' : type === 'Especial' ? '⭐' : '☕',
      type,
    });
    setIsFormOpen(true);
  };

  const openEditItem = (item) => {
    setSelectedItem(null);
    setEditingItem(item);
    setDraft(buildDraftFromItem(item));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingItem(null);
    setDraft(emptyDraft);
    setIsFormOpen(false);
  };

  const saveItem = () => {
    if (!draft.name.trim() || Number(draft.price || 0) <= 0) {
      return;
    }

    const nextItem = {
      available: Boolean(draft.available),
      category: draft.category.trim() || 'General',
      description: draft.description.trim() || draft.category.trim() || 'Producto del menú',
      featured: Boolean(draft.featured),
      icon: draft.icon.trim() || '☕',
      name: draft.name.trim(),
      price: Number(draft.price || 0),
      type: draft.type.trim() || 'Platillo',
    };

    if (editingItem) {
      updateKitchenMenuItem?.(editingItem.id, (item) => ({ ...item, ...nextItem }));
      syncDraftProduct(editingItem, nextItem);
      addMovement({ icon: '✏️', text: `${nextItem.name} actualizado en menú` });
      recordEvent?.({
        detail: `${nextItem.name} fue editado en el menú.`,
        icon: '✏️',
        module: 'Cocina',
        severity: 'info',
        title: 'Producto actualizado',
        type: 'activity',
      });
    } else {
      addKitchenMenuItem?.({
        ...nextItem,
        id: `menu-${Date.now()}`,
      });
      addMovement({ icon: '➕', text: `${nextItem.name} agregado al menú` });
      recordEvent?.({
        detail: `${nextItem.name} se agregó al menú por $${Number(nextItem.price || 0).toFixed(2)}.`,
        icon: '🍽️',
        module: 'Cocina',
        severity: 'success',
        title: 'Producto agregado',
        type: 'activity',
      });
    }

    closeForm();
  };

  const syncDraftProduct = (previousItem, nextItem) => {
    updateCustomerDraft?.((currentDraft) => ({
      ...currentDraft,
      products: currentDraft.products.map((product) =>
        product.menuId === previousItem.id || product.name === previousItem.name
          ? {
              ...product,
              icon: nextItem.icon,
              menuId: previousItem.id,
              name: nextItem.name,
              price: nextItem.price,
            }
          : product,
      ),
    }));
  };

  const toggleAvailability = (item) => {
    updateKitchenMenuItem?.(item.id, (currentItem) => ({
      ...currentItem,
      available: !currentItem.available,
    }));
    addMovement({
      icon: item.available ? '⏸️' : '✅',
      text: `${item.name} ${item.available ? 'pausado' : 'reactivado'} para pedidos`,
    });
    recordEvent?.({
      detail: `${item.name} fue ${item.available ? 'pausado' : 'reactivado'} para pedidos.`,
      icon: item.available ? '⏸️' : '✅',
      module: 'Cocina',
      severity: item.available ? 'warning' : 'success',
      title: item.available ? 'Producto pausado' : 'Producto activo',
      type: 'activity',
    });
    setSelectedItem(null);
  };

  const duplicateItem = (item) => {
    const duplicate = {
      ...item,
      featured: false,
      id: `menu-${Date.now()}`,
      name: `${item.name} copia`,
    };

    addKitchenMenuItem?.(duplicate);
    addMovement({ icon: '📋', text: `${item.name} duplicado en menú` });
    recordEvent?.({
      detail: `${item.name} se duplicó como ${duplicate.name}.`,
      icon: '📋',
      module: 'Cocina',
      severity: 'info',
      title: 'Producto duplicado',
      type: 'activity',
    });
    setSelectedItem(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    deleteKitchenMenuItem?.(deleteTarget.id);
    updateCustomerDraft?.((currentDraft) => ({
      ...currentDraft,
      products: currentDraft.products.filter(
        (product) => product.menuId !== deleteTarget.id && product.name !== deleteTarget.name,
      ),
    }));
    addMovement({ icon: '🗑️', text: `${deleteTarget.name} eliminado del menú` });
    recordEvent?.({
      detail: `${deleteTarget.name} fue eliminado del menú y de pedidos en edición.`,
      icon: '🗑️',
      module: 'Cocina',
      severity: 'warning',
      title: 'Producto eliminado',
      type: 'activity',
    });
    setDeleteTarget(null);
    setSelectedItem(null);
  };

  return (
    <ScreenBackground isDarkMode={isDarkMode} theme={theme} contentStyle={styles.screen}>
      <View style={styles.content}>
        <MockStatusBar isDarkMode={isDarkMode} navigate={navigate} onBack={goBack} setIsDarkMode={setIsDarkMode} showBack theme={theme} />

        <AppHeader
          eyebrow="Cocina"
          title="Gestión menú"
          subtitle="Agregar, editar y eliminar productos"
          icon="🍽️"
          isDarkMode={isDarkMode}
          theme={theme}
        />

        <KitchenTabs active="kitchenMenu" isDarkMode={isDarkMode} navigate={navigate} theme={theme} />

        <SummaryCard
          title="Menú disponible"
          amount={`${availableCount} productos`}
          subtitle={`${featuredCount} destacados · ${comboCount} combos · ${hiddenCount} pausados`}
          icon="📋"
          isDarkMode={isDarkMode}
          theme={theme}
        />

        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} compact theme={theme} />
          ))}
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              onPress={() => openNewItem(action.type)}
              style={({ pressed }) => [
                styles.actionButton,
                action.wide && styles.wideAction,
                {
                  backgroundColor: isDarkMode ? '#16a34a' : '#15803d',
                  boxShadow: '0 8px 18px rgba(21, 128, 61, 0.25)',
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              <Text style={styles.actionText}>
                {action.icon} {action.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: theme.surface,
              borderColor: theme.surfaceBorder,
              boxShadow: theme.cardShadow,
            },
          ]}
        >
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            onChangeText={setQuery}
            placeholder="Buscar producto..."
            placeholderTextColor={theme.muted}
            style={[styles.searchInput, { color: theme.title }]}
            value={query}
          />
        </View>

        <View style={styles.filterRow}>
          {filterOptions.map((filter) => {
            const isActive = activeFilter === filter.value;

            return (
              <Pressable
                key={filter.value}
                onPress={() => setActiveFilter(filter.value)}
                style={[styles.filterButton, { backgroundColor: isActive ? theme.accent : theme.actionSoft }]}
              >
                <Text style={[styles.filterText, { color: isActive ? '#ffffff' : theme.amber }]}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <SectionTitle title="Menú actual" subtitle="Productos disponibles para pedidos" compact theme={theme} />

        {groupedItems.length ? (
          groupedItems.map((section) => (
            <View key={section.title}>
              <View style={styles.sectionTitle}>
                <Text selectable style={[styles.sectionHeading, { color: theme.title }]}>
                  {section.title}
                </Text>
                <Text selectable style={[styles.sectionSubtitle, { color: theme.muted }]}>
                  {section.items.length} productos
                </Text>
              </View>

              {section.items.map((item) => (
                <MenuItemCard
                  key={item.id}
                  isDarkMode={isDarkMode}
                  item={item}
                  onDelete={() => setDeleteTarget(item)}
                  onDetail={() => setSelectedItem(item)}
                  onEdit={() => openEditItem(item)}
                  onToggle={() => toggleAvailability(item)}
                  theme={theme}
                />
              ))}
            </View>
          ))
        ) : (
          <EmptyState
            actionLabel="Limpiar filtros"
            icon="🍽️"
            onAction={() => {
              setQuery('');
              setActiveFilter('all');
            }}
            subtitle="No hay productos que coincidan con la búsqueda o el filtro actual."
            theme={theme}
            title="Sin productos encontrados"
          />
        )}

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
              Últimos cambios
            </Text>
            <View style={[styles.todayBadge, { backgroundColor: theme.actionSoft }]}>
              <Text style={[styles.todayText, { color: theme.amber }]}>Hoy</Text>
            </View>
          </View>
          {movements.map((movement, index) => (
            <View key={`${movement.text}-${index}`} style={styles.movementItem}>
              <Text style={styles.movementIcon}>{movement.icon}</Text>
              <Text selectable style={[styles.movementCopy, { color: theme.muted }]}>
                {movement.text}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <BottomNav active="kitchen" isDarkMode={isDarkMode} navigate={navigate} theme={theme} />

      <MenuDetailSheet
        isDarkMode={isDarkMode}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={(item) => setDeleteTarget(item)}
        onDuplicate={duplicateItem}
        onEdit={openEditItem}
        onToggle={toggleAvailability}
        theme={theme}
      />
      <MenuFormSheet
        draft={draft}
        isDarkMode={isDarkMode}
        isOpen={isFormOpen}
        onCancel={closeForm}
        onChange={(changes) => setDraft((currentDraft) => ({ ...currentDraft, ...changes }))}
        onSave={saveItem}
        title={editingItem ? 'Editar producto' : 'Agregar producto'}
        theme={theme}
      />
      <DeleteMenuItemModal
        isDarkMode={isDarkMode}
        item={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        theme={theme}
      />
    </ScreenBackground>
  );
}

function MenuItemCard({ isDarkMode, item, onDelete, onDetail, onEdit, onToggle, theme }) {
  return (
    <Pressable
      onPress={onDetail}
      style={({ pressed }) => [
        styles.menuCard,
        {
          backgroundColor: theme.surface,
          borderColor: item.available ? theme.surfaceBorder : theme.warningText,
          boxShadow: theme.cardShadow,
          opacity: pressed ? 0.86 : 1,
        },
      ]}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.itemIcon, { backgroundColor: theme.softIcon }]}>
          <Text style={styles.itemIconText}>{item.icon}</Text>
        </View>
        <View style={styles.itemText}>
          <View style={styles.itemTitleRow}>
            <Text selectable style={[styles.itemName, { color: theme.title }]}>
              {item.name}
            </Text>
            {item.featured ? <Text style={styles.featuredMark}>⭐</Text> : null}
          </View>
          <Text selectable style={[styles.itemDetail, { color: theme.muted }]}>
            {item.description || item.category} · ${Number(item.price || 0).toFixed(2)}
          </Text>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: item.available ? '#dcfce7' : theme.warningBg }]}>
              <Text style={[styles.statusBadgeText, { color: item.available ? '#166534' : theme.warningText }]}>
                {item.available ? 'Activo' : 'Pausado'}
              </Text>
            </View>
            <View style={[styles.typeBadge, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : theme.actionSoft }]}>
              <Text style={[styles.typeBadgeText, { color: theme.amber }]}>{item.type}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.menuActions}>
        <Pressable onPress={onToggle} style={[styles.editButton, { backgroundColor: theme.actionSoft }]}>
          <Text style={[styles.editText, { color: theme.amber }]}>{item.available ? 'Pausar' : 'Activar'}</Text>
        </Pressable>
        <Pressable onPress={onEdit} style={[styles.editButton, { backgroundColor: theme.actionSoft }]}>
          <Text style={[styles.editText, { color: theme.amber }]}>Editar</Text>
        </Pressable>
        <Pressable
          onPress={onDelete}
          style={[
            styles.deleteButton,
            {
              backgroundColor: isDarkMode ? '#ef4444' : '#dc2626',
              boxShadow: isDarkMode ? '0 8px 18px rgba(239, 68, 68, 0.20)' : 'none',
            },
          ]}
        >
          <Text style={styles.deleteText}>Eliminar</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function MenuDetailSheet({ isDarkMode, item, onClose, onDelete, onDuplicate, onEdit, onToggle, theme }) {
  if (!item) {
    return null;
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={Boolean(item)}>
      <View style={styles.sheetOverlay}>
        <View style={[styles.sheetCard, getModalSurface(isDarkMode, theme)]}>
          <View style={[styles.sheetGrabber, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.18)' : '#d6d3d1' }]} />
          <View style={styles.sheetHeader}>
            <View style={[styles.sheetIcon, { backgroundColor: theme.softIcon }]}>
              <Text style={styles.sheetIconText}>{item.icon}</Text>
            </View>
            <View style={styles.sheetTitleWrap}>
              <Text selectable style={[styles.sheetTitle, { color: theme.title }]}>
                {item.name}
              </Text>
              <Text selectable style={[styles.sheetCopy, { color: theme.muted }]}>
                {item.category} · {item.type} · ${Number(item.price || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={[styles.detailBox, { backgroundColor: theme.actionSoft }]}>
            <Text selectable style={[styles.detailLabel, { color: theme.muted }]}>
              Descripción
            </Text>
            <Text selectable style={[styles.detailValue, { color: theme.title }]}>
              {item.description || 'Producto del menú'}
            </Text>
            <Text selectable style={[styles.detailLabel, { color: theme.muted }]}>
              Estado
            </Text>
            <Text selectable style={[styles.detailValue, { color: theme.title }]}>
              {item.available ? 'Disponible para pedidos' : 'Pausado temporalmente'}
            </Text>
          </View>

          <View style={styles.sheetActionsGrid}>
            <ActionOption label="Editar" onPress={() => onEdit(item)} theme={theme} />
            <ActionOption label={item.available ? 'Pausar' : 'Activar'} onPress={() => onToggle(item)} theme={theme} />
            <ActionOption label="Duplicar" onPress={() => onDuplicate(item)} theme={theme} />
            <ActionOption label="Eliminar" destructive onPress={() => onDelete(item)} theme={theme} />
          </View>

          <Pressable onPress={onClose} style={[styles.modalPrimaryFull, { backgroundColor: theme.accent }]}>
            <Text style={styles.modalPrimaryText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function MenuFormSheet({ draft, isDarkMode, isOpen, onCancel, onChange, onSave, theme, title }) {
  const canSave = draft.name.trim() && Number(draft.price || 0) > 0;

  return (
    <Modal animationType="slide" onRequestClose={onCancel} transparent visible={isOpen}>
      <View style={styles.sheetOverlay}>
        <View style={[styles.sheetCard, getModalSurface(isDarkMode, theme)]}>
          <View style={[styles.sheetGrabber, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.18)' : '#d6d3d1' }]} />
          <Text selectable style={[styles.modalTitle, { color: theme.title }]}>
            {title}
          </Text>
          <Text selectable style={[styles.modalCopy, { color: theme.muted }]}>
            El producto activo aparece automáticamente en Cliente / Mesero.
          </Text>

          <View style={styles.formGrid}>
            <FormInput label="Nombre" onChangeText={(value) => onChange({ name: value })} theme={theme} value={draft.name} />
            <FormInput keyboardType="numeric" label="Precio" onChangeText={(value) => onChange({ price: value })} theme={theme} value={String(draft.price)} />
            <FormInput label="Icono" onChangeText={(value) => onChange({ icon: value })} theme={theme} value={draft.icon} />
            <FormInput label="Categoría" onChangeText={(value) => onChange({ category: value })} theme={theme} value={draft.category} />
            <FormInput label="Tipo" onChangeText={(value) => onChange({ type: value })} theme={theme} value={draft.type} />
            <FormInput label="Descripción" onChangeText={(value) => onChange({ description: value })} theme={theme} value={draft.description} />
          </View>

          <View style={styles.toggleRow}>
            <TogglePill active={draft.available} label={draft.available ? 'Disponible' : 'Pausado'} onPress={() => onChange({ available: !draft.available })} theme={theme} />
            <TogglePill active={draft.featured} label={draft.featured ? 'Destacado' : 'No destacado'} onPress={() => onChange({ featured: !draft.featured })} theme={theme} />
          </View>

          {!canSave ? (
            <Text selectable style={styles.formError}>
              Agrega nombre y precio mayor a 0 para guardar.
            </Text>
          ) : null}

          <View style={styles.modalActions}>
            <SheetSecondaryButton isDarkMode={isDarkMode} label="Cancelar" onPress={onCancel} theme={theme} />
            <SheetPrimaryButton disabled={!canSave} label="Guardar" onPress={onSave} theme={theme} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function DeleteMenuItemModal({ isDarkMode, item, onCancel, onConfirm, theme }) {
  return (
    <Modal animationType="fade" onRequestClose={onCancel} transparent visible={Boolean(item)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalCard, getModalSurface(isDarkMode, theme)]}>
          <Text selectable style={[styles.modalTitle, { color: theme.title }]}>
            Eliminar producto
          </Text>
          <Text selectable style={[styles.modalCopy, { color: theme.muted }]}>
            ¿Seguro que deseas eliminar {item?.name}? Ya no aparecerá para nuevos pedidos.
          </Text>
          <View style={styles.modalActions}>
            <SheetSecondaryButton isDarkMode={isDarkMode} label="Cancelar" onPress={onCancel} theme={theme} />
            <Pressable onPress={onConfirm} style={[styles.modalPrimary, { backgroundColor: '#dc2626' }]}>
              <Text style={styles.modalPrimaryText}>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ActionOption({ destructive = false, label, onPress, theme }) {
  return (
    <Pressable onPress={onPress} style={[styles.actionOption, { backgroundColor: destructive ? '#dc2626' : theme.actionSoft }]}>
      <Text style={[styles.actionOptionText, { color: destructive ? '#ffffff' : theme.amber }]}>{label}</Text>
    </Pressable>
  );
}

function TogglePill({ active, label, onPress, theme }) {
  return (
    <Pressable onPress={onPress} style={[styles.togglePill, { backgroundColor: active ? theme.accent : theme.actionSoft }]}>
      <Text style={[styles.togglePillText, { color: active ? '#ffffff' : theme.amber }]}>{label}</Text>
    </Pressable>
  );
}

function FormInput({ keyboardType = 'default', label, onChangeText, theme, value }) {
  return (
    <View style={[styles.formInputWrap, { backgroundColor: theme.actionSoft }]}>
      <Text selectable style={[styles.formLabel, { color: theme.muted }]}>
        {label}
      </Text>
      <TextInput
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={label}
        placeholderTextColor={theme.muted}
        style={[styles.formInput, { color: theme.title }]}
        value={value}
      />
    </View>
  );
}

function SheetSecondaryButton({ isDarkMode, label, onPress, theme }) {
  return (
    <Pressable onPress={onPress} style={[styles.modalSecondary, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#efe7e1' }]}>
      <Text style={[styles.modalSecondaryText, { color: theme.title }]}>{label}</Text>
    </Pressable>
  );
}

function SheetPrimaryButton({ disabled = false, label, onPress, theme }) {
  return (
    <Pressable disabled={disabled} onPress={onPress} style={[styles.modalPrimary, { backgroundColor: theme.accent, opacity: disabled ? 0.45 : 1 }]}>
      <Text style={styles.modalPrimaryText}>{label}</Text>
    </Pressable>
  );
}

function buildDraftFromItem(item) {
  return {
    available: Boolean(item.available),
    category: item.category || 'General',
    description: item.description || '',
    featured: Boolean(item.featured),
    icon: item.icon || '☕',
    name: item.name || '',
    price: String(item.price || ''),
    type: item.type || 'Platillo',
  };
}

function groupByCategory(items) {
  const groups = items.reduce((sections, item) => {
    const category = item.category || 'General';
    const existingSection = sections.find((section) => section.title === category);

    if (existingSection) {
      existingSection.items.push(item);
      return sections;
    }

    return [...sections, { title: category, items: [item] }];
  }, []);

  return groups.sort((first, second) => first.title.localeCompare(second.title));
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
    minHeight: 1180,
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
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  actionButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 15,
    height: 42,
    justifyContent: 'center',
    width: '47.8%',
  },
  wideAction: {
    width: '100%',
  },
  actionText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  searchBox: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    height: 46,
    marginTop: 14,
    paddingHorizontal: 15,
  },
  searchIcon: {
    fontSize: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    outlineStyle: 'none',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  filterButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    flex: 1,
    height: 38,
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 10,
    fontWeight: '900',
  },
  sectionTitle: {
    marginTop: 14,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '900',
  },
  sectionSubtitle: {
    fontSize: 11,
    paddingTop: 3,
  },
  menuCard: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 10,
    padding: 13,
  },
  menuLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
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
    fontSize: 22,
  },
  itemText: {
    flex: 1,
  },
  itemTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  itemName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  featuredMark: {
    fontSize: 12,
  },
  itemDetail: {
    fontSize: 11,
    paddingTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  typeBadge: {
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: '900',
  },
  menuActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  editButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 12,
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },
  editText: {
    fontSize: 11,
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 12,
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  movementCard: {
    borderCurve: 'continuous',
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 14,
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
    marginTop: 10,
  },
  movementIcon: {
    fontSize: 14,
  },
  movementCopy: {
    flex: 1,
    fontSize: 11,
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
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  sheetIcon: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 18,
    height: 58,
    justifyContent: 'center',
    width: 58,
  },
  sheetIconText: {
    fontSize: 28,
  },
  sheetTitleWrap: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  sheetCopy: {
    fontSize: 12,
    lineHeight: 17,
    paddingTop: 5,
  },
  detailBox: {
    borderCurve: 'continuous',
    borderRadius: 16,
    marginTop: 14,
    padding: 14,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '800',
    paddingTop: 8,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    paddingTop: 3,
  },
  sheetActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  actionOption: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    flexBasis: '48%',
    flexGrow: 1,
    height: 42,
    justifyContent: 'center',
  },
  actionOptionText: {
    fontSize: 11,
    fontWeight: '900',
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
    maxWidth: 380,
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
  formGrid: {
    gap: 10,
    marginTop: 14,
  },
  formInputWrap: {
    borderCurve: 'continuous',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
  },
  formInput: {
    fontSize: 13,
    fontWeight: '800',
    minHeight: 28,
    outlineStyle: 'none',
    paddingTop: 3,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  togglePill: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  togglePillText: {
    fontSize: 11,
    fontWeight: '900',
  },
  formError: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 10,
  },
});
