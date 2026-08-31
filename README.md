# Flamingo Brunch & Food — web

Landing de una sola página para Flamingo Brunch & Food (Pl. de España 3, Elche).
HTML + CSS + JS sin build: se sube tal cual a cualquier hosting.

Abriéndolo con doble clic (`file://`) también se ve bien, pero el navegador no deja
usar los vídeos como textura WebGL desde el disco: en ese caso el mural del hero se
pinta con CSS en vez de con el shader. Para verlo tal cual quedará publicado, sirve
la carpeta por HTTP, por ejemplo con `python -m http.server` y abriendo
`http://localhost:8000`.

## Estructura

```
index.html          Todo el marcado + datos SEO (JSON-LD de Restaurant)
css/style.css       Estilos y paleta (variables CSS en :root)
assets/fonts        Cooper Black (woff2 + woff) para los titulares gordos
js/scene.js         Mural three.js del hero: los 3 vídeos virados a rosa
js/main.js          GSAP + ScrollTrigger + Lenis, datos de la carta, aros de los botones
assets/img          Fotos del local y posters de los vídeos
assets/video        Reels (mp4, sin sonido, en bucle)
robots.txt          Reglas de rastreo + ruta del sitemap
sitemap.xml         Sitemap con las imágenes principales
```

Librerías por CDN (three.js r160, GSAP 3.12 + ScrollTrigger, Lenis). Requiere conexión.

## Editar lo habitual

- **Carta**: array `MENU` al principio de `js/main.js`. Cada plato es
  `{ n: nombre, d: descripción, p: 'precio', tag: 'top' | 'nuevo' }` (`tag` es opcional).
- **Colores**: variables en `:root` de `css/style.css` (azulejo, rosa de fachada, fucsia
  de las pintadas) y los uniforms `uBase` / `uPink` / `uSpray` de `js/scene.js`.
- **Botones**: el contorno no es un `border-radius`, se traza en `js/main.js` a partir de
  un superelipse con una ondulación determinista (`wobble` / `trace`). Cada botón usa una
  semilla distinta, así que no hay dos trazos iguales, pero siempre son los mismos entre
  recargas. Para cambiar el carácter del trazo: la amplitud en las llamadas a `trace()`
  (más alto = más tembloroso) y el exponente `3.6` de `point()` (más alto = más rectangular).
  Estados, imán y goterones se controlan con las variables `--rot`, `--sc`, `--mx`, `--my`,
  `--ink-1`, `--ink-2` y `--bg` del bloque `.btn` en el CSS.

  Nota para tocar los trazos: ninguno usa `vector-effect: non-scaling-stroke`. Con él,
  el patrón de guiones se mide en pantalla y deja de coincidir con `pathLength`, así que
  la animación de dibujado se rompe. El grosor va en unidades del viewBox y está
  calibrado según cuánto se escala cada SVG; si cambias el tamaño de una caja, ajusta
  su `stroke-width`.
- **Brochazos y tachones**: envuelve la palabra en `<span class="paint">` para el
  subrayado de pintura o `<span class="strike">` para el tachón. El trazo se genera
  en `js/main.js` (`swipe` y `slash`), uno distinto por elemento, y se dibuja de un
  extremo a otro al entrar en pantalla.
- **Pestañas de la carta**: patrón de tablist completo — `role`/`aria-selected`,
  tabulación móvil y navegación con flechas, Inicio y Fin. La activa se rodea con un
  anillo de rotulador de dos pasadas.
- **Tarjetas de la carta**: al señalar una entra un papel rosa desde la izquierda, se
  subraya el nombre y se rodea el precio. Todo con el mismo motor de trazo.
- **Momentos**: la tira se arrastra con el ratón y sigue por inercia, la rueda vertical
  la desplaza en horizontal (y suelta el control en los extremos para no secuestrar la
  página), tiene barra de avance trazada a mano y un marco de rotulador sobre el clip
  señalado. Accesible con teclado.
- **Nav**: se esconde al bajar y vuelve al subir, marca con un subrayado la sección en
  la que estás, y el menú móvil cierra con Esc y no deja escapar el foco.
- **Cooper Black**: `<span class="coop">` en la palabra que quieras. Está en la pared,
  en el "brunch" del hero y en el pie.
- **Mural del hero**: los `<video id="v0|v1|v2">` de `.hero__bg` alimentan el shader.
  Cámbialos por otros clips verticales y listo. El viraje se ajusta con `uShadow` /
  `uLight` en `js/scene.js` y el velo que da legibilidad, con `.hero__veil` en el CSS.
