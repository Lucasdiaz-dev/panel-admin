# Uso de IA

## Caso 1 - `useFocusEffect` en Expo SDK 58

**Prompt relevante:** implementar la lista de productos con recarga al recuperar el foco, respetando las reglas de `AGENTS.md`.

**Qué falló:** se importó `useFocusEffect` desde `@react-navigation/native`, como indicaba la regla local. En Expo Router 58 ese paquete creó un contexto de navegación separado y la aplicación mostró `Couldn't find a navigation object`.

**Corrección:** se verificó la implementación incluida en Expo Router 58, se cambió el import a `expo-router` y se eliminó la dependencia externa para usar el mismo contexto de navegación que las rutas.

## Caso 2 - Reintento de carga

**Prompt relevante:** agregar un estado de error con un botón para volver a solicitar los productos.

**Qué falló:** el botón `Reintentar` solo incrementaba un estado auxiliar y dependía de que `useFocusEffect` volviera a ejecutar la petición. Al recuperar la conexión, el botón no iniciaba una solicitud nueva.

**Corrección:** se extrajo la carga a una función compartida que se usa tanto al enfocar la pantalla como al pulsar `Reintentar`. También se agregó un identificador para ignorar respuestas de solicitudes anteriores.
