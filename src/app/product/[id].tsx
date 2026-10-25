import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorMessage } from '@/components/error-message';
import ImageCarousel from '@/components/image-carousel';
import { colors } from '@/constants/colors';
import { getDisplayTitle, hasGroupPrefix } from '@/constants/group';
import { getProduct } from '@/services/products';
import type { Product } from '@/types/product';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setProduct(null);
    setExpanded(true);
    if (typeof id !== 'string' || !/^\d+$/.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 1) {
      setError('El identificador del producto no es válido.');
      setLoading(false);
      return;
    }
    getProduct(Number(id))
      .then(value => { if (active) setProduct(value); })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el producto.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, attempt]));

  const isMine = product ? hasGroupPrefix(product.title) : false;
  const goBack = () => router.canGoBack() ? router.back() : router.replace('/');
  const viewCategory = () => {
    if (product) router.push({ pathname: '/category/[id]', params: { id: String(product.category.id) } });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable accessibilityRole="button" accessibilityLabel="Volver a productos" onPress={goBack} style={styles.iconButton}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.headerTitle}>{product ? getDisplayTitle(product.title) : 'Detalle de producto'}</Text>
        <View style={styles.headerSpacer} />
      </View>
      {loading ? (
        <View accessibilityLabel="Cargando producto" accessibilityState={{ busy: true }} style={styles.content}>
          <View style={styles.skeletonHero} />
          <View style={styles.skeletonPrice} />
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonTitle} />
        </View>
      ) : error ? (
        <ErrorMessage message={error} onRetry={() => setAttempt(value => value + 1)} />
      ) : product ? (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <ImageCarousel key={`${product.id}-${product.updatedAt}`} images={product.images} />
            <View style={styles.content}>
              <Text style={styles.price}>{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD' }).format(product.price)}</Text>
              <Text style={styles.title}>{getDisplayTitle(product.title)}</Text>
              <View style={styles.pills}>
                <View style={styles.badge}><Text style={styles.badgeText}>{isMine ? 'Mío' : 'Sólo lectura'}</Text></View>
                <Pressable accessibilityRole="button" onPress={viewCategory} style={styles.pill}><Text style={styles.pillText}>{product.category.name}</Text></Pressable>
              </View>
              <View style={styles.detail}>
                <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={styles.detailHeader}>
                  <Text style={styles.label}>Detalle</Text><Text style={styles.chevron}>{expanded ? '⌃' : '⌄'}</Text>
                </Pressable>
                {expanded && <>
                  <Text style={styles.description}>{product.description || 'Sin descripción disponible.'}</Text>
                  {!isMine && <Text style={styles.description}>Publicado por otro grupo: solo lectura.</Text>}
                </>}
              </View>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <Pressable accessibilityRole="button" onPress={() => isMine ? router.push({ pathname: '/product/edit/[id]', params: { id: String(product.id) } }) : viewCategory()} style={styles.cta}>
              <Text style={styles.ctaText}>{isMine ? 'Editar producto' : 'Ver categoría'}</Text>
            </Pressable>
          </View>
        </>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingTop: 4, paddingBottom: 12 },
  iconButton: { width: 40, height: 40, borderRadius: 999, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: colors.text, fontSize: 32, lineHeight: 36 },
  headerTitle: { flex: 1, textAlign: 'center', color: colors.text, fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  headerSpacer: { width: 40 },
  scrollContent: { paddingBottom: 24, gap: 16 },
  content: { paddingHorizontal: 16, gap: 16 },
  price: { color: colors.text, fontSize: 24, lineHeight: 32, fontWeight: '600', fontVariant: ['tabular-nums'], letterSpacing: -0.7 },
  title: { color: colors.text, fontSize: 20, lineHeight: 26, fontWeight: '600', letterSpacing: -0.4 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { minHeight: 28, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.text, justifyContent: 'center' },
  badgeText: { color: colors.inverse, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  pill: { minHeight: 28, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' },
  pillText: { color: colors.text, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  detail: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 32 },
  label: { color: colors.text, fontSize: 12, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase' },
  chevron: { color: colors.text, fontSize: 20 },
  description: { color: colors.textMuted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 20 },
  cta: { minHeight: 52, borderRadius: 999, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  ctaText: { color: colors.inverse, fontSize: 14, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  skeletonHero: { height: 280, borderRadius: 28, backgroundColor: colors.surface },
  skeletonPrice: { width: 120, height: 32, borderRadius: 12, backgroundColor: colors.surface },
  skeletonTitle: { height: 24, borderRadius: 12, backgroundColor: colors.surface },
});
