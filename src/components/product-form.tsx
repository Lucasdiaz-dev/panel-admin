import { useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SymbolView } from "expo-symbols";

import { colors } from "@/constants/colors";
import { withoutGroupPrefix } from "@/constants/group";
import type { Category } from "@/types/category";
import type { ProductInput } from "@/types/product";

function cleanedCategoryName(name: string): string {
  let cleaned = name.trim();
  const fromIndex = cleaned.toLowerCase().indexOf(" from ");
  if (fromIndex > 0) cleaned = cleaned.slice(0, fromIndex).trim();
  cleaned = cleaned.replace(/[-_][a-z0-9]{4,}$/i, "").trim();
  return cleaned;
}

function isJunkCategoryName(name: string): boolean {
  if (name.length < 3 || name.length > 24) return true;
  if (!/^[A-Za-z]{3,}(?: [A-Za-z]{3,})?$/.test(name)) return true;
  if (/^(updated|new|test|string|category)\b/i.test(name)) return true;
  if (/\b(test|ctg|category)\b/i.test(name)) return true;
  return false;
}

function usableCategories(categories: Category[]): Category[] {
  const byKey = new Map<string, Category>();

  for (const category of categories) {
    const displayName = cleanedCategoryName(category.name);
    if (!displayName || isJunkCategoryName(displayName)) continue;

    const key = displayName.toLowerCase();
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, category);
      continue;
    }

    const currentName = cleanedCategoryName(current.name);
    const currentIsExact = current.name.trim().toLowerCase() === key;
    const nextIsExact = category.name.trim().toLowerCase() === key;

    if (nextIsExact && !currentIsExact) {
      byKey.set(key, category);
      continue;
    }

    if (nextIsExact === currentIsExact) {
      if (displayName.length < currentName.length || category.id < current.id) {
        byKey.set(key, category);
      }
    }
  }

  return [...byKey.values()].sort((a, b) => a.id - b.id);
}

const MIN_TITLE_LENGTH = 3;
const MIN_DESCRIPTION_LENGTH = 10;

type FormField = "title" | "price" | "categoryId" | "description";
type FormErrors = Partial<Record<FormField, string>>;
type ImageErrors = Record<number, string>;

type ImageField = {
  id: number;
  url: string;
};

type FormValues = {
  imageFields: ImageField[];
  title: string;
  price: string;
  categoryId: number | null;
  description: string;
};

type ValidationResult = {
  fields: FormErrors;
  images: ImageErrors;
};

let nextImageFieldId = 0;

function createImageField(url = ""): ImageField {
  nextImageFieldId += 1;
  return { id: nextImageFieldId, url };
}

function toImageFields(urls: string[] | undefined): ImageField[] {
  const filled = (urls ?? []).map((url) => url.trim()).filter(Boolean);
  return filled.length > 0 ? filled.map((url) => createImageField(url)) : [createImageField()];
}

function parsePrice(value: string): number {
  const normalized = value.trim().replace(",", ".");
  return normalized === "" ? NaN : Number(normalized);
}

function validateImages(imageFields: ImageField[]): ImageErrors {
  const errors: ImageErrors = {};
  const hasAnyUrl = imageFields.some((field) => field.url.trim() !== "");

  if (!hasAnyUrl) {
    errors[imageFields[0].id] = "Ingresá al menos una URL de imagen.";
    return errors;
  }

  for (const field of imageFields) {
    const url = field.url.trim();
    if (!url) errors[field.id] = "Completá la URL o quitá este campo.";
    else if (!/^https:\/\/\S+$/i.test(url)) errors[field.id] = "La URL tiene que empezar con https://.";
  }

  return errors;
}

