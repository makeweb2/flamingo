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
- **La tipografía** son **tres voces con una tarea cada una**, y las tres están en
  el local. Si alguna se sale de su papel, la página vuelve a parecer hecha por
  varias personas:

  | Token | Fuente | Dónde se usa |
  |-------|--------|--------------|
  | `--dis`  | Bodoni Moda | Titulares de sección. Es la Didone del rótulo de la puerta y del logo. |
  | `--coop` | Cooper Black (`COOPBL`) | La voz de sus carteles: la marca del nav, **una** palabra por titular, las citas de la pared, las etiquetas de plato, el claim del pie y el rótulo de los botones. |
  | `--ui`   | Jost | Todo el texto corriente y las etiquetas. |

- **Lo urbano** sale de la pared del baño, y está hecho a código en el bloque 0 de
  `js/main.js`: corazones, destellos y aureolas, el brochazo de espray bajo una
  palabra, el subrayado de los enlaces del nav y, sobre todo, **la forma de los
  botones**. Todos los trazos salen del mismo par de funciones con una ondulación
  determinista: misma semilla, mismo gesto, así que ningún trazo repite a otro pero
  todos son iguales entre recargas — y ninguno es una imagen que haya que descargar.

### Los botones y la barra del nav

Los botones no son un `border-radius`: su forma la traza el JS como un tag de la
pared, en tres capas — relleno, contorno y una tercera copia desplazada en fucsia,
que es el doble contorno del grafiti. Al señalarlos el tag se da la vuelta: fucsia
dentro, negro fuera. En el principal la copia va **rellena** (el macizo de un
throw-up); en el secundario va **solo a contorno**, porque un relleno desplazado
inundaría la forma en vez de doblarle el filo.

**Solo se tatúan los botones grandes** — los tres que de verdad piden acción. Un tag
es un gesto; puesto en seis enlaces pequeños seguidos deja de ser un gesto y es
ruido. `.btn--sm` es una pastilla limpia con el rótulo en Cooper y se acabó.

**Y solo gotea el macizo** (`.btn--ink`). Uno de contorno está hueco: no tiene masa
de pintura de la que caiga nada, y ponerle churretes es justo lo que lo hace parecer
un dibujo en vez de un tag.

**Los churretes** son lo que hace que la cosa se lea como pintura y no como adorno,
y tienen cuatro reglas:

1. **La silueta es un HUSO, no un palo con una bola.** `dripPath()` muestrea un
   perfil de ancho: nace con el grosor de la masa de la que sale, **engorda a un
   tercio del recorrido** porque la pintura se acumula, va afinando y acaba en una
   gota más ancha que alta. Sin ese engorde queda un signo de exclamación.
2. **Se desvían de la vertical.** Un reguero perfectamente recto delata que está
   dibujado; el desvío crece con el cuadrado del recorrido.
3. **Contrastan.** En una tanda, uno corre mucho y los demás poco. Si todos miden
   parecido parecen rayas. El azar es determinista (`rnd()`, un hash del seno):
   misma semilla, mismo churrete entre recargas.
4. **Son del color de la masa que tienen encima** (`--drip`). Un botón negro corre
   negro; cuando al señalarlo se vuelve fucsia, corre fucsia. Y el SVG monta sobre
   la mancha, así que la unión no se ve.

**La barra del nav** acaba en una línea de espray trazada a mano, sin churretes: la
pintura que corre se reserva para los botones. Se traza en **píxeles reales** —el
SVG se regenera al cambiar el ancho— y no en un viewBox estirado: con
`preserveAspectRatio="none"` a lo ancho de la pantalla la ondulación se aplanaba
hasta parecer un subrayador y el grosor se disparaba.

Reglas que mantienen el conjunto de una pieza: **tres fuentes con su papel, un solo
fucsia de espray (`--spray`), dos radios (`--r` y `--r-s`) más el círculo y la
píldora, una sombra (`--sh`) y un filo (`--hair`)**. Sin degradados, sin iconos y
sin emojis.

## Estructura

| # | Sección | Bloque de la referencia |
|---|---------|-------------------------|
| 1 | Portada | El titular con la foto dentro, y debajo la fila de tres piezas |
| 2 | El local | El bloque con tres miniaturas y el vídeo al lado, y el claim en banda ancha debajo |
| 3 | Es tu sitio si… | La rejilla 3×2 con la pieza destacada en el centro |
| 4 | La carta | El bloque ancho con el panel interior que sobresale y los puntos |
| 5 | Lo más pedido | El bloque de precios: lista a la izquierda, foto a la derecha |
| 6 | Momentos | La galería de tamaños mezclados |
| 7 | La pared | Franja pintada con el cartel del local. Ocupa el sitio del bloque de testimonios de la referencia, pero dice lo mismo en una frase en vez de en cuatro tarjetas |
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
                    vídeos sin comprimir, la Cooper Black y la referencia de
                    estructura. Excluido en robots.txt.
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
- **Titulares**: se parten por líneas con los `<br>` del HTML y `data-lines`. Para
  que una palabra vaya en Cooper Black, envuélvela en `<span class="coop">`; para
  que lleve el brochazo de espray, en `<span class="spray">`. Una por titular.
