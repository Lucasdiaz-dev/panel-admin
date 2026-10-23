# Reglas para agentes — panel-admin

Leé este archivo antes de escribir o editar código. Estas reglas pisan tu training data.

**Nombres en código (archivos nuevos, carpetas nuevas, variables, funciones, tipos, props): inglés.**  
**Textos que ve el usuario: español.**  
**Comentarios: español, una línea, solo si explican un porqué que el código no dice.** Nada de narrar lo obvio. Si el nombre ya explica, no comentes.

---

## Expo (SDK 58)

No confíes en APIs de Expo/RN de memoria. Esta app es Expo SDK 58 + Expo Router.

1. Leé el major de `expo` en `package.json`.
2. Docs: `https://docs.expo.dev/versions/v58.0.0/`
3. Índice: `https://docs.expo.dev/llms.txt` — seguí links, no respondas de memoria.

```bash
npx expo install <package>   # nunca npm/yarn/pnpm/bun add para libs de Expo/nativas
npx expo start
npx expo lint
npx tsc --noEmit
```

- Las rutas viven en `src/app/`. Cada archivo ahí es pantalla; los `_layout.tsx` son navigators. El resto del código va **fuera** de `src/app/`.
- `Link`, `router` y `useLocalSearchParams` salen de `expo-router`.
- `useFocusEffect` sale de `@react-navigation/native`, no de `expo-router`.
- No crees ni edites `ios/` ni `android/`. Lo nativo se configura en `app.json`.
- Nos quedamos en Expo Go: no agregues librerías con código nativo propio.

---

## Consigna

### Estructura congelada

No inventes carpetas (`features/`, `hooks/api/`, `store/`, ni services adentro de `app/`).

```
src/app/           solo pantallas y layouts
src/components/
src/services/
src/types/
src/constants/
docs/ia.md
```

No renombres archivos de `src/app/`. No agregues dependencias sin el tech lead.

### Datos y API

- Pantallas, componentes y hooks no llaman `fetch` ni axios. Todo HTTP pasa por `src/services/`.
- GET producto: tipo `Product` (trae `category` objeto). Body de POST/PUT: tipo `ProductInput` con `categoryId: number`. Nunca mandes el objeto `category`.
- Después de alta / edición / baja, no parches arrays locales (`push`, `filter`, `map` como si persistieran). Volvé a pedir a la API.
- `useFocusEffect` para refetch en **lista y detalle**. No lo uses en el formulario de alta/edición (borra el draft).
- `useState` para la página que acabás de pedir **sí va**. Eso no es un store local.
- Si cambia cualquier filtro (texto, categoría, “Sólo míos”), paginación a offset `0` y **reemplazá** la lista. No concatenes la página nueva sobre resultados del filtro anterior.
- El prefijo del grupo está en `src/constants/group.ts`. El form no lo muestra ni lo pide. `services/` lo antepone en POST/PUT **solo si el título aún no lo tiene**.
- Editar / Eliminar solo si `product.title` empieza con ese prefijo.
- Error HTTP: si el body trae `message`, mostrá esa cadena. Nunca un `"Error"` genérico.
- Modo avión / sin red no es un 400: mensaje de conexión y botón Reintentar (`ErrorMessage`).

### Navegación y UI

- UI: leé `docs/design.md` y mirá `docs/ui-preview.html` antes de tocar estilos o pantallas. No inventes otra paleta ni layout.
- Por la ruta viaja **solo el id (string)**. Nunca `JSON.stringify` de un producto o categoría.
- Estilos: solo `StyleSheet.create`. `style={[styles.card, isMine && styles.mine]}` sí. `style={{ flex: 1 }}` no. Nada de `className`. Colores solo desde `src/constants/`.
- Las imágenes son URLs. Si fallan, placeholder; no crashear.

### Docs

Si un prompt o un error de la IA importa para el README, agregalo en `docs/ia.md` en el mismo cambio (prompt + qué falló + el fix).