function validate(values: FormValues): ValidationResult {
  const errors: FormErrors = {};
  const title = values.title.trim();
  const description = values.description.trim();
  const price = parsePrice(values.price);

  if (!title) errors.title = "El título es obligatorio.";
  else if (title.length < MIN_TITLE_LENGTH) errors.title = `El título debe tener al menos ${MIN_TITLE_LENGTH} caracteres.`;

  if (values.price.trim() === "") errors.price = "El precio es obligatorio.";
  else if (!Number.isFinite(price)) errors.price = "El precio tiene que ser un número.";
  else if (price < 0) errors.price = "El precio no puede ser negativo.";

  if (values.categoryId == null) errors.categoryId = "Elegí una categoría.";

  if (!description) errors.description = "La descripción es obligatoria.";
  else if (description.length < MIN_DESCRIPTION_LENGTH) {
    errors.description = `La descripción debe tener al menos ${MIN_DESCRIPTION_LENGTH} caracteres.`;
  }

  return { fields: errors, images: validateImages(values.imageFields) };
}

type ProductFormProps = {
  categories: Category[];
  onSubmit: (input: ProductInput) => void;
  submitting?: boolean;
  onDelete?: () => void;
  deleting?: boolean;
  initialTitle?: string;
  initialPrice?: number;
  initialDescription?: string;
  initialImages?: string[];
  initialCategoryId?: number;
  error?: string | null;
};

