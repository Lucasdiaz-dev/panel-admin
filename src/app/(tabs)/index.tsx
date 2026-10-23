import { Tabs, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorMessage } from '@/components/error-message';
import { Loading } from '@/components/loading';
import { ProductCard } from '@/components/product-card';
import { colors } from '@/constants/colors';
import { getProducts } from '@/services/products';
import type { Product } from '@/types/product';

const PAGE_SIZE = 10;

export default function ProductListScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      setIsLoading(true);
      setErrorMessage(null);

      getProducts({ offset: 0, limit: PAGE_SIZE })
        .then((data) => {
          if (isActive) setProducts(data);
        })
        .catch((error: unknown) => {
          if (!isActive) return;
          setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar los productos.');
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });

      return () => {
        isActive = false;
      };
    }, [reloadKey]),
  );

  const openProduct = useCallback(
    (id: number) => {
      router.push({ pathname: '/product/[id]', params: { id: String(id) } });
    },
    [router],
  );

  const retry = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  const createProduct = useCallback(() => {
    router.push('/product/new');
  }, [router]);

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
              <Text style={styles.emptyTitle}>No hay productos para mostrar</Text>
              <Text style={styles.emptyMessage}>Podés crear el primer producto desde esta pantalla.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={createProduct}
                style={({ pressed }) => [styles.emptyButton, pressed && styles.emptyButtonPressed]}
              >
                <Text style={styles.emptyButtonText}>Crear producto</Text>
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
