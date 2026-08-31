# Flamingo Brunch & Food — web

Landing de una sola página para Flamingo Brunch & Food (Pl. de España 3, Elche).
HTML + CSS + JS sin build: se sube tal cual a cualquier hosting.

Se ve igual con doble clic (`file://`) que servido por HTTP. Para comprobarlo sobre
servidor: `python -m http.server` y abrir `http://localhost:8000`.

## El sistema visual

Todo sale de las fotos del local, y el local tiene **tres materiales y nada más**:
pared rosa plana, carpintería negra en retícula y mármol blanco. La web no añade
nada que no esté ahí.

| | |
|---|---|
| **Color** | Dos: `#F3CACE` (el rosa del logo y de la fachada) y `#14100F` (el negro del logo y de la carpintería). Más el blanco del mármol, solo en la carta. Ningún gris nuevo: los tonos intermedios son el negro rebajado. |
| **Tipografía** | Dos: **Bodoni Moda** en caja alta —la Didone del rótulo de la fachada—, y **Jost** ligera para textos pequeños y versalitas. Ninguna más. |
| **Forma** | Esquinas vivas y filos de 1 px. Los filos son la carpintería: no son bordes de cada caja, son el fondo negro de la rejilla asomando por un `gap` de 1 px, así nunca se doblan ni se descuadran al recolocarse. |
| **Prohibido** | Sombras, degradados, esquinas redondeadas, iconos, emojis y cualquier tercera fuente. Si aparece algo de eso, se ha colado. |

**Lo urbano no lo pone una tipografía de grafiti**: lo ponen la foto del baño a
tamaño grande, la franja de rótulo que corre en negro y el titular pegado al filo
de la página.

## Estructura — cuatro secciones

| # | Sección | Qué hace |
|---|---------|----------|
| 1 | Rótulo | El nombre en Didone pegado al filo izquierdo, la entrada a la derecha y la franja de datos debajo. Montado como la fachada. |
| 2 | El local | Cuatro fotos y un texto en la misma retícula que las ventanas. |
| 3 | La carta | Sobre el mármol: fondo blanco, pestañas y precios a la derecha. |
| 4 | Visítanos | Dirección, horario, contacto y mapa. |
| — | Pie | Rosa sobre negro: el centro del logo, a página completa. |

Entre la 1 y la 2 corre la franja de rótulo. Es lo único que se mueve solo.

## Ficheros

```
index.html          Marcado + SEO (JSON-LD de Restaurant)
css/style.css       Tokens, retícula y secciones (índice numerado arriba)
js/main.js          Carta, franja, nav y entradas
assets/img          Las seis imágenes que se usan, ni una más
assets/video        El reel del hero
robots.txt          Reglas de rastreo + ruta del sitemap
sitemap.xml         Sitemap con las imágenes principales
_fuentes/           Material original y lo que no se publica:
                    fotos sin recortar, vídeos sin comprimir, la fuente
                    Cooper Black y `sin-usar/` con las fotos y reels que
                    quedaron fuera. Excluido en robots.txt.
```

Librerías por CDN (GSAP 3.12 + ScrollTrigger, Lenis). **Son opcionales**: si el CDN
no responde, la carta se pinta igual y las pestañas siguen funcionando. Solo se
pierden la entrada de los titulares y el scroll suave.

## Editar lo habitual

- **Carta**: array `MENU` al principio del bloque 1 de `js/main.js`. Cada plato es
  `{ n: nombre, d: descripción, p: 'precio', tag: 'top' | 'nuevo' }` (`tag` opcional).
  De ahí salen la lista, las pestañas y el JSON-LD del menú.
- **Franja**: array `WORDS` del bloque 2. El JS duplica el contenido porque la
  animación desplaza exactamente la mitad; duplicarlo a mano invita a olvidarse.
- **Horario**: en dos sitios que deben decir lo mismo — el JSON-LD del `<head>` y
  las secciones 1 y 4 del HTML.
- **Titulares**: se parten por líneas con los `<br>` del HTML y el atributo
  `data-lines`. Cada línea entra recortada por su propia caja.
- **Textos, dirección y enlaces**: directamente en `index.html`.
- **Fotos y vídeo**: sustituir los archivos de `assets/` manteniendo el nombre.

## Detalles que conviene no romper

- **Los filos van por `gap`, no por `border`.** La rejilla lleva `background` negro
  y `gap:1px`, y cada celda su propio fondo. Si se cambian por bordes, en cuanto una
  celda se recoloque en móvil habrá filos dobles y huecos sin filo.
- **`.ln` lleva `padding` arriba y margen negativo.** Con el interlineado a `.92` la
  caja es más baja que la letra, y sin ese respiro la tilde de DÍA o de ESPAÑA se
  queda fuera del `overflow:hidden`.
- **`.ln` no está anidada dentro de `.display`.** El JS la pone en cualquier titular
  con `data-lines`, y el claim del pie no es `.display`.
- **El titular grande solo cabe a ancho completo.** En las celdas estrechas
  (`.local__txt`, `.visit__txt`) baja de escalón, que además es la jerarquía correcta.
- **`button{ font:inherit }`.** Los botones no heredan la tipografía: sin esa línea
  el `burger` cae al Arial del navegador y aparece una tercera fuente en la página.
- **`.local__grid` mide su primera fila por contenido en móvil.** Ahí el texto deja
  de ir a caballo de dos filas altas; con la altura fija de las fotos, se saldría.

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
4. Alta en Search Console, enviar el sitemap y enlazar desde Google Business e
   Instagram.
