import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorMessage } from '@/components/error-message';
import { Filters } from '@/components/filters';
import { Loading } from '@/components/loading';
import { ProductCard } from '@/components/product-card';
import { colors } from '@/constants/colors';
import { GROUP_PREFIX, hasGroupPrefix } from '@/constants/group';
import { getCategories } from '@/services/categories';
import { getProducts } from '@/services/products';
import type { Category } from '@/types/category';
import type { Product } from '@/types/product';

const PAGE_SIZE = 10;
const FILTER_DELAY = 400;
const REFRESH_COLORS = [colors.text];

type AppliedFilters = {
  title?: string;
  priceMin?: number;
  priceMax?: number;
  categoryId?: number;
  onlyMine?: boolean;
};

type LoadProductsOptions = {
  filters?: AppliedFilters;
  offset?: number;
  append?: boolean;
  refresh?: boolean;
};

function mergeProducts(current: Product[], incoming: Product[]): Product[] {
  const currentIds = new Set(current.map((product) => product.id));
  const uniqueIncoming = incoming.filter((product) => {
    if (currentIds.has(product.id)) return false;
    currentIds.add(product.id);
    return true;
  });
  return [...current, ...uniqueIncoming];
}

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paginationError, setPaginationError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [titleFilter, setTitleFilter] = useState('');
  const [minPriceFilter, setMinPriceFilter] = useState('');
  const [maxPriceFilter, setMaxPriceFilter] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [onlyMineFilter, setOnlyMineFilter] = useState(false);
  const appliedFiltersRef = useRef<AppliedFilters>({});
  const requestIdRef = useRef(0);
  const categoryRequestIdRef = useRef(0);
  const nextOffsetRef = useRef(0);

  const minPrice = parsePrice(minPriceFilter);
  const maxPrice = parsePrice(maxPriceFilter);
  const priceError = getPriceError(minPriceFilter, maxPriceFilter);
  const hasActiveFilters =
    titleFilter.trim() !== '' ||
    minPriceFilter.trim() !== '' ||
    maxPriceFilter.trim() !== '' ||
    selectedCategoryId != null ||
    onlyMineFilter;

  const loadProducts = useCallback(
    async ({
      filters = appliedFiltersRef.current,
      offset = 0,
      append = false,
      refresh = false,
    }: LoadProductsOptions = {}) => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      if (append) {
        setIsRefreshing(false);
        setIsLoadingMore(true);
        setPaginationError(null);
      } else if (refresh) {
        setIsRefreshing(true);
        setIsLoadingMore(false);
        setErrorMessage(null);
        setPaginationError(null);
      } else {
        setIsLoading(true);
        setIsLoadingMore(false);
        setIsRefreshing(false);
        setErrorMessage(null);
        setPaginationError(null);
      }

      try {
        const data = await getProducts({
          offset,
          limit: PAGE_SIZE,
          title: filters.onlyMine ? GROUP_PREFIX : filters.title,
          priceMin: filters.priceMin,
          priceMax: filters.priceMax,
          categoryId: filters.categoryId,
        });
        const normalizedTitle = filters.title?.toLocaleLowerCase();
        const visibleProducts = filters.onlyMine
          ? data.filter(
              (product) =>
                hasGroupPrefix(product.title) &&
                (!normalizedTitle || product.title.toLocaleLowerCase().includes(normalizedTitle)),
            )
          : data;

        if (requestId !== requestIdRef.current) return;

        setProducts((current) => (append ? mergeProducts(current, visibleProducts) : visibleProducts));
        nextOffsetRef.current = offset + data.length;
        setHasMore(data.length === PAGE_SIZE);
      } catch (error: unknown) {
        if (requestId !== requestIdRef.current) return;
        const message = error instanceof Error ? error.message : 'No se pudieron cargar los productos.';
        if (append) setPaginationError(message);
        else setErrorMessage(message);
      } finally {
        if (requestId !== requestIdRef.current) return;
        if (append) setIsLoadingMore(false);
        else if (refresh) setIsRefreshing(false);
        else setIsLoading(false);
      }
    },
    [],
  );

  const loadCategories = useCallback(async () => {
    const requestId = categoryRequestIdRef.current + 1;
    categoryRequestIdRef.current = requestId;

    setIsCategoriesLoading(true);
    setCategoryError(null);

    try {
      const data = await getCategories();
      if (requestId === categoryRequestIdRef.current) setCategories(data);
    } catch (error: unknown) {
      if (requestId !== categoryRequestIdRef.current) return;
      setCategoryError(error instanceof Error ? error.message : 'No se pudieron cargar las categorías.');
    } finally {
      if (requestId === categoryRequestIdRef.current) setIsCategoriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (priceError) return;

    const timeout = setTimeout(() => {
      const nextFilters = {
        title: titleFilter.trim() || undefined,
        priceMin: minPrice,
        priceMax: maxPrice,
        categoryId: selectedCategoryId,
        onlyMine: onlyMineFilter || undefined,
      };
      const currentFilters = appliedFiltersRef.current;

      if (
        currentFilters.title === nextFilters.title &&
        currentFilters.priceMin === nextFilters.priceMin &&
        currentFilters.priceMax === nextFilters.priceMax &&
        currentFilters.categoryId === nextFilters.categoryId &&
        currentFilters.onlyMine === nextFilters.onlyMine
      ) {
        return;
      }

      appliedFiltersRef.current = nextFilters;
      void loadProducts({ filters: nextFilters });
    }, FILTER_DELAY);

    return () => clearTimeout(timeout);
  }, [loadProducts, maxPrice, minPrice, onlyMineFilter, priceError, selectedCategoryId, titleFilter]);

  useFocusEffect(
    useCallback(() => {
      void loadProducts();
      void loadCategories();

      return () => {
        requestIdRef.current += 1;
        categoryRequestIdRef.current += 1;
      };
    }, [loadCategories, loadProducts]),
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

  const refresh = useCallback(() => {
    if (isLoading || isLoadingMore || isRefreshing) return;
    void loadProducts({ refresh: true });
    void loadCategories();
  }, [isLoading, isLoadingMore, isRefreshing, loadCategories, loadProducts]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || isRefreshing || !hasMore) return;
    void loadProducts({ offset: nextOffsetRef.current, append: true });
  }, [hasMore, isLoadingMore, isRefreshing, loadProducts]);

  const retryCategories = useCallback(() => {
    void loadCategories();
  }, [loadCategories]);

  const createProduct = useCallback(() => {
    router.push('/product/new');
  }, [router]);

  const clearFilters = useCallback(() => {
    setTitleFilter('');
    setMinPriceFilter('');
    setMaxPriceFilter('');
    setSelectedCategoryId(undefined);
    setOnlyMineFilter(false);
  }, []);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <Tabs.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <View style={styles.headerSpacer} />

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
        categories={categories}
        categoryError={categoryError}
        isCategoriesLoading={isCategoriesLoading}
        maxPrice={maxPriceFilter}
        minPrice={minPriceFilter}
        onCategoryChange={setSelectedCategoryId}
        onClear={clearFilters}
        onMaxPriceChange={setMaxPriceFilter}
        onMinPriceChange={setMinPriceFilter}
        onOnlyMineChange={setOnlyMineFilter}
        onRetryCategories={retryCategories}
        onTitleChange={setTitleFilter}
        onlyMine={onlyMineFilter}
        priceError={priceError}
        selectedCategoryId={selectedCategoryId}
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
          ListFooterComponent={
            hasMore || paginationError ? (
              <View style={styles.paginationFooter}>
                {paginationError ? <Text style={styles.paginationError}>{paginationError}</Text> : null}
                {isLoadingMore ? (
                  <ActivityIndicator
                    accessibilityLabel="Cargando más productos"
                    color={colors.text}
                    size="small"
                    style={styles.loadMoreIndicator}
                  />
                ) : null}
                {hasMore && !isLoadingMore ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ disabled: isLoadingMore || isRefreshing }}
                    disabled={isLoadingMore || isRefreshing}
                    onPress={loadMore}
                    style={({ pressed }) => [
                      styles.loadMoreButton,
                      (pressed || isLoadingMore || isRefreshing) && styles.loadMoreButtonPressed,
                    ]}
                  >
                    <Text style={styles.loadMoreButtonText}>
                      {paginationError ? 'Reintentar' : 'Cargar más'}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : undefined
          }
          numColumns={2}
          refreshControl={
            <RefreshControl
              colors={REFRESH_COLORS}
              onRefresh={refresh}
              progressBackgroundColor={colors.background}
              refreshing={isRefreshing}
              tintColor={colors.text}
            />
          }
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
  headerSpacer: {
    height: 40,
    width: 40,
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
  paginationFooter: {
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
  },
  paginationError: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  loadMoreButton: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.text,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 48,
  },
  loadMoreIndicator: {
    minHeight: 48,
  },
  loadMoreButtonPressed: {
    opacity: 0.72,
  },
  loadMoreButtonText: {
    color: colors.inverse,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
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
