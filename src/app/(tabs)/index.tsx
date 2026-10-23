import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorMessage } from '@/components/error-message';
import { Filters } from '@/components/filters';
import { Loading } from '@/components/loading';
import { ProductCard } from '@/components/product-card';
import { colors } from '@/constants/colors';
import { getProducts } from '@/services/products';
import type { Product } from '@/types/product';

const PAGE_SIZE = 10;
const FILTER_DELAY = 400;

type AppliedFilters = {
  title?: string;
  priceMin?: number;
  priceMax?: number;
};

function parsePrice(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const price = Number(value.replace(',', '.'));
  return Number.isFinite(price) && price >= 0 ? price : undefined;
}

function getPriceError(minValue: string, maxValue: string): string | null {
  const hasMinPrice = minValue.trim() !== '';
  const hasMaxPrice = maxValue.trim() !== '';
  const minPrice = parsePrice(minValue);
  const maxPrice = parsePrice(maxValue);

  if (hasMinPrice && minPrice == null) return 'Ingresá un precio mínimo válido.';
  if (hasMaxPrice && maxPrice == null) return 'Ingresá un precio máximo válido.';
  if (hasMinPrice && !hasMaxPrice) return 'Completá también el precio máximo.';
  if (!hasMinPrice && hasMaxPrice) return 'Completá también el precio mínimo.';
  if (minPrice != null && maxPrice != null && minPrice > maxPrice) {
    return 'El precio mínimo no puede superar al máximo.';
  }

  return null;
}

export default function ProductListScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [titleFilter, setTitleFilter] = useState('');
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const appliedFiltersRef = useRef<AppliedFilters>({});
  const requestIdRef = useRef(0);

  const minPrice = parsePrice(minPriceFilter);
  const maxPrice = parsePrice(maxPriceFilter);
  const priceError = getPriceError(minPriceFilter, maxPriceFilter);
  const hasActiveFilters =
    titleFilter.trim() !== '' || minPriceFilter.trim() !== '' || maxPriceFilter.trim() !== '';

  const loadProducts = useCallback(async (filters: AppliedFilters = appliedFiltersRef.current) => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await getProducts({
        offset: 0,
        limit: PAGE_SIZE,
        title: filters.title,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
      });
      if (requestId === requestIdRef.current) setProducts(data);
    } catch (error: unknown) {
      if (requestId !== requestIdRef.current) return;
      setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar los productos.');
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (priceError) return;

    const timeout = setTimeout(() => {
      const nextFilters = {
        title: titleFilter.trim() || undefined,
        priceMin: minPrice,
        priceMax: maxPrice,
      };
      const currentFilters = appliedFiltersRef.current;

      if (
        currentFilters.title === nextFilters.title &&
        currentFilters.priceMin === nextFilters.priceMin &&
        currentFilters.priceMax === nextFilters.priceMax
      ) {
        return;
      }

      appliedFiltersRef.current = nextFilters;
      void loadProducts(nextFilters);
    }, FILTER_DELAY);

    return () => clearTimeout(timeout);
  }, [loadProducts, maxPrice, minPrice, priceError, titleFilter]);

  useFocusEffect(
    useCallback(() => {
      void loadProducts();

      return () => {
        requestIdRef.current += 1;
      };
    }, [loadProducts]),
  );

  const openProduct = useCallback(
    (id: number) => {
      router.push({ pathname: '/product/[id]', params: { id: String(id) } });
    },
    [router],
  );

  const retry = useCallback(() => {
    void loadProducts();
  }, [loadProducts]);

  const createProduct = useCallback(() => {
    router.push('/product/new');
  }, [router]);

  const clearFilters = useCallback(() => {
    setTitleFilter('');
    setMinPriceFilter('');
    setMaxPriceFilter('');
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Tabs.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View accessibilityElementsHidden style={styles.iconButton}>
          <View style={styles.menuLines}>
            <View style={styles.menuLineLong} />
            <View style={styles.menuLineLong} />
            <View style={styles.menuLineShort} />
          </View>
        </View>

        <Text style={styles.brand}>PANEL</Text>

        <Pressable
          accessibilityLabel="Nuevo producto"
          accessibilityRole="button"
          onPress={createProduct}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <Text style={styles.addIcon}>+</Text>
        </Pressable>
      </View>

      <Filters
        maxPrice={maxPriceFilter}
        minPrice={minPriceFilter}
        onClear={clearFilters}
        onMaxPriceChange={setMaxPriceFilter}
        onMinPriceChange={setMinPriceFilter}
        onTitleChange={setTitleFilter}
        priceError={priceError}
        title={titleFilter}
      />

      {isLoading ? <Loading /> : null}
      {!isLoading && errorMessage ? <ErrorMessage message={errorMessage} onRetry={retry} /> : null}
      {!isLoading && !errorMessage ? (
        <FlatList
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          data={products}
          keyExtractor={(product) => String(product.id)}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {hasActiveFilters ? 'No encontramos productos' : 'No hay productos para mostrar'}
              </Text>
              <Text style={styles.emptyMessage}>
                {hasActiveFilters
                  ? 'Probá con otros filtros.'
                  : 'Podés crear el primer producto desde esta pantalla.'}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={hasActiveFilters ? clearFilters : createProduct}
                style={({ pressed }) => [styles.emptyButton, pressed && styles.emptyButtonPressed]}
              >
                <Text style={styles.emptyButtonText}>
                  {hasActiveFilters ? 'Limpiar filtros' : 'Crear producto'}
                </Text>
              </Pressable>
            </View>
          }
          numColumns={2}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => openProduct(item.id)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconButtonPressed: {
    opacity: 0.65,
  },
  menuLines: {
    gap: 4,
  },
  menuLineLong: {
    backgroundColor: colors.text,
    height: 2,
    width: 16,
  },
  menuLineShort: {
    backgroundColor: colors.text,
    height: 2,
    width: 10,
  },
  brand: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2.5,
  },
  addIcon: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 26,
  },
  productList: {
    flexGrow: 1,
    gap: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  productRow: {
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyMessage: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.text,
    borderRadius: 999,
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 52,
  },
  emptyButtonPressed: {
    opacity: 0.72,
  },
  emptyButtonText: {
    color: colors.inverse,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
