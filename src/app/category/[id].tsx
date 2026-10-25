import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ErrorMessage } from '@/components/error-message';
import { Loading } from '@/components/loading';
import { ProductCard } from '@/components/product-card';
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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: categoryName }} />

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMessage message={error} onRetry={handleRetry} />
      ) : (
        <FlatList
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
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