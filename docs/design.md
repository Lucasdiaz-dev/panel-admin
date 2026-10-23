# UI — panel admin

Fuente visual: `docs/ui-preview.html` (abrirlo). Este archivo es la spec para agentes. No inventar otra estética.

## Qué copiar y qué no

Copiar: fondo blanco, pozos grises, botones circulares 40px, chips de categoría, cards con foto + badge, precio grande, CTA negro full-width redondeado, tab bar de 2 ítems.

No copiar: promo, favoritos, carrito, acentos de color, sombras tintadas, glass, gradients. UI en blanco y negro. **Las fotos van a color.**

## Tokens

Usar solo `src/constants/colors.ts` (actualizarlo a esto si aún tiene teal/verde):

| Key | Hex | Uso |
|---|---|---|
| `background` | `#FFFFFF` | pantalla |
| `surface` | `#F3F3F3` | search, chips, inputs, thumbs vacíos, tab activa |
| `text` | `#111111` | títulos, precio, CTA fill |
| `textMuted` | `#8A8A8A` | captions, labels, tab inactiva |
| `border` | `#ECECEC` | divisores, pills outline |
| `inverse` | `#FFFFFF` | texto sobre CTA / chip activo / badge |
| `placeholder` | `#F3F3F3` | imagen rota |

Sin `primary` de color. Sin `danger` rojo: eliminar es pill outline negro o texto `text`. “Mío” = badge negro, no verde.

Radios: 12 / 16 (chips, inputs) / 22 (cards) / 28 (hero) / 999 (pills, CTA, icon buttons).

Espaciado: 8, 12, 16, 24. Padding de pantalla 16.

Tipo: system / el de Expo. Weights 400–700. Labels 11 uppercase + letterSpacing. Precio tabular. Título de marca “PANEL” 18, tracking amplio, uppercase.

Estilos: solo `StyleSheet.create`. Nada de `className` ni `style={{ flex: 1 }}` suelto.

## Pantallas (rutas ya existentes)

- `(tabs)/index` — lista: header (menú circular, wordmark, + circular), search pill, chips horizontales (activa = fill negro), switch “Sólo míos”, grilla 2 cols, tab bar Productos | Categorías.
- `product/[id]` — back circular, título truncado, carrusel (foto grande + peek laterales), precio 24, título 20, pills, bloque Detalle, CTA inferior.
- `product/new` y `product/edit/[id]` — mismo form: preview de imagen, campos en pozos grises, categoría en pills, CTA “Guardar producto”. Edit: CTA extra outline “Eliminar” solo si el título tiene el prefijo del grupo. El form no muestra ni pide el prefijo.
- `(tabs)/categories` — grilla 2 cols imagen + nombre.
- `category/[id]` — misma grilla que la lista, filtrada, header con back.

Editar / Eliminar solo si `product.title` empieza con el prefijo de `src/constants/group.ts`. Si no es mío, detalle es lectura + CTA “Ver categoría”.

## Componentes

Mapear el HTML a: `ProductCard`, `Filters`, `ProductForm`, `ErrorMessage`, `Loading`. Imagen URL: `onError` → placeholder `surface`, no crash.

Estados: loading = skeletons en forma de cards (no spinner genérico). Vacío = copy corto + CTA. Error HTTP = `message` del body. Sin red = copy de conexión + Reintentar (`ErrorMessage`).

## Copy

Textos de UI en español. Identificadores en inglés.
