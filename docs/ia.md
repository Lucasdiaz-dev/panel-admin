# Uso de IA

## Caso 1 - `useFocusEffect` en Expo SDK 58

**Prompt relevante:** implementar la lista de productos con recarga al recuperar el foco, respetando las reglas de `AGENTS.md`.

**Qué falló:** se importó `useFocusEffect` desde `@react-navigation/native`, como indicaba la regla local. En Expo Router 58 ese paquete creó un contexto de navegación separado y la aplicación mostró `Couldn't find a navigation object`.

**Corrección:** se verificó la implementación incluida en Expo Router 58, se cambió el import a `expo-router` y se eliminó la dependencia externa para usar el mismo contexto de navegación que las rutas.
