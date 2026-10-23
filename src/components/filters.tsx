import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/colors';
import type { Category } from '@/types/category';

const CATEGORY_SKELETONS = [0, 1, 2, 3];

type FiltersProps = {
  title: string;
  minPrice: string;
  maxPrice: string;
  priceError: string | null;
  categories: Category[];
  selectedCategoryId?: number;
  isCategoriesLoading: boolean;
  categoryError: string | null;
  onTitleChange: (value: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onCategoryChange: (categoryId?: number) => void;
  onRetryCategories: () => void;
  onClear: () => void;
};

export function Filters({
  title,
  minPrice,
  maxPrice,
  priceError,
  categories,
  selectedCategoryId,
  isCategoriesLoading,
  categoryError,
  onTitleChange,
  onMinPriceChange,
  onMaxPriceChange,
  onCategoryChange,
  onRetryCategories,
  onClear,
}: FiltersProps) {
  const hasFilters =
    title.trim() !== '' ||
    minPrice.trim() !== '' ||
    maxPrice.trim() !== '' ||
    selectedCategoryId != null;

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

      <Text style={styles.label}>Categorías</Text>
      {isCategoriesLoading && categories.length === 0 ? (
        <View accessibilityLabel="Cargando categorías" style={styles.categorySkeletonRow}>
          {CATEGORY_SKELETONS.map((item) => (
            <View key={item} style={styles.categorySkeleton} />
          ))}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.categoryList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => onCategoryChange(undefined)}
            style={({ pressed }) => [
              styles.categoryChip,
              selectedCategoryId == null && styles.categoryChipActive,
              pressed && styles.categoryChipPressed,
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategoryId == null && styles.categoryChipTextActive,
              ]}
            >
              Todas
            </Text>
          </Pressable>

          {categories.map((category) => {
            const isSelected = selectedCategoryId === category.id;

            return (
              <Pressable
                accessibilityRole="button"
                key={category.id}
                onPress={() => onCategoryChange(category.id)}
                style={({ pressed }) => [
                  styles.categoryChip,
                  isSelected && styles.categoryChipActive,
                  pressed && styles.categoryChipPressed,
                ]}
              >
                <Text
                  numberOfLines={2}
                  style={[styles.categoryChipText, isSelected && styles.categoryChipTextActive]}
                >
                  {category.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {categoryError ? (
        <View style={styles.categoryErrorRow}>
          <Text style={styles.categoryErrorText}>{categoryError}</Text>
          <Pressable accessibilityRole="button" onPress={onRetryCategories}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

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
  categoryList: {
    gap: 8,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    height: 68,
    justifyContent: 'center',
    minWidth: 76,
    paddingHorizontal: 12,
  },
  categoryChipActive: {
    backgroundColor: colors.text,
  },
  categoryChipPressed: {
    opacity: 0.72,
  },
  categoryChipText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '500',
    maxWidth: 88,
    textAlign: 'center',
  },
  categoryChipTextActive: {
    color: colors.inverse,
  },
  categorySkeletonRow: {
    flexDirection: 'row',
    gap: 8,
    overflow: 'hidden',
  },
  categorySkeleton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    height: 68,
    width: 76,
  },
  categoryErrorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryErrorText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  retryText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
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
