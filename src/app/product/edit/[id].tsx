import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ErrorMessage } from '@/components/error-message';
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

  const isValidId = Number.isFinite(productId);

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isValidId);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const loadRequestId = useRef(0);

  const loadData = useCallback(async () => {
    if (!isValidId) return;
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;
    setLoading(true);
    setLoadError(null);

    try {
      const [nextProduct, nextCategories] = await Promise.all([
        getProduct(productId),
        getCategories(),
      ]);
      if (requestId !== loadRequestId.current) return;
      setProduct(nextProduct);
      setCategories(nextCategories);
    } catch (caught: unknown) {
      if (requestId !== loadRequestId.current) return;
      setLoadError(errorMessage(caught));
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }, [isValidId, productId]);

  useEffect(() => {
    void loadData();
    return () => {
      loadRequestId.current += 1;
    };
  }, [loadData]);

  async function handleSubmit(input: ProductInput) {
    if (submitting || deleting) return;
    if (!product || !hasGroupPrefix(product.title)) return;
    setSubmitting(true);
    setActionError(null);
    try {
      await updateProduct(product.id, input);
      router.back();
      Alert.alert('Producto guardado', 'Los cambios se guardaron correctamente.');
    } catch (caught: unknown) {
      setActionError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function runDelete() {
    if (!product || !hasGroupPrefix(product.title)) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteProduct(product.id);
      // Editar se abre desde el detalle: volver una sola vez caería en el producto borrado.
      router.dismiss(2);
      Alert.alert('Producto eliminado', 'El producto se eliminó correctamente.');
    } catch (caught: unknown) {
      setActionError(errorMessage(caught));
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
      {!isValidId ? <Text style={styles.status}>Producto inválido.</Text> : null}
      {loading ? <Text style={styles.status}>Cargando...</Text> : null}
      {!loading && loadError ? (
        <ErrorMessage
          title="No pudimos cargar el producto"
          message={loadError}
          onRetry={() => void loadData()}
        />
      ) : null}
      {!loading && !loadError && product != null && !canEdit ? (
        <Text style={styles.status}>No podés editar este producto.</Text>
      ) : null}
      {!loading && !loadError && canEdit ? (
        <ProductForm
          categories={categories}
          onSubmit={handleSubmit}
          submitting={submitting}
          onDelete={handleDelete}
          deleting={deleting}
          initialTitle={product.title}
          initialPrice={product.price}
          initialDescription={product.description}
          initialImages={product.images}
          initialCategoryId={product.category.id}
          error={actionError}
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
