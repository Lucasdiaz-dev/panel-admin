# Uso de IA

## Caso 1 - `useFocusEffect` en Expo SDK 58

**Prompt relevante:** implementar la lista de productos con recarga al recuperar el foco, respetando las reglas de `AGENTS.md`.

**Qué falló:** se importó `useFocusEffect` desde `@react-navigation/native`, como indicaba la regla local. En Expo Router 58 ese paquete creó un contexto de navegación separado y la aplicación mostró `Couldn't find a navigation object`.

**Corrección:** se verificó la implementación incluida en Expo Router 58, se cambió el import a `expo-router` y se eliminó la dependencia externa para usar el mismo contexto de navegación que las rutas.

## Caso 2 - Reintento de carga

**Prompt relevante:** agregar un estado de error con un botón para volver a solicitar los productos.

**Qué falló:** el botón `Reintentar` solo incrementaba un estado auxiliar y dependía de que `useFocusEffect` volviera a ejecutar la petición. Al recuperar la conexión, el botón no iniciaba una solicitud nueva.

**Corrección:** se extrajo la carga a una función compartida que se usa tanto al enfocar la pantalla como al pulsar `Reintentar`. También se agregó un identificador para ignorar respuestas de solicitudes anteriores.

## Caso 3 - Categorías sucias en el formulario

**Prompt relevante:** hidratar las pills de categoría del formulario con `getCategories()` y el tipo `Category` de la API.

**Qué falló:** el endpoint público devuelve decenas de nombres vacíos, clones del tipo `Electronics from Config-<uuid>` y sufijos aleatorios (`Furniture-xxxx`). Las pills se volvieron ilegibles y el POST podía quedar atado a un `categoryId` de prueba.

**Corrección:** se normalizó el nombre (recortar ` from …` y sufijos tipo hash), se descartaron vacíos y nombres genéricos de test, y se deduplicó por clave dejando el id canónico. El texto de la pill usa el nombre limpio; el body sigue mandando `categoryId`.

## Caso 4 - Teclado tapando la descripción

**Prompt relevante:** en el formulario, cerrar el teclado al hacer scroll y mantener visible el campo enfocado.

**Qué falló:** `automaticallyAdjustKeyboardInsets` solo asomaba el borde del `TextInput` multiline. Envolver con `KeyboardAvoidingView` subía el CTA “Guardar producto”, en contra del layout del mock (el botón vive al final del form).

**Corrección:** el CTA se dejó en el `ScrollView`. Al abrir el teclado se agrega padding inferior y, si el foco está en Descripción, se mide el bloque y se scrollea hasta que el campo completo quede por encima del teclado. `keyboardDismissMode="on-drag"` cierra el teclado al arrastrar.

## Pantallas de categorías

- Prompt: implementar categorías y productos por categoría con código sencillo,
  servicios existentes y navegación por id.
- Error de la IA: indicó importar useFocusEffect desde
  @react-navigation/native siguiendo una regla desactualizada de AGENTS.md.
  Primero faltaba el módulo y, al instalarlo, falló el contexto de navegación.
- Corrección: importar useFocusEffect desde expo-router para SDK 58,
  retirar la dependencia innecesaria.
