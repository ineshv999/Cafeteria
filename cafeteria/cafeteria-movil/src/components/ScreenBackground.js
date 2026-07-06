import { ScrollView, StyleSheet, View } from 'react-native';

export default function ScreenBackground({ children, isDarkMode, theme, contentStyle }) {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.screen, { backgroundColor: theme.background }, contentStyle]}
    >
      <View style={[styles.backgroundBlock, styles.topBlock, { backgroundColor: theme.topTint }]} />
      <View style={[styles.backgroundBlock, styles.middleBlock, { backgroundColor: theme.midTint }]} />
      <View style={[styles.backgroundBlock, styles.bottomBlock, { backgroundColor: theme.bottomTint }]} />

      {isDarkMode && (
        <>
          <View style={[styles.ambientGlow, styles.topGlow]} />
          <View style={[styles.ambientGlow, styles.bottomGlow]} />
        </>
      )}

      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    minHeight: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundBlock: {
    left: 0,
    position: 'absolute',
    right: 0,
  },
  topBlock: {
    height: '36%',
    top: 0,
  },
  middleBlock: {
    height: '38%',
    top: '30%',
  },
  bottomBlock: {
    bottom: 0,
    height: '42%',
  },
  ambientGlow: {
    borderRadius: 999,
    position: 'absolute',
  },
  topGlow: {
    backgroundColor: 'rgba(245, 158, 11, 0.24)',
    height: 220,
    right: -88,
    top: -76,
    width: 220,
  },
  bottomGlow: {
    backgroundColor: 'rgba(120, 53, 15, 0.45)',
    bottom: -104,
    height: 230,
    left: -92,
    width: 230,
  },
});
