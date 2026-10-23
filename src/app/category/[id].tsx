import { router, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: categoryName }} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>Cargando productos...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>

          <Pressable
            style={styles.button}
            accessibilityRole="button"
            onPress={() => setRetry(retry + 1)}
          >
            <Text style={styles.buttonText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={products}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.message}>
              Esta categoría no tiene productos.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.product}
              accessibilityRole="button"
              accessibilityLabel={`Ver detalle de ${item.title}`}
              onPress={() =>
                router.push({
                  pathname: '/product/[id]',
                  params: { id: String(item.id) },
                })
              }
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.price}>${item.price}</Text>
            </Pressable>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  message: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.surface,
    fontWeight: '600',
  },
  product: {
    padding: 16,
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
});