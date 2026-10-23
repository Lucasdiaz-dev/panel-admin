import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/colors';

type FiltersProps = {
  title: string;
  minPrice: string;
  maxPrice: string;
  priceError: string | null;
  onTitleChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onClear: () => void;
};

export function Filters({
  title,
  minPrice,
  maxPrice,
  priceError,
  onTitleChange,
  onMinPriceChange,
  onMaxPriceChange,
  onClear,
}: FiltersProps) {
  const hasFilters = title.trim() !== '' || minPrice.trim() !== '' || maxPrice.trim() !== '';

  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Buscar producto"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onTitleChange}
        placeholder="Buscar producto"
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        style={styles.searchInput}
        value={title}
      />

      <View style={styles.priceHeader}>
        <Text style={styles.label}>Rango de precio</Text>
        {hasFilters ? (
          <Pressable accessibilityRole="button" onPress={onClear}>
            <Text style={styles.clearText}>Limpiar</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.priceRow}>
        <TextInput
          accessibilityLabel="Precio mínimo"
          keyboardType="decimal-pad"
          onChangeText={onMinPriceChange}
          placeholder="Mínimo"
          placeholderTextColor={colors.textMuted}
          style={styles.priceInput}
          value={minPrice}
        />
        <TextInput
          accessibilityLabel="Precio máximo"
          keyboardType="decimal-pad"
          onChangeText={onMaxPriceChange}
          placeholder="Máximo"
          placeholderTextColor={colors.textMuted}
          style={styles.priceInput}
          value={maxPrice}
        />
      </View>

      {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    height: 44,
    paddingHorizontal: 16,
  },
  priceHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  clearText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceInput: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontVariant: ['tabular-nums'],
    height: 44,
    paddingHorizontal: 16,
  },
  errorText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
  },
});
