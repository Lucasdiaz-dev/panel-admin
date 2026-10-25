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
## Integración visual de categorías

- Prompt: implementar la presentación de categorías según docs/design.md
  y docs/ui-preview.html, con componentes
  compartidos del grupo.
- Implementación: grilla de categorías de dos columnas, colores desde
  colors.ts y uso de ProductCard para los productos por categoría.
  Se integraron Loading y ErrorMessage sin modificar sus archivos.
- Validación: TypeScript sin errores y navegación desde categorías
  hasta seleccionar un producto probada en Expo Go.
- Pendientes: revisar el detalle, que queda en blanco tanto desde
  Productos como desde Categorías, y adaptar los textos de los
  componentes compartidos para categorías.
## Detalle de producto

- Prompt: implementar la segunda pantalla de docs/ui-preview.html en feat/detail, respetar el diseño y mostrar el resultado para validar.
- Implementación: consulta por id, refetch al recuperar foco, carrusel de URLs con placeholder, precio, categoría, descripción desplegable, skeleton y errores con Reintentar. Edición solo para títulos con el prefijo; los demás muestran Ver categoría. La baja queda en el formulario de edición existente.
- Integración: se incorporó origin/main con lista, categorías y formulario del equipo. No se agregaron dependencias.
- Qué falló: el import inicial de useFocusEffect desde @react-navigation/native no compila porque ese paquete no está instalado. Se aplicó la corrección ya documentada por el equipo para Expo Router 58: usar expo-router. AGENTS.md todavía conserva la indicación anterior.
- Qué falló: el navegador integrado bloqueó abrir el HTML local mediante file://. Se leyó su código como referencia; la validación visual debe realizarse sobre la app ejecutándose.
- Validación: ver el resultado de los chequeos en la entrega; la prueba en un teléfono con Expo Go debe completarse antes de abrir el PR.
- Resultado: TypeScript pasó después de integrar main. Lint no se pudo completar: falta configuración y la preparación automática falló por conexión. Expo inició en localhost:8081, pero la automatización del navegador agotó el tiempo de espera; no se confirmó visualmente ni en Expo Go.