export function ProductForm({
  categories,
  onSubmit,
  submitting = false,
  onDelete,
  deleting = false,
  initialTitle,
  initialPrice,
  initialDescription,
  initialImages,
  initialCategoryId,
  error,
}: ProductFormProps) {
  const [imageFields, setImageFields] = useState<ImageField[]>(() => toImageFields(initialImages));
  const [title, setTitle] = useState(
    initialTitle != null ? withoutGroupPrefix(initialTitle) : "",
  );
  const [price, setPrice] = useState(
    initialPrice != null ? String(initialPrice) : "",
  );
  const [description, setDescription] = useState(initialDescription ?? "");
  const [categoryId, setCategoryId] = useState<number | null>(
    initialCategoryId ?? null,
  );
  const [imageFailed, setImageFailed] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [imageErrors, setImageErrors] = useState<ImageErrors>({});
  const [didHydrate, setDidHydrate] = useState(initialCategoryId != null);
  const [keyboardPad, setKeyboardPad] = useState(0);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const descriptionFieldRef = useRef<ComponentRef<typeof View>>(null);
  const descriptionFocused = useRef(false);
  const scrollY = useRef(0);

  const previewUrl = imageFields.map((field) => field.url.trim()).find(Boolean) ?? "";

  useEffect(() => {
    setImageFailed(false);
  }, [previewUrl]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardPad(event.endCoordinates.height);
      if (!descriptionFocused.current) return;
      const keyboardTop = event.endCoordinates.screenY;
      setTimeout(() => {
        descriptionFieldRef.current?.measureInWindow((_x: number, y: number, _w: number, h: number) => {
          const overflow = y + h + 16 - keyboardTop;
          if (overflow <= 0) return;
          scrollRef.current?.scrollTo({
            y: scrollY.current + overflow,
            animated: true,
          });
        });
      }, 50);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardPad(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (didHydrate) return;
    if (initialCategoryId == null && initialTitle == null) return;
    setTitle(initialTitle != null ? withoutGroupPrefix(initialTitle) : "");
    setPrice(initialPrice != null ? String(initialPrice) : "");
    setDescription(initialDescription ?? "");
    setImageFields(toImageFields(initialImages));
    setCategoryId(initialCategoryId ?? null);
    setDidHydrate(true);
  }, [
    didHydrate,
    initialTitle,
    initialPrice,
    initialDescription,
    initialImages,
    initialCategoryId,
  ]);

  const visibleCategories = useMemo(
    () => usableCategories(categories),
    [categories],
  );

  useEffect(() => {
    if (categoryId != null) return;
    if (visibleCategories.length === 0) return;
    setCategoryId(visibleCategories[0].id);
  }, [visibleCategories, categoryId]);

  const showPreview = previewUrl.length > 0 && !imageFailed;
  const canRemoveImage = imageFields.length > 1;

  const busy = submitting || deleting;
  const hasCategories = visibleCategories.length > 0;
  const saveDisabled = busy || !hasCategories;

  function clearFieldError(field: FormField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const { [field]: _removed, ...rest } = current;
      return rest;
    });
  }

  function clearImageError(id: number) {
    setImageErrors((current) => {
      if (!current[id]) return current;
      const { [id]: _removed, ...rest } = current;
      return rest;
    });
  }

  function changeImageUrl(id: number, url: string) {
    setImageFields((current) => current.map((field) => (field.id === id ? { ...field, url } : field)));
    clearImageError(id);
  }

  function addImageField() {
    setImageFields((current) => [...current, createImageField()]);
  }

  function removeImageField(id: number) {
    setImageFields((current) => (current.length > 1 ? current.filter((field) => field.id !== id) : current));
    clearImageError(id);
  }

  function handleSave() {
    if (saveDisabled) return;
    const errors = validate({ imageFields, title, price, categoryId, description });
    setFieldErrors(errors.fields);
    setImageErrors(errors.images);
    if (Object.keys(errors.fields).length > 0 || Object.keys(errors.images).length > 0) return;
    if (categoryId == null) return;
    onSubmit({
      title: title.trim(),
      price: parsePrice(price),
      description: description.trim(),
      categoryId,
      images: imageFields.map((field) => field.url.trim()),
    });
  }

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scroll}
      contentContainerStyle={[styles.content, { paddingBottom: 24 + keyboardPad }]}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onScroll={(event) => {
        scrollY.current = event.nativeEvent.contentOffset.y;
      }}
      scrollEventThrottle={16}
    >
      <View style={styles.preview}>
        {showPreview ? (
          <Image
            source={{ uri: previewUrl }}
            style={styles.previewImage}
            resizeMode="cover"
            onError={() => setImageFailed(true)}
          />
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Imágenes</Text>
        {imageFields.map((field, index) => (
          <View key={field.id} style={styles.imageField}>
            <View style={styles.imageRow}>
              <TextInput
                value={field.url}
                onChangeText={(value) => changeImageUrl(field.id, value)}
                style={[styles.input, styles.imageInput, imageErrors[field.id] && styles.inputInvalid]}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="https://..."
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={`URL de imagen ${index + 1}`}
              />
              <Pressable
                onPress={() => removeImageField(field.id)}
                disabled={!canRemoveImage}
                accessibilityRole="button"
                accessibilityLabel={`Quitar URL de imagen ${index + 1}`}
                accessibilityState={{ disabled: !canRemoveImage }}
                style={[styles.removeButton, !canRemoveImage && styles.removeButtonDisabled]}
              >
                <SymbolView
                  name={{ ios: "xmark", android: "close", web: "close" }}
                  size={14}
                  tintColor={colors.text}
                />
              </Pressable>
            </View>
            {imageErrors[field.id] ? <Text style={styles.fieldError}>{imageErrors[field.id]}</Text> : null}
          </View>
        ))}
        <Pressable
          onPress={addImageField}
          accessibilityRole="button"
          style={({ pressed }) => [styles.addImageButton, pressed && styles.addImageButtonPressed]}
        >
          <Text style={styles.addImageText}>+ Agregar URL</Text>
        </Pressable>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          value={title}
          onChangeText={(value) => {
            setTitle(value);
            clearFieldError("title");
          }}
          style={[styles.input, fieldErrors.title && styles.inputInvalid]}
          placeholderTextColor={colors.textMuted}
        />
        {fieldErrors.title ? <Text style={styles.fieldError}>{fieldErrors.title}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Precio</Text>
        <TextInput
          value={price}
          onChangeText={(value) => {
            setPrice(value);
            clearFieldError("price");
          }}
          style={[styles.input, fieldErrors.price && styles.inputInvalid]}
          keyboardType="decimal-pad"
          placeholderTextColor={colors.textMuted}
        />
        {fieldErrors.price ? <Text style={styles.fieldError}>{fieldErrors.price}</Text> : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.pills}>
          {visibleCategories.map((category) => {
            const selected = category.id === categoryId;
            return (
              <Pressable
                key={category.id}
                onPress={() => {
                  setCategoryId(category.id);
                  clearFieldError("categoryId");
                }}
                style={[
                  styles.pill,
                  selected ? styles.pillSelected : styles.pillOutline,
                ]}
              >
                <Text
                  style={[styles.pillText, selected && styles.pillTextSelected]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {cleanedCategoryName(category.name)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {!hasCategories ? (
          <Text style={styles.fieldError}>
            No hay categorías disponibles. Sin una categoría no se puede guardar el producto.
          </Text>
        ) : null}
        {fieldErrors.categoryId ? <Text style={styles.fieldError}>{fieldErrors.categoryId}</Text> : null}
      </View>

      <View ref={descriptionFieldRef} style={styles.field} collapsable={false}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          value={description}
          onChangeText={(value) => {
            setDescription(value);
            clearFieldError("description");
          }}
          style={[styles.input, styles.area, fieldErrors.description && styles.inputInvalid]}
          multiline
          textAlignVertical="top"
          placeholderTextColor={colors.textMuted}
          onFocus={() => {
            descriptionFocused.current = true;
          }}
          onBlur={() => {
            descriptionFocused.current = false;
          }}
        />
        {fieldErrors.description ? <Text style={styles.fieldError}>{fieldErrors.description}</Text> : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable
        style={[styles.cta, saveDisabled && styles.ctaDisabled]}
        onPress={handleSave}
        disabled={saveDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: saveDisabled, busy: submitting }}
      >
        <View style={styles.ctaContent}>
          {submitting ? <ActivityIndicator size="small" color={colors.inverse} /> : null}
          <Text style={styles.ctaText}>{submitting ? "Guardando..." : "Guardar producto"}</Text>
        </View>
      </Pressable>

      {onDelete ? (
        <Pressable
          style={[styles.ctaGhost, busy && styles.ctaDisabled]}
          onPress={onDelete}
          disabled={busy}
          accessibilityRole="button"
          accessibilityState={{ disabled: busy, busy: deleting }}
        >
          <View style={styles.ctaContent}>
            {deleting ? <ActivityIndicator size="small" color={colors.text} /> : null}
            <Text style={styles.ctaGhostText}>{deleting ? "Eliminando..." : "Eliminar"}</Text>
          </View>
        </Pressable>
      ) : null}
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
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.32,
    textTransform: "uppercase",
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  area: {
    minHeight: 88,
  },
  imageField: {
    gap: 8,
  },
  imageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  imageInput: {
    flex: 1,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonDisabled: {
    opacity: 0.4,
  },
  addImageButton: {
    alignSelf: "flex-start",
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: "center",
  },
  addImageButtonPressed: {
    opacity: 0.65,
  },
  addImageText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.44,
    textTransform: "uppercase",
    color: colors.text,
  },
  inputInvalid: {
    borderWidth: 1,
    borderColor: colors.text,
  },
  fieldError: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    height: 28,
    maxWidth: 160,
    paddingHorizontal: 12,
    borderRadius: 999,
    justifyContent: "center",
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
    fontWeight: "600",
    letterSpacing: 0.44,
    textTransform: "uppercase",
    color: colors.text,
  },
  pillTextSelected: {
    color: colors.inverse,
  },
  error: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  cta: {
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  ctaDisabled: {
    opacity: 0.5,
  },
  ctaContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1.12,
    textTransform: "uppercase",
    color: colors.inverse,
  },
  ctaGhost: {
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaGhostText: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1.12,
    textTransform: "uppercase",
    color: colors.text,
  },
});
