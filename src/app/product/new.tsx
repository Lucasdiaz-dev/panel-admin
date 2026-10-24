import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getCategories()
      .then((data) => {
        if (cancelled) return;
        setError(null);
        setCategories(data);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(errorMessage(caught));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(input: ProductInput) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await createProduct(input);
      router.back();
    } catch (caught: unknown) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <FormHeader title="Nuevo producto" />
      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
