# Flamingo Brunch & Food — web

Landing de una sola página para Flamingo Brunch & Food (Pl. de España 3, Elche).
HTML + CSS + JS sin build: se sube tal cual a cualquier hosting.

Se ve igual abriéndolo con doble clic (`file://`) que servido por HTTP. Si quieres
comprobarlo sobre servidor: `python -m http.server` y abrir `http://localhost:8000`.

## Estructura de la página

La página está montada sobre **una sola primitiva (`.card`) y una rejilla de 12
columnas (`.bento`)**. Cada sección coloca sus piezas con `grid-column` /
`grid-row` explícitos, así que el orden del HTML es el orden de lectura y el
responsive solo tiene que recolocar, nunca reordenar el marcado.

| # | Sección | Qué hace |
|---|---------|----------|
| 1 | Hero | Bloque de marca + tarjeta de vídeo alta + tres fichas cortas: dónde, si está abierto y qué se come |
| 2 | El local | Tarjeta negra con el relato y tres miniaturas, foto grande y tarjeta de claim |
| 3 | Es tu sitio si… | Cuatro razones en las esquinas y la tarjeta rosa destacada en el centro |
| 4 | La carta | Tarjeta ancha con las pestañas y un panel interior que sobresale por abajo |
| 5 | Lo más pedido | Lista de los cinco de siempre con su precio real, sacada de `MENU` |
| 6 | Momentos | Bento de seis fotos y vídeos del local |
| 7 | Las paredes hablan | Bocadillos alternados con los carteles del local + la nota de Google |
| 8 | Visítanos | Formulario que abre WhatsApp, cuatro fichas de contacto y el mapa |
| 9 | Preguntas | Acordeón + foto de los carteles |
| — | Pie | Marca, redes, dos columnas de enlaces y el claim |

## Ficheros

```
index.html          Marcado + SEO (JSON-LD de Restaurant)
css/style.css       Tokens, tarjetas, rejillas y secciones (índice numerado arriba)
js/main.js          Tinta SVG, carta, acordeón, formulario y animaciones
assets/img          Fotos del local y pósters de los vídeos
assets/video        Reels (mp4, sin sonido, en bucle)
assets/fonts        Cooper Black (woff2 + woff)
robots.txt          Reglas de rastreo + ruta del sitemap
sitemap.xml         Sitemap con las imágenes principales
_fuentes/           Material original (fotos sin recortar, vídeos sin comprimir,
                    la referencia de estructura). No se publica: está en robots.txt.
```

Librerías por CDN (GSAP 3.12 + ScrollTrigger, Lenis). **Son opcionales**: si el CDN
no responde, la carta se pinta igual, las pestañas cambian, el acordeón abre y el
formulario envía. Solo se pierden las animaciones de entrada y el scroll suave.

## Lenguaje visual

Todo sale de las fotos del propio local, no de una plantilla:

- **Color.** `--rose` (#C2798A) es el rosa polvo de los carteles que ellos mismos
  publican; `--blush` es el rosa de la fachada; `--ink` es el negro de la
  carpintería y el rótulo; `--spray` es el fucsia de las pintadas del baño.
  Todo en `:root` de `css/style.css`.
- **Tipografía.** Dos registros, los dos suyos. El elegante empareja una cursiva
  de contraste alto (**Bodoni Moda**, en `<em>`) con un palo seco en caja alta
  (**Jost**) — que es exactamente el lockup de sus posts. El callejero es
  **Cooper Black** (`<span class="coop">`) y rotulador (`<span class="mark">`),
  que es lo que hay pintado en las paredes.
- **Forma.** Tarjetas redondeadas (`--r-xl` … `--r-sm`), que es lo que pedía la
  referencia de estructura guardada en `_fuentes/referencia-estructura.jpg`.

## Editar lo habitual

- **Carta**: array `MENU` al principio del bloque 4 de `js/main.js`. Cada plato es
  `{ n: nombre, d: descripción, p: 'precio', tag: 'top' | 'nuevo' }` (`tag` opcional).
  De ahí salen también las pestañas, el bloque "Lo más pedido" y el JSON-LD del menú.
- **Lo más pedido**: array `PICK` (bloque 5). Son nombres de platos de `MENU`; si un
  plato desaparece de la carta, desaparece de aquí en vez de quedarse colgado.
- **Preguntas**: se escriben en el HTML. El `FAQPage` de schema.org se genera leyendo
  el propio acordeón, así que no hay que tocarlo dos veces.
- **Horario**: en tres sitios que deben decir lo mismo — el JSON-LD del `<head>`, la
  ficha "Cuándo" y los `data-open` / `data-close` del `#status`, que es de donde sale
  el "Abierto ahora / Cerramos pronto / Cerrado por hoy".
- **Teléfono de reservas**: constante `TEL` del bloque 8 de `js/main.js` (formato
  internacional sin `+`), además de los `tel:` del HTML.
- **Textos, dirección y enlaces**: directamente en `index.html`.
- **Fotos y vídeos**: sustituir los archivos de `assets/` manteniendo el nombre.

## Detalles que conviene no romper

- **Los trazos de tinta** (botones, subrayados, tachones, anillos de precio y de
  pestaña) se generan en JS a partir de un superelipse con una ondulación
  determinista: misma semilla, mismo gesto, así que no hay dos iguales pero sí son
  iguales entre recargas. Para cambiar el carácter: la amplitud de `trace()` (más
  alto = más tembloroso) y el exponente `3.6` de `point()` (más alto = más recto).
- **Ningún trazo usa `vector-effect: non-scaling-stroke`.** Con él, el patrón de
  guiones se mide en pantalla y deja de casar con `pathLength`, y la animación de
  dibujado se rompe. El grosor va en unidades del viewBox, calibrado por contexto.
- **`stroke-dasharray` va a `100 101`, no a `100`.** Un solo valor significa "raya
  100 / hueco 100": con el offset a 100 el trazo cae justo en la costura del patrón
  y el remate redondo asoma como un puntito suelto al lado de cada precio y de cada
  pestaña. La unidad de holgura lo evita.
- **Los goterones de los botones caen unos 30 px por debajo.** Por eso `.row` lleva
  `row-gap: 36px`: en línea no molestan, apilados en móvil sí.
- **El acordeón no lleva `height: 0` en el CSS.** Si el JS no llega, los paneles se
  leen abiertos en vez de quedarse recortados a cero; es el JS quien los cierra.
- **Cooper Black va incrustada en base64.** Las fuentes se piden siempre en modo
  CORS y un `@font-face` con `url()` no cargaría al abrir el HTML con doble clic.

## SEO — lo primero al publicar

**Sustituye `https://www.flamingobrunchfood.es` por el dominio real** en tres sitios:
`index.html` (canonical, `og:url`, `og:image`, `twitter:image` y el JSON-LD),
`sitemap.xml` y `robots.txt`. Los schemas de la carta y de las preguntas toman el
dominio del canonical, así que esos no hay que tocarlos.

Después: alta en Google Search Console, enviar el sitemap y enlazar la web desde el
perfil de Google Business y desde la bio de Instagram.

Lo que ya lleva montado:

- Title y meta description para "brunch en Elche", canonical y `robots` con
  `max-image-preview:large`.
- Open Graph y Twitter Card completos, con medidas y `alt` de la imagen.
- JSON-LD en `@graph`: `WebSite`, `WebPage`, `ImageObject` y `Restaurant` con
  dirección, horario, teléfono, valoración (4,2 · 776 reseñas), servicios, `hasMap`,
  `OrderAction` de reparto y perfiles en `sameAs`.
- `Menu` con las 8 secciones y los 48 platos, y `FAQPage` con las 6 preguntas, los
  dos generados desde el propio contenido para que no se desincronicen.
- Un solo `h1`, jerarquía de encabezados correcta y `alt` descriptivo en todas las
  imágenes que aportan información (las decorativas van con `alt=""`).
- `width` y `height` en imágenes y vídeos para no provocar saltos de layout,
  `loading="lazy"` + `decoding="async"`, `preconnect` a fuentes y CDN, `preload` del
  primer póster y `defer` en todos los scripts.
- Enlace para saltar al contenido, foco visible, pestañas con patrón `tablist`
  completo (flechas, Inicio y Fin), acordeón con `aria-expanded` / `aria-controls`,
  menú móvil que cierra con Esc y no deja escapar el foco, y respeto a
  `prefers-reduced-motion`.

## Datos del negocio usados

- Dirección: Pl. de España, 3 — 03201 Elx / Elche (Alicante)
- Teléfono: 607 02 05 54
- Horario: todos los días, 9:00–21:00
- Instagram: [@flamingo.bf](https://www.instagram.com/flamingo.bf/)
- Reparto: Uber Eats, Glovo y Just Eat

## Pendiente

1. **Dominio.** Sustituirlo en `index.html`, `sitemap.xml` y `robots.txt`.
2. **Precios.** Los de la carta salen de las plataformas de reparto y suelen ir por
   encima de los de sala. Confirmarlos con el local antes de publicar.
3. **Horario.** Google y RutaCulinaria dan 9:00–21:00; Enjoty daba 11:00–23:00 entre
   semana y hasta las 02:00 en fin de semana. Está puesto el de Google. Confirmar.
4. **WhatsApp.** El formulario da por hecho que el 607 02 05 54 tiene WhatsApp.
   Si no lo tiene, cambiar `TEL` por el número que sí lo tenga, o sustituir el
   `wa.me` por un `mailto:`.
5. **"Las paredes hablan".** Las tres citas son carteles reales del local, no
   reseñas inventadas. Si el local quiere reseñas de verdad ahí, se cambian los
   `<blockquote>` por reseñas de Google con su nombre y su fecha.
6. Alta en Search Console, enviar el sitemap y enlazar desde Google Business e
   Instagram.
