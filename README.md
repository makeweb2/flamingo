# Flamingo Brunch & Food — web

Landing de una sola página para Flamingo Brunch & Food (Pl. de España 3, Elche).
HTML + CSS + JS sin build: se sube tal cual a cualquier hosting.

Se ve igual con doble clic (`file://`) que servido por HTTP. Para comprobarlo sobre
servidor: `python -m http.server` y abrir `http://localhost:8000`.

## De dónde sale cada cosa

- **La estructura** sale de `_fuentes/referencia-estructura.jpg`: bloques
  redondeados sobre fondo rosa pálido, alternando piezas rosas y blancas, con los
  titulares en una Didone de caja baja. Las nueve secciones son las de esa
  referencia, en su mismo orden.
- **El color** sale del logo: `#F3CACE`. El fondo es ese mismo rosa aclarado y los
  filos, ese mismo rosa rebajado. El negro `#14100F` es el del logo, y se usa solo
  en el texto y en el botón principal — **no hay bloques negros**, igual que en la
  referencia.
- **La tipografía** son **tres voces con una tarea cada una**:

  | Token | Fuente | Dónde se usa |
  |-------|--------|--------------|
  | `--dis`  | Fraunces | Titulares. Una serif cálida de la familia de la Cooper: al lado no chirrían. |
  | `--coop` | Cooper Black (`COOPBL`) | **Solo donde el texto ES un rótulo**: la marca del nav, las dos frases que son carteles del local ("Please no dancing on tables" y "a.m. coffee — p.m. wine"), las cifras que hacen de señalética (el horario, la nota de Google, los 01–04) y las etiquetas de plato. |
  | `--ui`   | Jost | Texto corriente, etiquetas, pestañas y botones. |

- **El registro es el de la fachada, no el del baño.** La Cooper Black es la letra
  de sus carteles y se queda; lo que no está es el envoltorio callejero: nada de
  espray, ni goteos, ni pintadas, ni manchas trazadas en los botones. Las fotos del
  baño y de los carteles siguen en la galería —son el local— pero como fotografía,
  no como lenguaje de la interfaz.

Reglas que mantienen el conjunto de una pieza: **tres fuentes con su papel, dos
radios (`--r` y `--r-s`) más el círculo y la píldora, una sombra (`--sh`) y un filo
(`--hair`)**. Sin degradados, sin iconos y sin emojis.

## Estructura

| # | Sección | Bloque de la referencia |
|---|---------|-------------------------|
| 1 | Portada | El titular con la foto dentro, y debajo la fila de tres piezas |
| 2 | El local | El bloque con tres miniaturas y el vídeo al lado, y el claim en banda ancha debajo |
| 3 | Café, brunch y repostería | La rejilla 3×2 con la pieza destacada en el centro |
| 4 | La carta | El bloque ancho con el panel interior que sobresale y los puntos |
| 5 | Lo más pedido | El bloque de precios: lista a la izquierda, foto a la derecha |
| 6 | Momentos | La galería de tamaños mezclados |
| 7 | La pared | Franja con el cartel del local en cursiva. Ocupa el sitio del bloque de testimonios de la referencia, pero dice lo mismo en una frase en vez de en cuatro tarjetas |
| 8 | Reserva | El formulario con la rejilla de fichas al lado |
| 9 | Preguntas | El acordeón con la foto al lado |
| — | Pie | La franja rosa con los círculos y las columnas de enlaces |

Se usa **todo el material**: los cuatro reels, las siete fotos del local, los dos
carteles de la marca (`allday.jpg` y `planes.jpg`) y el logo.

## Ficheros

```
index.html          Marcado + SEO (JSON-LD de Restaurant)
css/style.css       Tokens, piezas y secciones (índice numerado arriba)
js/main.js          Carta, acordeón, formulario, nav y entradas
assets/img          Fotos del local, carteles de la marca y pósters de los vídeos
assets/video        Los cuatro reels (mp4, sin sonido, en bucle)
assets/fonts        Cooper Black (woff2 + woff), por si se sirve por HTTP
robots.txt          Reglas de rastreo + ruta del sitemap
sitemap.xml         Sitemap con las imágenes principales
_fuentes/           Material original que no se publica: fotos sin recortar,
                    vídeos sin comprimir, los logos de reparto en crudo, la
                    Cooper Black (ya sin uso) y la referencia de estructura.
                    Excluido en robots.txt.
```

