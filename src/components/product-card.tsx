import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/colors';
import { getDisplayTitle, hasGroupPrefix } from '@/constants/group';
import type { Product } from '@/types/product';

type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

export function ProductCard({ product, onPress }: ProductCardProps) {
  const imageUrl = product.images[0];
  const displayTitle = getDisplayTitle(product.title);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <Pressable
      accessibilityLabel={`Ver ${displayTitle}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.imageContainer}>
        {imageUrl && !imageFailed ? (
          <Image
            accessibilityLabel={`Imagen de ${displayTitle}`}
            contentFit="cover"
            onError={() => setImageFailed(true)}
            source={imageUrl}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}

        {hasGroupPrefix(product.title) ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Mío</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      <Text numberOfLines={1} style={styles.title}>
        {displayTitle}
      </Text>
      <Text numberOfLines={1} style={styles.category}>
        {product.category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    maxWidth: '48%',
  },
  cardPressed: {
    opacity: 0.72,
  },
  imageContainer: {
    aspectRatio: 0.85,
    backgroundColor: colors.placeholder,
    borderRadius: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  placeholder: {
    alignItems: 'center',
    backgroundColor: colors.placeholder,
    flex: 1,
    justifyContent: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: colors.text,
    borderRadius: 999,
    bottom: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    position: 'absolute',
  },
  badgeText: {
    color: colors.inverse,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  price: {
    color: colors.text,
    fontSize: 16,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    marginTop: 10,
  },
  title: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  category: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
});
