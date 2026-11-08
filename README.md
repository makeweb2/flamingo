# Flamingo Brunch & Food — web

Landing de una sola página para Flamingo Brunch & Food (Pl. de España 3, Elche).
HTML + CSS + JS sin build: se sube tal cual a cualquier hosting.

Publicada en GitHub Pages: <https://makeweb2.github.io/flamingo/>

Para verla en local: doble clic en `index.html`, o `python -m http.server` y abrir
`http://localhost:8000`.

## La idea: la página es la fachada

Todo sale de la calle, no de una plantilla:

| Elemento del local | Dónde está en la web |
|---|---|
| Rótulo FLAMINGO / BRUNCH & FOOD | La portada, en Marcellus |
| Arco de flores de la puerta | Enmarca el vídeo de la portada y florece al cargar |
| Carpintería de acero negro | `.ventanal`, `.win`, `.reels`: fotos y textos son cristales |
| Toldos negros | La barra de navegación y la sección de la carta |
| Sombrilla de rayas | `.valance`, bajo la portada |
| Ratán de las sillas | `.ratan`, encima de la tienda y en la cesta |
| Baldosa ocre octogonal | `.acera`, el suelo de la portada y del pie |

Tokens en `:root` de `css/style.css`. El rosa `--wall` es la pared al sol y el negro
`--steel` está medido en la carpintería.

**Fuentes:** Fraunces (titulares), Jost (texto), Cooper Black (carteles, precios y
horario, incrustada en base64 porque un `url()` no carga con doble clic) y Marcellus
(solo el rótulo, recortada a sus letras).

**Movimiento.** Sí hay microanimaciones, pero ninguna depende del ratón: no hay
cursor propio y ningún `:hover` lleva `transform`. Al señalar solo cambia el color.
Son: floración del arco, guirnaldas y ramos; titulares línea a línea; fotos que bajan
como persiana con un reflejo; pétalos cayendo; flamencos que se balancean; relleno de
la nota en flamencos; y la flor al añadir un producto. Todo se apaga con
`prefers-reduced-motion`.

## Tienda con recogida

No hay servidor ni pago online. El cliente elige productos, indica nombre, día y hora,
y la web abre **WhatsApp hacia el teléfono del local con el pedido ya escrito**.

- El pedido llega cuando el cliente pulsa enviar en WhatsApp. La web se lo avisa, y le
  dice que queda confirmado cuando el local responda.
- **Teléfono que recibe los pedidos:** constante `TEL` al principio de `js/main.js`
  (formato internacional sin `+`). Es la misma para las reservas.
- **Productos y precios:** salen de `MENU`. Lo que se cambia en la carta cambia en la
  tienda.
- **Estantes:** array `SHOP` (agrupa las secciones de `MENU`).
- **Fotos de producto:** objeto `FOTOS`, `{ 'Nombre del plato': 'assets/img/foto.jpg' }`.
- **Horario de recogida:** `OPEN`, `CLOSE`, `STEP` (cada 15 min), `LEAD` (30 min de
  margen) y `DAYS` (7 días vista).

Si se quiere que el pedido entre solo, sin que el cliente pulse enviar, hace falta un
servidor con la API de WhatsApp Business o de un servicio equivalente.

## Editar lo habitual

- **Carta**: array `MENU` de `js/main.js`. `{ n, d, p: 'precio', tag: 'top' | 'nuevo' }`.
- **Lo más pedido**: array `PICK` (bloque 2), con nombres de platos de `MENU`.
- **Reseñas con nombre**: array `RESENAS` (bloque 5). Solo reseñas reales:
  `{ autor, fecha, nota, texto }`. Con el array vacío las tarjetas no aparecen. La
  nota en flamencos (4,2) está en el HTML de `#resenas`: el ancho de `.flock__on` y su
  regla `.is-in` del CSS van a juego (84 % = 4,2 / 5).
- **Redes**: lista `.canales` del HTML. Solo está lo comprobado (Instagram, WhatsApp y
  Google). Para TikTok o Facebook, copiar una fila con la URL oficial.
- **Preguntas**: en el HTML. El `FAQPage` se genera leyendo el acordeón.
- **Flores**: bloque 8 de `js/main.js` y piezas `#f-*` del sprite. El azar lleva
  semilla, así que el dibujo sale siempre igual.

## Detalles que conviene no romper

- **`[hidden]{ display:none !important }`.** Sin él, `.btn{ display:inline-flex }` gana
  al atributo y el botón Añadir no se oculta al poner cantidades.
- **Las flores llevan `x`, `y`, `width` y `height` en `<use>`.** Sin ellos un `<symbol>`
  se dibuja al 100 % del SVG y una flor ocupa la pantalla.
- **`.dis` usa `opsz` bajo.** Subido, Fraunces se afina y parece una didona fría.
- **`.ln` lleva `padding` arriba y margen negativo.** Si no, el recorte se come la tilde
  de "día".
- **El acordeón no lleva `height:0` en el CSS.** Sin JS los paneles se leen abiertos.
- **El aviso de `scrollRestoration` y la clase `js` van en línea en el `<head>`.**
  Desde un script con `defer` llegan tarde.
- **La cesta lleva `data-lenis-prevent`.** Si no, Lenis se queda la rueda del ratón.

## SEO

Canonical, Open Graph, JSON-LD (`Restaurant`, `Menu`, `FAQPage`), `sitemap.xml` y
`robots.txt` apuntan a la dirección de GitHub Pages. **Si se compra un dominio,
sustituir `https://makeweb2.github.io/flamingo` en `index.html`, `sitemap.xml` y
`robots.txt`.**

Para acelerar la aparición en Google: alta en Search Console, enviar el sitemap y
enlazar la web desde el perfil de Google Business y la bio de Instagram.

## Datos del negocio usados

- Dirección: Pl. de España, 3 — 03201 Elx / Elche (Alicante)
- Teléfono y WhatsApp: 607 02 05 54
- Horario: todos los días, 9:00–21:00
- Instagram: [@flamingo.bf](https://www.instagram.com/flamingo.bf/)
- Reparto: Uber Eats, Glovo y Just Eat

## Pendiente de confirmar con el local

1. **WhatsApp.** La tienda y las reservas dan por hecho que el 607 02 05 54 tiene
   WhatsApp y que alguien lo atiende.
2. **Precios.** Salen de las plataformas de reparto y suelen ir por encima de los de
   sala. Ahora la tienda los usa para calcular el total.
3. **Condiciones de recogida.** "Se paga al recoger", la antelación de 30 minutos y que
   toda la carta se pueda encargar son suposiciones razonables.
4. **Horario.** Está puesto el de Google (9:00–21:00).
5. **Nota de Google.** 4,2 sobre 776 reseñas; el número de reseñas sube con el tiempo.
6. **Cuaderno de campo.** Resume opiniones públicas de GastroRanking. Si se prefieren
   reseñas con nombre, rellenar `RESENAS`.
