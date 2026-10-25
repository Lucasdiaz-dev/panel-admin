import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { FormHeader } from '@/components/form-header';
import { ProductForm } from '@/components/product-form';
import { colors } from '@/constants/colors';
import { hasGroupPrefix } from '@/constants/group';
import { getCategories } from '@/services/categories';
import { deleteProduct, getProduct, updateProduct } from '@/services/products';
import type { Category } from '@/types/category';
import type { Product, ProductInput } from '@/types/product';

function errorMessage(caught: unknown): string {
  return caught instanceof Error ? caught.message : String(caught);
}

export default function EditProductScreen() {
  const router = useRouter();
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const idParam = Array.isArray(rawId) ? rawId[0] : rawId;
  const productId = Number(idParam);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(productId)) {
      setLoading(false);
      setError('Producto inválido.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([getProduct(productId), getCategories()])
      .then(([nextProduct, nextCategories]) => {
        if (cancelled) return;
        setProduct(nextProduct);
        setCategories(nextCategories);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(errorMessage(caught));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleSubmit(input: ProductInput) {
    if (submitting || deleting) return;
    if (!product || !hasGroupPrefix(product.title)) return;
    setSubmitting(true);
    setError(null);
    try {
      await updateProduct(product.id, input);
      router.back();
      Alert.alert('Producto guardado', 'Los cambios se guardaron correctamente.');
    } catch (caught: unknown) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function runDelete() {
    if (!product || !hasGroupPrefix(product.title)) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteProduct(product.id);
      // Editar se abre desde el detalle: volver una sola vez caería en el producto borrado.
      router.dismiss(2);
      Alert.alert('Producto eliminado', 'El producto se eliminó correctamente.');
    } catch (caught: unknown) {
      setError(errorMessage(caught));
    } finally {
      setDeleting(false);
    }
  }

  function handleDelete() {
    if (submitting || deleting) return;
    if (!product || !hasGroupPrefix(product.title)) return;

    Alert.alert('Eliminar producto', '¿Seguro que querés eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void runDelete() },
    ]);
  }

  const canEdit = product != null && hasGroupPrefix(product.title);

  return (
    <View style={styles.container}>
      <FormHeader title="Editar producto" />
      {loading ? <Text style={styles.status}>Cargando...</Text> : null}
      {!loading && error && !canEdit ? <Text style={styles.status}>{error}</Text> : null}
      {!loading && product != null && !canEdit ? (
        <Text style={styles.status}>No podés editar este producto.</Text>
      ) : null}
      {!loading && canEdit ? (
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          submitting={submitting}
          onDelete={handleDelete}
          deleting={deleting}
          initialTitle={product.title}
          initialPrice={product.price}
          initialDescription={product.description}
          initialImageUrl={product.images[0]}
          initialCategoryId={product.category.id}
          error={error}
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