- **Pintadas**: `<span class="doodle doodle--heart|--star|--halo">` vacío, más una
  regla de posición en el CSS de esa sección. El SVG lo dibuja el JS.
- **La franja de "la pared"**: la frase está en el HTML de la sección 7. Es el sitio
  donde meter un cartel del local sin montar una sección entera.
- **Fotos y vídeos**: sustituir los archivos de `assets/` manteniendo el nombre.

## Detalles que conviene no romper

- **`.ln` lleva `padding` arriba y margen negativo.** Sin ese respiro, el recorte
  del titular se come la tilde de "día" y el asta de la "b".
- **`.ln` no está anidada dentro de `.dis`.** El JS la pone en cualquier titular con
  `data-lines`, y el claim del pie no es `.dis`.
- **`.why__it` se coloca con `nth-of-type` 1, 2, 4 y 5.** `nth-of-type` cuenta divs y
  el tercero es la pieza destacada del centro.
- **`.hero__row` fija su altura con `grid-auto-rows`.** Sin ella cada foto impone su
  alto natural y las tres piezas dejan de medir lo mismo.
- **`.local__story` ocupa las dos filas.** Si no, la mitad izquierda de la fila de
  abajo se queda vacía.
- **El acordeón no lleva `height:0` en el CSS.** Si el JS no llega, los paneles se
  leen abiertos en vez de recortados a cero; es el JS quien los cierra.
- **`button{ font:inherit }`.** Los botones no heredan la tipografía: sin esa línea
  el `burger` cae al Arial del navegador y aparece una cuarta fuente.
- **El brochazo de `.spray` se pinta en el bloque 7, no en el 0.** `splitLines`
  reconstruye el titular entero, así que decorarlo antes dejaría el SVG y su
  observador colgando de un nodo ya reemplazado.
- **El brochazo lleva tres pasadas.** Una ancha y casi transparente que hace de nube
  de aerosol, el trazo, y una segunda más fina desplazada. Con una sola pasada
  gruesa queda una barra plana, no una pintada.
- **El destello es una astroide (`cos³/sen³`).** Con pétalos de rosa polar salía un
  trébol de cuatro hojas en vez de un brillo.
- **La copia desplazada del botón lleva el desplazamiento metido en el trazado**
  (`ringPath(..., dx, dy)`), no un `transform`: el SVG va estirado con
  `preserveAspectRatio="none"` y un `transform` se deformaría con él.
- **`.btns` separa 30px en horizontal y 38px en vertical.** Las manchas se salen de
  su caja por los cuatro lados y los churretes caen por debajo; con el hueco normal
  los botones se pisaban.
- **La barra del nav se traza en píxeles reales y se regenera al redimensionar.**
  Un viewBox estirado aplana la ondulación y descuadra el grosor.
- **El viewBox de los churretes del botón guarda la proporción de su caja CSS**
  (80:90 y 62:70). Con `preserveAspectRatio` por defecto, si no coincidieran el SVG
  se centraría y los churretes se saldrían de su sitio.
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
- **Los logos van a hueso, sin filo.** Los badges de Glovo y Just Eat comparten
  color con su pastilla, así que se funden y dejan flotando solo su marca. El de
  Uber Eats es un logotipo escrito y ahí se queda su propio texto en pequeño; si
  molesta, se le quita el `<img>` a esa pastilla y se queda solo con el rótulo.
- **El aviso de `scrollRestoration` va en un `<script>` en línea en el `<head>`.**
  El navegador programa la restauración del scroll muy temprano y desde un script
  con `defer` ya se le avisa tarde: la página abría a media altura al recargar.
  Además hay que subir también el contador propio de Lenis, que si no devuelve la
  página a donde estaba.
- **El nav no lleva el logo en JPEG.** A 34px era un borrón con un cerco claro
  alrededor y al lado del rótulo en Cooper cantaba. El rótulo ya es la marca.
- **`stroke-dasharray` va a `100 101`, no a `100`.** Un solo valor significa "raya
  100 / hueco 100": con el offset a 100 el trazo cae justo en la costura del patrón
  y el remate redondo asoma como un puntito suelto.
- **Cooper Black va incrustada en base64.** Las fuentes se piden siempre en modo
  CORS y un `@font-face` con `url()` no cargaría al abrir el HTML con doble clic,
  que es como se revisa. Los ficheros sueltos están en `assets/fonts`.

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
