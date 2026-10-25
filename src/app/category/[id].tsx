import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorMessage } from '@/components/error-message';
import { Loading } from '@/components/loading';
import { ProductCard } from '@/components/product-card';
import { ScreenHeader } from '@/components/screen-header';
import { colors } from '@/constants/colors';
import { getCategory, getProductsByCategory } from '@/services/categories';
import type { Product } from '@/types/product';

export default function CategoryProductsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('Categoría');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadProducts() {
        setLoading(true);
        setError('');

        try {
          const categoryId = Number(id);

          if (!Number.isInteger(categoryId) || categoryId <= 0) {
            throw new Error('La categoría no es válida.');
          }

          const category = await getCategory(categoryId);
          const data = await getProductsByCategory(categoryId);

          if (active) {
            setCategoryName(category.name);
            setProducts(data);
          }
        } catch (error) {
          if (active) {
            setError(
              error instanceof Error
                ? error.message
                : 'No se pudieron cargar los productos. Revisá tu conexión.',
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void loadProducts();

      return () => {
        active = false;
      };
    }, [id, retry]),
  );

  function handleRetry() {
    setRetry((previous) => previous + 1);
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/categories');
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScreenHeader title={categoryName} onBack={goBack} compact />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : (
        <FlatList
          style={styles.container}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          numColumns={2}
          data={products}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.message}>
              Esta categoría no tiene productos.
            </Text>
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                router.push({
                  pathname: '/product/[id]',
                  params: { id: String(item.id) },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    gap: 24,
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
  },
  message: {
    color: colors.textMuted,
    textAlign: 'center',
  },
});
