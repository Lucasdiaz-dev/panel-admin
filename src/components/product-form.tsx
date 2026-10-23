import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '@/constants/colors';

const DUMMY_CATEGORIES = ['Ropa', 'Tech', 'Casa', 'Otros'] as const;

export function ProductForm() {
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(DUMMY_CATEGORIES[0]);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const trimmedUrl = imageUrl.trim();
  const showPreview = trimmedUrl.length > 0 && !imageFailed;

  function handleSave() {
    console.log({
      imageUrl: trimmedUrl,
      title,
      price,
      description,
      category: selectedCategory,
    });
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.preview}>
        {showPreview ? (
          <Image
            source={{ uri: trimmedUrl }}
            style={styles.previewImage}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Imagen</Text>
        <TextInput
          value={imageUrl}
          onChangeText={setImageUrl}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Precio</Text>
        <TextInput
          value={price}
          onChangeText={setPrice}
          style={styles.input}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.pills}>
          {DUMMY_CATEGORIES.map((name) => {
            const selected = name === selectedCategory;
            return (
              <Pressable
                key={name}
                onPress={() => setSelectedCategory(name)}
                style={[styles.pill, selected ? styles.pillSelected : styles.pillOutline]}
              >
                <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{name}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.area]}
          multiline
          textAlignVertical="top"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <Pressable style={styles.cta} onPress={handleSave}>
        <Text style={styles.ctaText}>Guardar producto</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 24,
  },
  preview: {
    height: 120,
    borderRadius: 22,
    backgroundColor: colors.placeholder,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.32,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  area: {
    minHeight: 88,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 999,
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: colors.text,
  },
  pillOutline: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.44,
    textTransform: 'uppercase',
    color: colors.text,
  },
  pillTextSelected: {
    color: colors.inverse,
  },
  cta: {
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.12,
    textTransform: 'uppercase',
    color: colors.inverse,
  },
});
