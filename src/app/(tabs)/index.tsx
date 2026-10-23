import { Tabs, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
    }, []),
  );

  const openProduct = useCallback(
    (id: number) => {
      router.push({ pathname: '/product/[id]', params: { id: String(id) } });
    },
    [router],
  );

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
          onPress={() => router.push('/product/new')}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
        >
          <Text style={styles.addIcon}>+</Text>
        </Pressable>
      </View>

      {isLoading ? <Text style={styles.statusText}>Cargando productos...</Text> : null}
      {!isLoading && errorMessage ? <Text style={styles.statusText}>{errorMessage}</Text> : null}
      {!isLoading && !errorMessage ? (
        <FlatList
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          data={products}
          keyExtractor={(product) => String(product.id)}
          ListEmptyComponent={<Text style={styles.statusText}>No hay productos para mostrar.</Text>}
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
    gap: 24,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  productRow: {
    gap: 12,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 24,
    textAlign: 'center',
  },
});