Librerías por CDN (GSAP 3.12 + ScrollTrigger, Lenis). **Son opcionales**: si el CDN
no responde, la carta se pinta, las pestañas cambian, el acordeón abre y el
formulario envía igual. Solo se pierden la entrada y el scroll suave.

## Editar lo habitual

- **Carta**: array `MENU` al principio del bloque 1 de `js/main.js`. Cada plato es
  `{ n: nombre, d: descripción, p: 'precio', tag: 'top' | 'nuevo' }` (`tag` opcional).
  De ahí salen la lista, las pestañas, "lo más pedido" y el JSON-LD del menú.
- **Lo más pedido**: array `PICK` del bloque 2. Son nombres de platos de `MENU`: si
  un plato desaparece de la carta, desaparece de aquí en vez de quedarse colgado.
- **Preguntas**: se escriben en el HTML. El `FAQPage` se genera leyendo el propio
  acordeón, así que no hay que tocarlo dos veces.
- **Teléfono de reservas**: constante `TEL` del bloque 4 (formato internacional sin
  `+`), además de los `tel:` del HTML.
- **Titulares**: se parten por líneas con los `<br>` del HTML y `data-lines`. Van
  enteros en Didone: **no se le pone Cooper a una palabra suelta** (ver abajo).
- **La franja de "la pared"**: la frase está en el HTML de la sección 7. Es el sitio
  donde meter un cartel del local sin montar una sección entera.
- **Fotos y vídeos**: sustituir los archivos de `assets/` manteniendo el nombre.

## Detalles que conviene no romper

- **`.ln` lleva `padding` arriba y margen negativo.** Sin ese respiro, el recorte
  del titular se come la tilde de "día" y el asta de la "b".
- **`.why__it` se coloca con `nth-of-type` 1, 2, 4 y 5.** `nth-of-type` cuenta divs y
  el tercero es la pieza destacada del centro.
- **`.hero__row` fija su altura con `grid-auto-rows`.** Sin ella cada foto impone su
  alto natural y las tres piezas dejan de medir lo mismo.
- **El acordeón no lleva `height:0` en el CSS.** Si el JS no llega, los paneles se
  leen abiertos en vez de recortados a cero; es el JS quien los cierra.
- **`.dis` va con interlineado 1.2 y sin tracking negativo.** El 1.08 y el `-.005em`
  venían de la Bodoni, que es estrecha y de asta fina; Fraunces tiene más ojo y más
  cuerpo, y con esos valores las líneas se tocan.
- **`.dis` usa `opsz` BAJO aunque el cuerpo sea grande.** Fraunces es variable y su
  eje de tamaño óptico es el que manda: subido, la fuente se afina y vuelve a
  parecer una didona fría, que es justo lo que se quería quitar. Va a 18, con
  `SOFT` 100 (remates redondos) y `WONK` 1 (curvas inclinadas).
- **`button{ font:inherit }`.** Los botones no heredan la tipografía: sin esa línea
  el `burger` cae al Arial del navegador y aparece una cuarta fuente.
- **La Cooper no entra en los titulares.** Poner una palabra suelta en Cooper dentro
  de una frase es decoración, no criterio: obliga a elegir cuál, y esa decisión no
  tiene respuesta buena. La regla es que el texto TENGA que ser un rótulo — un
  wordmark, un cartel del local, una cifra de señalética — no que se le ponga un
  acento a lo que sea.
- **Cooper Black va incrustada en base64.** Las fuentes se piden siempre en modo
  CORS y un `@font-face` con `url()` no cargaría al abrir el HTML con doble clic,
  que es como se revisa. Los ficheros sueltos están en `assets/fonts`.
