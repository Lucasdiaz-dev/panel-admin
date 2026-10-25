import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

function CarouselImage({ uri, width, index }: { uri: string; width: number; index: number }) {
  const [failed, setFailed] = useState(false);
  const sizing = StyleSheet.create({ image: { width } });
  return (
    <View style={[styles.image, sizing.image]}>
      {!failed && /^https?:\/\//i.test(uri) ? (
        <Image source={{ uri }} accessibilityLabel={`Foto ${index + 1} del producto`} style={styles.photo} onError={() => setFailed(true)} />
      ) : <Text style={styles.placeholder}>Imagen no disponible</Text>}
    </View>
  );
}

export default function ImageCarousel({ images }: { images: string[] }) {
  const [width, setWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const photos = images.length ? images : [''];
  const imageWidth = Math.max(width - 72, 1);
  const sizing = StyleSheet.create({ item: { width: imageWidth } });
  return (
    <View onLayout={event => setWidth(event.nativeEvent.layout.width)} style={styles.container}>
      {width > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={imageWidth + 8} decelerationRate="fast" contentContainerStyle={styles.track}
        onMomentumScrollEnd={event => setActiveIndex(Math.min(photos.length - 1, Math.round(event.nativeEvent.contentOffset.x / (imageWidth + 8))))}>
        {photos.map((uri, index) => <View key={`${uri}-${index}`} style={sizing.item}><CarouselImage uri={uri} width={imageWidth} index={index} /></View>)}
      </ScrollView>}
      {photos.length > 1 && <Text style={styles.counter}>{activeIndex + 1} / {photos.length}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 280 },
  track: { paddingHorizontal: 36, gap: 8 },
  image: { height: 280, borderRadius: 28, overflow: 'hidden', backgroundColor: colors.placeholder, alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: { color: colors.textMuted, fontSize: 13 },
  counter: { position: 'absolute', bottom: 12, alignSelf: 'center', backgroundColor: colors.background, color: colors.text, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, fontSize: 11 },
});

