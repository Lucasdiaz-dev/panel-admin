import { StyleSheet, View } from 'react-native';

import { colors } from '@/constants/colors';

const SKELETON_ROWS = [0, 1, 2];

export function Loading() {
  return (
    <View accessibilityLabel="Cargando productos" accessibilityRole="progressbar" style={styles.container}>
      {SKELETON_ROWS.map((row) => (
        <View key={row} style={styles.row}>
          <View style={styles.card}>
            <View style={styles.image} />
            <View style={styles.price} />
            <View style={styles.title} />
            <View style={styles.category} />
          </View>
          <View style={styles.card}>
            <View style={styles.image} />
            <View style={styles.price} />
            <View style={styles.title} />
            <View style={styles.category} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
  },
  image: {
    aspectRatio: 0.85,
    backgroundColor: colors.surface,
    borderRadius: 22,
  },
  price: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    height: 16,
    marginTop: 10,
    width: '42%',
  },
  title: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    height: 12,
    marginTop: 6,
    width: '88%',
  },
  category: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    height: 10,
    marginTop: 6,
    width: '55%',
  },
});
