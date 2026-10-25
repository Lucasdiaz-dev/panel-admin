import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorMessage } from '@/components/error-message';
import { Loading } from '@/components/loading';
import { ScreenHeader } from '@/components/screen-header';
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
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <ScreenHeader title="Categorías" />
        <Loading />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
        <ScreenHeader title="Categorías" />
        <ErrorMessage
          title="No pudimos cargar las categorías"
          message={error}
          onRetry={() => setRetry((previous) => previous + 1)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScreenHeader title="Categorías" />
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.list}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
                  setFailedImages((previous) =>
                    previous.includes(item.image)
                      ? previous
                      : [...previous, item.image],
                  )
                }
              />
            )}

            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
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
    paddingBottom: 24,
    gap: 12,
  },
  row: {
    gap: 12,
  },
  message: {
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    gap: 8,
  },
  image: {
    width: '100%',
    height: 118,
    borderRadius: 22,
    backgroundColor: colors.surface,
  },
  placeholder: {
    width: '100%',
    height: 118,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.placeholder,
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});