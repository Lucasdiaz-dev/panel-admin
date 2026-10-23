import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';
import { getCategories } from '@/services/categories';
import type { Category } from '@/types/category';

export default function CategoryListScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadCategories() {
        setLoading(true);
        setError('');
        setFailedImages([]);

        try {
          const data = await getCategories();

          if (active) {
            setCategories(data);
          }
        } catch (error) {
          if (active) {
            setError(
              error instanceof Error
                ? error.message
                : 'No se pudieron cargar las categorías. Revisá tu conexión.',
            );
          }
        } finally {
          if (active) {
            setLoading(false);
          }
        }
      }

      void loadCategories();

      return () => {
        active = false;
      };
    }, [retry]),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>Cargando categorías...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>

        <Pressable
          style={styles.button}
          onPress={() => setRetry(retry + 1)}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={categories}
      keyExtractor={(item) => String(item.id)}
      ListEmptyComponent={
        <Text style={styles.message}>No hay categorías disponibles.</Text>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          accessibilityRole="button"
          accessibilityLabel={`Ver productos de ${item.name}`}
          onPress={() =>
            router.push({
              pathname: '/category/[id]',
              params: { id: String(item.id) },
            })
          }
        >
          {!item.image || failedImages.includes(item.image) ? (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>Sin imagen</Text>
            </View>
          ) : (
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              onError={() =>
                setFailedImages((previous) => [...previous, item.image])
              }
            />
          )}

          <Text style={styles.name}>{item.name}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
    backgroundColor: colors.background,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  placeholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.placeholder,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
});