- **`.ln` no está anidada dentro de `.dis`.** El JS la pone en cualquier titular con
  `data-lines`, y el claim del pie no es `.dis`.
- **`.local__ph` lleva `.ph--fill`.** Sus medios van en absoluto para que no
  impongan su alto natural: un reel vertical, si no, estira su columna a 864px y
  deja tres cuartos de bloque en rosa vacío.
- **`.deliv .btn:hover` no puede usar `background:currentColor`.** En `:hover` se
  resolvería contra el color ya cambiado a blanco y el fondo saldría blanco; el
  color de cada servicio va en `--svc`.
- **Los logos de reparto están recortados a mano** (`assets/img/svc-*.png`, 120px).
  Los originales, en `_fuentes/logos/`. El del Just Eat venía con 75px de margen
  transparente y el de Uber Eats con un marco blanco: el script de recorte quita
  primero lo transparente y después el blanco opaco, y cuadra sin deformar. Su
  radio de 7px es la esquina del propio icono, no un radio de interfaz.
- **Cada pastilla de reparto va del color de su logo**, y los tres colores están
  sacados del píxel del propio badge (`#31B466`, `#F1CC38`, `#FB8C00`), no a ojo.
  El rótulo va en negro y no en blanco: contra esos tres, el negro contrasta 7.1,
  12.1 y 8.0, y el blanco 2.7, 1.6 y 2.4.
- **El aviso de `scrollRestoration` va en un `<script>` en línea en el `<head>`.**
  El navegador programa la restauración del scroll muy temprano y desde un script
  con `defer` ya se le avisa tarde: la página abría a media altura al recargar.
  Además hay que subir también el contador propio de Lenis, que si no devuelve la
  página a donde estaba.
- **El nav no lleva el logo en JPEG.** A 34px era un borrón con un cerco claro
  alrededor. El rótulo en Didone, que es el de la fachada, ya es la marca.

## SEO — lo primero al publicar

**Sustituye `https://www.flamingobrunchfood.es` por el dominio real** en tres sitios:
`index.html` (canonical, `og:url`, `og:image`, `twitter:image` y el JSON-LD),
`sitemap.xml` y `robots.txt`. El schema de la carta toma el dominio del canonical.

Después: alta en Google Search Console, enviar el sitemap y enlazar la web desde el
perfil de Google Business y desde la bio de Instagram.

Lo que ya lleva montado:

- Title y meta description para "brunch en Elche", canonical y `robots` con
  `max-image-preview:large`.
- Open Graph y Twitter Card completos, con medidas y `alt` de la imagen.
- JSON-LD en `@graph`: `WebSite`, `WebPage`, `ImageObject` y `Restaurant` con
  dirección, horario, teléfono, valoración (4,2 · 776 reseñas), servicios, `hasMap`,
  `OrderAction` de reparto y perfiles en `sameAs`; más `Menu` con las 8 secciones y
  los 48 platos, generado desde `MENU` para que no se desincronice.
- Un solo `h1`, jerarquía correcta y `alt` descriptivo en las imágenes que aportan
  información (las decorativas van con `alt=""`).
- `width` y `height` en imágenes y vídeo para no provocar saltos de layout,
  `loading="lazy"` + `decoding="async"`, `preconnect` a fuentes y CDN, `preload` del
  póster del hero y `defer` en los scripts.
- Enlace para saltar al contenido, foco visible, pestañas con patrón `tablist`
  completo (flechas, Inicio y Fin), menú móvil que cierra con Esc y no deja escapar
  el foco, y respeto a `prefers-reduced-motion`.

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
4. **WhatsApp.** El formulario da por hecho que el 607 02 05 54 tiene WhatsApp. Si
   no, cambiar `TEL` por el número que sí lo tenga o sustituir el `wa.me` por un
   `mailto:`.
5. **"Se dice por aquí".** Las citas son carteles reales del local, no reseñas
   inventadas. Si el local quiere reseñas de verdad ahí, se cambian los
   `<blockquote>` por reseñas de Google con su nombre y su fecha.
6. Alta en Search Console, enviar el sitemap y enlazar desde Google Business e
   Instagram.
