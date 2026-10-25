import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ErrorMessage } from '@/components/error-message';
import { FormHeader } from '@/components/form-header';
import { ProductForm } from '@/components/product-form';
import { colors } from '@/constants/colors';
import { getCategories } from '@/services/categories';
import { createProduct } from '@/services/products';
import type { Category } from '@/types/category';
import type { ProductInput } from '@/types/product';

function errorMessage(caught: unknown): string {
  return caught instanceof Error ? caught.message : String(caught);
}

export default function NewProductScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const loadRequestId = useRef(0);

  const loadCategories = useCallback(async () => {
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;
    setLoading(true);
    setLoadError(null);

    try {
      const data = await getCategories();
      if (requestId !== loadRequestId.current) return;
      setCategories(data);
    } catch (caught: unknown) {
      if (requestId !== loadRequestId.current) return;
      setLoadError(errorMessage(caught));
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
    return () => {
      loadRequestId.current += 1;
    };
  }, [loadCategories]);

  async function handleSubmit(input: ProductInput) {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createProduct(input);
      router.back();
      Alert.alert('Producto guardado', 'El producto se creó correctamente.');
    } catch (caught: unknown) {
      setSubmitError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <FormHeader title="Nuevo producto" />
      {loading ? <Text style={styles.status}>Cargando...</Text> : null}
      {!loading && loadError ? (
        <ErrorMessage
          title="No pudimos cargar las categorías"
          message={loadError}
          onRetry={() => void loadCategories()}
        />
      ) : null}
      {!loading && !loadError ? (
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={submitError}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  status: {
    color: colors.textMuted,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
