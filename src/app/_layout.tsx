import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="category/[id]" options={{ title: 'Categoría' }} />
      <Stack.Screen name="product/[id]" options={{ title: 'Detalle' }} />
      <Stack.Screen name="product/new" options={{ title: 'Nuevo producto' }} />
      <Stack.Screen name="product/edit/[id]" options={{ title: 'Editar producto' }} />
    </Stack>
  );
}