- **Textos, dirección, horario y enlaces**: directamente en `index.html`.
  El horario también está duplicado en el bloque JSON-LD del `<head>`.
- **Fotos y vídeos**: sustituir los archivos de `assets/` manteniendo el nombre.

## SEO — lo primero al publicar

**Sustituye `https://www.flamingobrunchfood.es` por el dominio real** en tres sitios:
`index.html` (canonical, `og:url`, `og:image`, `twitter:image` y el bloque JSON-LD),
`sitemap.xml` y `robots.txt`. El schema de la carta toma el dominio del canonical,
así que ese no hay que tocarlo.

Después: dar de alta el dominio en Google Search Console, enviar el sitemap y
enlazar la web desde el perfil de Google Business y desde la bio de Instagram.

Lo que ya lleva montado:

- Title y meta description optimizados para "brunch en Elche", canonical y
  `robots` con `max-image-preview:large`.
- Open Graph y Twitter Card completos, con medidas y `alt` de la imagen.
- JSON-LD en `@graph`: `WebSite`, `WebPage`, `ImageObject` y `Restaurant` con
  dirección, horario, teléfono, valoración (4,2 · 776 reseñas), servicios,
  `hasMap`, `OrderAction` de reparto y perfiles en `sameAs`.
- Schema `Menu` con las 8 secciones y los 48 platos, generado en `js/main.js`
  desde el array `MENU` para que nunca se desincronice de lo que se ve.
- Un solo `h1` (con el nombre completo para lectores de pantalla y buscadores),
  jerarquía de encabezados correcta y `alt` descriptivo en todas las imágenes.
- `width` y `height` en imágenes y vídeos para no provocar saltos de layout,
  `loading="lazy"` + `decoding="async"`, `preconnect` a fuentes y CDN, `preload`
  del primer póster y `defer` en todos los scripts.
- Enlace para saltar al contenido, foco visible y `aria-label` en los controles.
- Vídeos recomprimidos: 3,3 MB → 1,3 MB en total.

## Datos del negocio usados

- Dirección: Pl. de España, 3 — 03201 Elx / Elche (Alicante)
- Teléfono: 607 02 05 54
- Horario: todos los días, 9:00–21:00
- Instagram: [@flamingo.bf](https://www.instagram.com/flamingo.bf/)
- Reparto: Uber Eats, Glovo y Just Eat

Los precios de la carta se tomaron de las plataformas de reparto, por lo que pueden
ser algo superiores a los de sala. Conviene confirmarlos con el local antes de publicar.

## Detalles técnicos

- Sin pantalla de carga y sin cursor personalizado.
- El hero es un tríptico de vídeo pintado por WebGL con duotono rosa, grano y viñeta.
  En pantallas estrechas pasa a una sola columna y los otros dos vídeos ni se descargan.
  Sin WebGL — o al abrirlo desde el disco — `.no-webgl` los muestra a pantalla completa
  con el mismo viraje resuelto en CSS (gris + rosa en `multiply`).
- Cooper Black va incrustada en el CSS en base64: las fuentes se piden siempre en modo
  CORS y un `@font-face` con `url()` no cargaría al abrir el HTML con doble clic.
- Respeta `prefers-reduced-motion`: sin animaciones ni bucle de render.
- La escena WebGL se pausa al ocultar la pestaña y degrada a fondo plano si no hay WebGL.
- Los vídeos solo se cargan y reproducen cuando entran en pantalla.
- Responsive hasta 360 px; menú lateral en móvil.

## Pendiente

1. **Dominio.** Sustituir `https://www.flamingobrunchfood.es` por el real en `index.html`
   (canonical, `og:url`, `og:image`, `twitter:image` y el JSON-LD), `sitemap.xml` y
   `robots.txt`. El schema de la carta lo toma del canonical, ese no se toca.
2. **Precios.** Los de la carta salen de Glovo y suelen ir por encima de los de sala.
   Confirmarlos con el local antes de publicar.
3. **Horario.** Google y RutaCulinaria dan 9:00–21:00; Enjoty daba 11:00–23:00 entre
   semana y hasta las 02:00 en fin de semana. Está puesto el de Google, en la web y en
   el JSON-LD. Confirmar cuál es el bueno.
4. Al terminar, alta en Google Search Console, enviar el sitemap y enlazar la web desde
   el perfil de Google Business y la bio de Instagram.

Para revisar el hero como quedará publicado hay que servirlo por HTTP; con doble clic
el navegador no deja usar los vídeos como textura y cae al modo CSS.
