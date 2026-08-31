/* ============================================================
   FLAMINGO BRUNCH & FOOD — interacción
   ------------------------------------------------------------
   Sin build y sin dependencias obligatorias: GSAP y Lenis solo
   mejoran la entrada y el scroll. Si el CDN no responde, la
   carta se pinta, las pestañas cambian, el acordeón abre y el
   formulario envía igual.

   Índice
     0. La pared: pintadas, brochazos y botones a espray
     1. Carta: datos, pestañas y JSON-LD
     2. Lo más pedido
     3. Acordeon de preguntas (+ FAQPage)
     4. Reserva por WhatsApp
     5. Nav, scroll y menú móvil
     6. Vídeos
     7. Entradas
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };



  /* == 0. LA PARED ==========================================
     Las pintadas del baño, hechas a código. Todos los trazos —los
     corazones, los destellos, el brochazo bajo una palabra y el
     contorno de los botones— salen del mismo par de funciones: una
     ondulación determinista (misma semilla, mismo gesto) sobre una
     figura base. Así ningún trazo repite a otro, pero todos son
     iguales entre recargas y ninguno es una imagen que descargar.
     ─────────────────────────────────────────────────────────── */
  var NS = 'http://www.w3.org/2000/svg';
  var TAU = Math.PI * 2;

  function wobble(a, seed, amp) {
    return 1 + amp * (
      Math.sin(a * 3 + seed) * 0.5 +
      Math.sin(a * 5 + seed * 1.7) * 0.3 +
      Math.sin(a * 7 + seed * 2.3) * 0.2
    );
  }

  function svgEl(cls, viewBox, stretch) {
    var el = document.createElementNS(NS, 'svg');
    el.setAttribute('class', cls);
    el.setAttribute('viewBox', viewBox);
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('focusable', 'false');
    if (stretch) el.setAttribute('preserveAspectRatio', 'none');
    return el;
  }

  function pathEl(parent, d, cls) {
    var el = document.createElementNS(NS, 'path');
    el.setAttribute('d', d);
    if (cls) el.setAttribute('class', cls);
    // pathLength normaliza el trazo a 100 para que el dibujado no dependa
    // de cuánto se estire el SVG.
    el.setAttribute('pathLength', '100');
    parent.appendChild(el);
    return el;
  }

  // Superelipse ondulado: es como se rodea algo con un espray.
  // `dx`/`dy` desplazan el trazo en unidades del viewBox — así se dibuja
  // la copia de debajo del doble contorno sin recurrir a un `transform`,
  // que en un SVG estirado se deformaría con él.
  function ringPath(seed, amp, from, to, rx, ry, box, sq, dx, dy) {
    var steps = 74, d = '', e = 2 / (sq || 3.6);
    for (var i = 0; i <= steps; i++) {
      var a = from + (to - from) * (i / steps);
      var ca = Math.cos(a), sa = Math.sin(a), k = wobble(a, seed, amp);
      var x = box.w / 2 + Math.sign(ca) * Math.pow(Math.abs(ca), e) * rx * k + (dx || 0);
      var y = box.h / 2 + Math.sign(sa) * Math.pow(Math.abs(sa), e) * ry * k + (dy || 0);
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }

  // Brochazo horizontal: cae y remonta un poco, como un gesto de verdad.
  function swipePath(seed, amp, rise) {
    var steps = 26, d = '';
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var y = 13 - rise * t + Math.sin(t * 7 + seed) * amp + Math.sin(t * 13 + seed * 1.6) * amp * 0.45;
      d += (i ? 'L' : 'M') + (1 + t * 98).toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }

  /* Un churrete de pintura.
     La silueta no es un palo con una bola: es un HUSO. Nace estrecho
     —lo que mida la masa de la que sale—, engorda enseguida porque la
     pintura se acumula, va afinando mientras corre y acaba en una gota
     más ancha que alta, que es como se apoza antes de caer. Además se
     desvía un poco de la vertical: un reguero perfectamente recto
     delata que está dibujado.
       wTop   ancho donde arranca (el de la línea o el del borde)
       wMax   ancho del engorde, justo debajo
       wNeck  ancho del cuello, antes de la gota
       rx,ry  radios de la gota
       drift  desvío horizontal al llegar abajo                      */
  function dripPath(x, len, wTop, wMax, wNeck, rx, ry, drift) {
    // El engorde a un tercio del recorrido y muestreado fino: más arriba
    // sale un pico en punta en vez de un ensanchamiento.
    var SWELL = 0.32, N = 16;
    function smooth(t) { return t * t * (3 - 2 * t); }
    function w(t) {
      return t < SWELL
        ? wTop + (wMax - wTop) * smooth(t / SWELL)
        : wMax + (wNeck - wMax) * smooth((t - SWELL) / (1 - SWELL));
    }
    function cx(t) { return x + (drift || 0) * t * t; }

    var down = [], up = [], i, t;
    for (i = 0; i <= N; i++) {
      t = i / N;
      down.push((cx(t) - w(t) / 2).toFixed(2) + ' ' + (t * len).toFixed(2));
      up.push((cx(t) + w(t) / 2).toFixed(2) + ' ' + (t * len).toFixed(2));
    }
    up.reverse();
    return 'M' + down.join('L') +
           // large-arc + sweep 0: el arco pasa por DEBAJO y cierra la gota
           'A' + rx.toFixed(2) + ' ' + ry.toFixed(2) + ' 0 1 0 ' + up[0] +
           'L' + up.slice(1).join('L') + 'Z';
  }

  // Ruido determinista 0..1. `wobble` no vale aquí: su recorrido es
  // estrechísimo y todos los churretes salían casi iguales o disparados.
  function rnd(seed, i) {
    var v = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
    return v - Math.floor(v);
  }

  /* Una tanda de churretes. La gracia está en el CONTRASTE: uno que ha
     corrido mucho y un par cortos, a distinta altura y grosor. Si todos
     miden parecido parecen rayas, no pintura. */
  function dripsInto(svg, seed, n, spread, x0, scale, freeLen) {
    scale = scale || 1;
    for (var i = 0; i < n; i++) {
      var a = rnd(seed, i), b = rnd(seed + 4.7, i), c = rnd(seed + 9.1, i);
      // repartidos por el borde, sin quedar a intervalos regulares
      var x = x0 + (i + 0.18 + a * 0.64) * (spread / n);
      // En una tanda, el primero corre mucho y los demás poco: es el
      // contraste lo que la hace creíble. Con `freeLen` cada churrete
      // saca su propio largo, que es lo que hace falta cuando van
      // sueltos y separados, como en la barra del nav.
      var t = freeLen ? 0.08 + b * 0.92
            : i === 0 ? 0.72 + b * 0.28
            : 0.14 + b * 0.4;
      var len = (14 + t * 44) * scale;
      var wMax = (8 + c * 4.4) * scale;
      var wTop = wMax * 0.78;               // el borde ya es ancho
      var wNeck = wMax * (0.32 + c * 0.08);
      var rx = wNeck * 0.95 + 1.2 * scale, ry = rx * 0.82;
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'd');
      g.style.setProperty('--i', i);
      pathEl(g, dripPath(x, len, wTop, wMax, wNeck, rx, ry, (a - 0.5) * 5 * scale));
      // alguna gota ya desprendida, más abajo
      if (c > 0.62) {
        var dot = document.createElementNS(NS, 'ellipse');
        dot.setAttribute('cx', (x + (a - 0.2) * 5).toFixed(2));
        dot.setAttribute('cy', (len + (5 + a * 8) * scale).toFixed(2));
        dot.setAttribute('rx', (rx * 0.55).toFixed(2));
        dot.setAttribute('ry', (rx * 0.46).toFixed(2));
        g.appendChild(dot);
      }
      svg.appendChild(g);
    }
  }

  /* Los tres garabatos de la pared, con su ondulación propia */
  var DOODLE = {
    heart: function (seed) {
      var steps = 60, d = '';
      for (var i = 0; i <= steps; i++) {
        var t = i / steps * TAU;
        var k = wobble(t, seed, 0.05);
        var x = 16 * Math.pow(Math.sin(t), 3);
        var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        d += (i ? 'L' : 'M') + (50 + x * 2.6 * k).toFixed(1) + ' ' + (46 - y * 2.6 * k).toFixed(1);
      }
      return [d];
    },
    star: function (seed) {
      // Destello de cuatro puntas. Es una astroide (cos^3 / sen^3): los
      // lados salen cóncavos y las puntas afiladas, que es como se pinta
      // un brillo. Con petalos de rosa polar salia un trebol.
      var d = '';
      for (var i = 0; i <= 72; i++) {
        var t = i / 72 * TAU;
        var k = wobble(t, seed, 0.07);
        var c = Math.cos(t), sn = Math.sin(t);
        d += (i ? 'L' : 'M') +
             (50 + 46 * c * c * c * k).toFixed(1) + ' ' +
             (50 + 46 * sn * sn * sn * k).toFixed(1);
      }
      return [d + 'Z'];
    },
    halo: function (seed) {
      // La aureola que hay sobre el tag del baño: una elipse abierta
      return [ringPath(seed, 0.06, 0.35, TAU - 0.35, 44, 15, { w: 100, h: 40 }, 2)];
    }
  };

  $$('.doodle').forEach(function (host, i) {
    var kind = host.className.indexOf('--heart') > -1 ? 'heart'
             : host.className.indexOf('--halo') > -1 ? 'halo' : 'star';
    var vb = kind === 'halo' ? '0 0 100 40' : '0 0 100 100';
    var sv = svgEl('doodle__svg', vb, false);
    sv.setAttribute('width', '100%');
    sv.style.display = 'block';
    DOODLE[kind](3.1 + i * 2.7).forEach(function (d) { pathEl(sv, d); });
    host.appendChild(sv);
  });

  /* El brochazo bajo una palabra se pinta más abajo, en el bloque 7:
     `splitLines` reconstruye el titular entero, así que decorarlo antes
     dejaría el SVG y su observador colgando de un nodo ya reemplazado. */

  /* Botones. Se trazan como un tag de la pared: una mancha ondulada de
     relleno, su contorno, y una tercera copia desplazada en fucsia que
     hace de doble contorno. Cada botón lleva su semilla, así que no hay
     dos manchas iguales — pero siempre son las mismas entre recargas. */
  var BOX = { w: 220, h: 66 };
  $$('.btn').forEach(function (btn, n) {
    if (btn.querySelector('.btn__blob')) return;
    // Los pequeños se quedan limpios. Un tag es un gesto: puesto en tres
    // enlaces seguidos de 40px deja de ser un gesto y es ruido — se ven
    // tres manchas iguales con sus rayitas y no se lee ninguna.
    if (btn.classList.contains('btn--sm')) return;
    var seed = 1.4 + n * 2.11;

    // El texto va en su propio span: el SVG es hermano, no fondo, para
    // que el contorno pueda salirse de la caja sin recortarse.
    var label = document.createElement('span');
    label.className = 'btn__t';
    while (btn.firstChild) label.appendChild(btn.firstChild);
    btn.appendChild(label);

    var blob = svgEl('btn__blob', '0 0 ' + BOX.w + ' ' + BOX.h, true);
    // la copia de debajo, desplazada abajo y a la derecha
    pathEl(blob, ringPath(seed + 0.6, 0.030, 0, TAU, 104, 28, BOX, 3.6, 5, 3), 'btn__sh');
    pathEl(blob, ringPath(seed, 0.028, 0, TAU, 104, 28, BOX), 'btn__fill');
    pathEl(blob, ringPath(seed, 0.034, -0.4, TAU + 0.26, 104, 28, BOX), 'btn__line');
    btn.appendChild(blob);

    // El SVG de los churretes monta sobre el blob: al compartir color, la
    // unión no se ve y parece que la pintura cae de la propia mancha.
    // El viewBox y la caja del CSS guardan la misma proporción (80:90 y
    // 62:70): con `preserveAspectRatio` por defecto, si no coincidieran
    // el SVG se centraría y los churretes se saldrían de su sitio.
    var drips = svgEl('btn__drip', '0 0 80 90', false);
    dripsInto(drips, seed, 3, 62, 9);
    btn.appendChild(drips);
  });

  /* La barra del nav acaba en una línea de espray con sus churretes.
     Se traza en PÍXELES REALES, no en un viewBox estirado: con
     `preserveAspectRatio="none"` a lo ancho de la pantalla la ondulación
     se aplanaba hasta parecer un subrayador y el grosor se disparaba.
     Aquí una unidad es un píxel, así que el temblor y el trazo miden lo
     que se les pide, y línea y churretes caben en un mismo SVG — con lo
     que la línea tapa por sí sola el canto de arriba de cada churrete. */
  (function () {
    var nav = $('#nav');
    if (!nav) return;

    var H = 62, Y = 9;                 // alto del lienzo y altura del trazo
    var svg = svgEl('nav__paint', '0 0 100 ' + H, false);
    svg.setAttribute('preserveAspectRatio', 'xMinYMin slice');
    nav.appendChild(svg);

    function handLine(w, y, amp, seed) {
      var step = 15, d = '';
      for (var x = 0, i = 0; x <= w + step; x += step, i++) {
        var n = Math.sin(i * 0.9 + seed) * 0.55 + Math.sin(i * 2.3 + seed * 1.7) * 0.32
              + Math.sin(i * 5.1 + seed * 2.9) * 0.13;
        d += (i ? 'L' : 'M') + Math.min(x, w).toFixed(1) + ' ' + (y + n * amp).toFixed(1);
      }
      return d;
    }

    var last = 0;
    function paint() {
      var w = nav.offsetWidth;
      if (!w || w === last) return;
      last = w;
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + H);
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      // Tres churretes, en sitios que no dependen del ancho, y bien
      // distintos de largo: son pocos y contrastados a propósito.
      [0.13, 0.46, 0.81].forEach(function (at, i) {
        var g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'd');
        g.style.setProperty('--i', i);
        var a = rnd(7.3 + i * 4.4, i), b = rnd(2.9 + i * 6.1, i);
        var x = w * at + (a - 0.5) * 40;
        var len = 13 + b * 34;
        // Arranca con el grosor del trazo (2.2px) y engorda justo debajo:
        // así sale de la línea en vez de estar clavado en ella.
        var wMax = 4.6 + a * 2.2;
        var wNeck = 1.9 + a * 0.7;
        var rx = wNeck * 1.05 + 1, ry = rx * 0.78;
        pathEl(g, dripPath(x, len, 2.4, wMax, wNeck, rx, ry, (b - 0.5) * 6));
        // el trazo pasa por encima del arranque, así que el churrete
        // se dibuja desde la propia línea
        g.setAttribute('transform', 'translate(0,' + (Y - 1) + ')');
        svg.appendChild(g);
      });

      pathEl(svg, handLine(w, Y, 2.6, 6.2), 'nav__line');
    }

    paint();
    var t = 0;
    window.addEventListener('resize', function () {
      clearTimeout(t);
      t = setTimeout(paint, 140);
    });
  })();

  /* Nav: cada enlace lleva su propio brochazo */
  $$('.nav__links a, .nav__tel').forEach(function (a, i) {
    var sv = svgEl('nav__sq', '0 0 100 12', true);
    pathEl(sv, swipePath(4.1 + i * 2.4, 1.5, 1.6));
    a.appendChild(sv);
  });


  /* == 1. LA CARTA ==========================================
     Un único array alimenta la lista, las pestañas, el bloque de
     "lo más pedido" y el JSON-LD del menú: nunca se desincronizan. */
  var MENU = [
    { label: 'Brunch', items: [
      { n: 'Huevos Benedict', d: 'Pan brioche, bacón, aguacate, huevo poché y salsa holandesa.', p: '15,00', tag: 'top' },
      { n: 'Huevos Nórdicos', d: 'Pan brioche, salmón ahumado, aguacate, huevo poché y salsa holandesa.', p: '15,90' },
      { n: 'Sándwich de Pastrami', d: 'Pan tostado, pastrami, pepinillo y nuestra salsa especial.', p: '18,30', tag: 'nuevo' },
      { n: 'Club Sándwich', d: 'Pan brioche, pollo a la plancha, bacón, tomate, mix de lechugas y mayonesa.', p: '14,70', tag: 'top' },
      { n: 'Sándwich de huevo coreano', d: 'Pan brioche, huevos revueltos, queso cheddar y salsa sriracha.', p: '11,10' },
      { n: 'Huevos Turcos', d: 'Yogur griego con ajo y limón, mantequilla tostada con pimentón, dos huevos poché y eneldo.', p: '9,60', tag: 'nuevo' }
    ]},
    { label: 'Tostas', items: [
      { n: 'Puglia', d: 'Base de pesto, rúcula, burrata, frutos rojos, pistacho, aceite trufado y balsámico.', p: '12,00', tag: 'top' },
      { n: 'Oslo', d: 'Guacamole, salmón ahumado, rúcula y huevo poché.', p: '10,80' },
      { n: 'Londres', d: 'Queso cottage, fruta de temporada, nueces y miel.', p: '9,60' },
      { n: 'Miami', d: 'Guacamole casero, huevos revueltos y bacón.', p: '7,50' },
      { n: 'París', d: 'Base de queso crema, huevos revueltos y aguacate.', p: '7,50' }
    ]},
    { label: 'Pancakes', items: [
      { n: 'Pancake Benedict', d: 'Dos pancakes americanos, huevo poché, tocino y salsa holandesa casera.', p: '11,40' },
      { n: 'Pancake Salado', d: 'Dos pancakes americanos, huevos revueltos, tocino y sirope de arce.', p: '11,00' },
      { n: 'Pancake Vegano', d: 'Dos pancakes, fruta variada, plátano a la plancha, almendra picada y sirope.', p: '10,80' },
      { n: 'Pancake de Chocolate', d: 'Dos pancakes americanos, Nutella, crocanti de almendra y nata montada.', p: '9,60' },
      { n: 'Pancake de Fruta', d: 'Dos pancakes americanos, fruta variada, plátano a la plancha y sirope.', p: '9,60' },
      { n: 'French Toast Nutella', d: 'Brioche bañado en leche y canela, plátano a la plancha, almendra y Nutella.', p: '9,60', tag: 'top' }
    ]},
    { label: 'Burgers', items: [
      { n: 'Mexican Burger', d: 'Doble smash de ternera, cheddar, bacón caramelizado, mermelada de piña, mayonesa trufada, guacamole y nachos.', p: '17,90', tag: 'nuevo' },
      { n: 'Flamingo Burger', d: 'Doble smash de ternera, pepinillo, queso cheddar y salsa Flamingo.', p: '15,00', tag: 'top' },
      { n: 'Chicken Burger', d: 'Pechuga de pollo rebozada, mayo-kimchi y pepinillo.', p: '15,00' }
    ]},
    { label: 'Compartir', items: [
      { n: 'Ensalada César', d: 'Canónigos, rúcula, parmesano, pollo rebozado, cherris y salsa César casera.', p: '11,50' },
      { n: 'Nachos Caseros', d: 'Guacamole casero, pico de gallo, yogur griego y mozzarella.', p: '9,60' },
      { n: 'Bastones de Boniato', d: 'Boniato frito con mayonesa trufada y parmesano laminado.', p: '8,40' },
      { n: 'Crepe con pollo', d: 'Tres crepes, pollo a la plancha y bechamel de champiñones casera.', p: '11,00', tag: 'top' }
    ]},
    { label: 'Bowls', items: [
      { n: 'Bowl de Açaí', d: 'Con granola casera, fruta variada y crema de cacahuete.', p: '10,80', tag: 'top' },
      { n: 'Bowl de Yogur', d: 'Yogur griego, granola casera y fruta variada.', p: '7,50' },
      { n: 'Gofre perlado', d: 'Gofre de Lieja con sirope y el topping que elijas.', p: '7,00' },
      { n: 'Crepe Dulce', d: 'Tres crepes con tu topping favorito.', p: '7,20' },
      { n: 'Croissant de mantequilla', d: 'Con suplementos a elegir.', p: '2,50' }
    ]},
    { label: 'Dulces', items: [
      { n: 'Matilda', d: 'Bizcocho de chocolate relleno de crema de chocolate y bañado en más chocolate.', p: '6,60', tag: 'top' },
      { n: 'Cheesecake Pistacho', d: 'Tarta de queso casera sabor pistacho.', p: '6,60' },
      { n: 'Cheesecake Lotus', d: 'Tarta de queso casera sabor Lotus.', p: '6,60' },
      { n: 'Cheesecake Kinder', d: 'Tarta de queso casera de Kinder.', p: '6,60' },
      { n: 'Tarta Tres Leches', d: 'Bizcocho de vainilla bañado en mezcla de leches con merengue.', p: '6,00' },
      { n: 'Oreo y dulce de leche', d: 'Bizcocho de chocolate relleno de crema de Oreo y dulce de leche.', p: '6,00' },
      { n: 'Red Velvet', d: 'Tarta casera red velvet.', p: '6,00' },
      { n: 'Tarta de Zanahoria', d: 'Carrot cake casera.', p: '6,00' },
      { n: 'Brownie de Pistacho', d: 'Brownie casero con crema de pistacho y pistacho en polvo.', p: '6,00' },
      { n: 'Brownie Nutella', d: 'Brownie casero con Nutella y crocanti de almendra.', p: '5,00' },
      { n: 'Cookie Pistacho', d: 'Rellena de pistacho con chispas de chocolate blanco.', p: '4,50' },
      { n: 'Cookies Lotus · Oreo · Kinder', d: 'Rellenas y con chispas de chocolate.', p: '3,80' }
    ]},
    { label: 'Bebidas', items: [
      { n: 'Cafés clásicos', d: 'Espresso, cortado, americano, con leche.', p: '1,50' },
      { n: 'Latte con café', d: 'Con la leche y el sabor que prefieras.', p: '4,00' },
      { n: 'Latte Matcha', d: 'Matcha con leche a elegir.', p: '4,50', tag: 'top' },
      { n: 'Chocolate caliente', d: 'Chocolate espeso de la casa.', p: '4,00' },
      { n: 'Milkshakes', d: 'Helado, leche y nata montada.', p: '6,00' },
      { n: 'Smoothies', d: 'Batidos de frutas variadas.', p: '5,50' },
      { n: 'Tés fríos', d: 'Té de sabor, hielo y agua.', p: '3,80' }
    ]}
  ];

  var tabsEl = $('#menuTabs');
  var listEl = $('#menuList');
  var dotsEl = $('#menuDots');
  var current = 0;

  function dishMarkup(it) {
    var tag = it.tag ? '<span class="tag--dish">' + it.tag + '</span>' : '';
    return '<article class="dish">' +
             '<h3 class="dish__n">' + it.n + tag + '</h3>' +
             '<p class="dish__p">' + it.p + ' €</p>' +
             '<p class="dish__d">' + it.d + '</p>' +
           '</article>';
  }

  function renderMenu(i) {
    current = i;
    listEl.innerHTML = MENU[i].items.map(dishMarkup).join('');
    listEl.setAttribute('aria-labelledby', 'tab-' + i);
    listEl.scrollLeft = 0;
    if (dotsEl) $$('i', dotsEl).forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    if (hasGSAP && !REDUCED) {
      gsap.from($$('.dish', listEl), {
        opacity: 0, y: 12, duration: .5, stagger: .03, ease: 'power2.out', overwrite: true
      });
    }
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  }

  if (tabsEl && listEl) {
    tabsEl.setAttribute('role', 'tablist');
    tabsEl.setAttribute('aria-label', 'Categorías de la carta');
    listEl.setAttribute('role', 'tabpanel');
    listEl.setAttribute('tabindex', '0');

    tabsEl.innerHTML = MENU.map(function (c, i) {
      return '<button class="tab' + (i === 0 ? ' is-active' : '') + '" id="tab-' + i + '"' +
             ' role="tab" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '"' +
             ' data-i="' + i + '">' + c.label + '</button>';
    }).join('');
    if (dotsEl) dotsEl.innerHTML = MENU.map(function () { return '<i></i>'; }).join('');

    var tabs = $$('.tab', tabsEl);

    var select = function (i, focus) {
      if (i === current) { if (focus) tabs[i].focus(); return; }
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      renderMenu(i);
      if (focus) tabs[i].focus();
    };

    tabsEl.addEventListener('click', function (e) {
      var b = e.target.closest('.tab');
      if (b) select(+b.dataset.i, false);
    });

    // Navegación con flechas, como manda el patrón de pestañas
    tabsEl.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      var to = null;
      if (e.key === 'ArrowRight') to = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') to = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = tabs.length - 1;
      if (to === null) return;
      e.preventDefault();
      select(to, true);
    });

    renderMenu(0);
  }

  /* JSON-LD del menú: se genera desde MENU y toma el dominio del
     canonical, así el dominio solo se toca en un sitio. */
  (function () {
    var canon = $('link[rel="canonical"]');
    var base = canon ? canon.href.replace(/\/$/, '') : '';
    var tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Menu',
      '@id': base + '/#menu',
      'name': 'Carta de Flamingo Brunch & Food',
      'inLanguage': 'es-ES',
      'hasMenuSection': MENU.map(function (sec) {
        return {
          '@type': 'MenuSection',
          'name': sec.label,
          'hasMenuItem': sec.items.map(function (it) {
            return {
              '@type': 'MenuItem',
              'name': it.n,
              'description': it.d,
              'offers': { '@type': 'Offer', 'price': it.p.replace(',', '.'), 'priceCurrency': 'EUR' }
            };
          })
        };
      })
    });
    document.head.appendChild(tag);
  })();


  /* ══ 2. LO MÁS PEDIDO ════════════════════════════════════════
     Se saca de MENU por nombre: si un plato desaparece de la
     carta, desaparece también de aquí en vez de quedarse colgado. */
  (function () {
    var host = $('#dealList');
    if (!host) return;
    var PICK = ['Huevos Benedict', 'Puglia', 'Flamingo Burger', 'Bowl de Açaí', 'Matilda'];
    var byName = {};
    MENU.forEach(function (s) { s.items.forEach(function (it) { byName[it.n] = it; }); });

    var rows = PICK.map(function (n) { return byName[n]; })
      .filter(Boolean)
      .map(function (it) {
        return '<li><b>' + it.n + '</b><span class="d" aria-hidden="true"></span>' +
               '<span class="p">' + it.p + ' €</span></li>';
      });
    host.innerHTML = rows.join('');
  })();

  /* ══ 3. ACORDEÓN ═════════════════════════════════════════════
     Altura animada en píxeles y devuelta a `auto` al terminar,
     para que el texto siga fluyendo si cambia el ancho.          */
  (function () {
    var acc = $('#acc');
    if (!acc) return;
    var items = $$('.acc__it', acc).map(function (item, i) {
      var btn = $('.acc__b', item);
      var panel = $('.acc__p', item);
      panel.id = 'acc-p-' + i;
      btn.id = 'acc-b-' + i;
      btn.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', btn.id);
      panel.hidden = true;
      return { btn: btn, panel: panel };
    });

    function close(it) {
      if (it.btn.getAttribute('aria-expanded') !== 'true') return;
      it.btn.setAttribute('aria-expanded', 'false');
      var h = it.panel.scrollHeight;
      it.panel.style.height = h + 'px';
      requestAnimationFrame(function () { it.panel.style.height = '0px'; });
      var done = function () {
        it.panel.hidden = true;
        it.panel.style.height = '';
        it.panel.removeEventListener('transitionend', done);
      };
      if (REDUCED) done();
      else it.panel.addEventListener('transitionend', done);
    }

    function open(it) {
      it.btn.setAttribute('aria-expanded', 'true');
      it.panel.hidden = false;
      it.panel.style.height = '0px';
      var h = it.panel.scrollHeight;
      requestAnimationFrame(function () { it.panel.style.height = h + 'px'; });
      var done = function () {
        it.panel.style.height = 'auto';
        it.panel.removeEventListener('transitionend', done);
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      };
      if (REDUCED) done();
      else it.panel.addEventListener('transitionend', done);
    }

    // La transición se pone aquí y no en el CSS: así, sin JS, los
    // paneles quedan abiertos y legibles en vez de recortados a cero.
    items.forEach(function (it) {
      if (!REDUCED) it.panel.style.transition = 'height .42s cubic-bezier(.22,1,.36,1)';
      it.btn.addEventListener('click', function () {
        var wasOpen = it.btn.getAttribute('aria-expanded') === 'true';
        items.forEach(close);
        if (!wasOpen) open(it);
      });
    });

    /* FAQPage: se lee del propio acordeón, igual que el menú se lee de
       MENU. Si se edita una pregunta en el HTML, el schema va detrás. */
    var faq = items.map(function (it) {
      return {
        '@type': 'Question',
        'name': it.btn.textContent.replace(/\s+/g, ' ').trim(),
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': it.panel.textContent.replace(/\s+/g, ' ').trim()
        }
      };
    });
    if (faq.length) {
      var tag = document.createElement('script');
      tag.type = 'application/ld+json';
      tag.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'inLanguage': 'es-ES',
        'mainEntity': faq
      });
      document.head.appendChild(tag);
    }
  })();

  /* ══ 4. RESERVA POR WHATSAPP ═════════════════════════════════
     Sin servidor y sin promesas falsas: el formulario compone el
     mensaje y abre WhatsApp, que es por donde el local atiende.   */
  (function () {
    var form = $('#bookForm');
    if (!form) return;
    var TEL = '34607020554';
    var err = $('#formError');

    function fail(msg, field) {
      if (err) { err.textContent = msg; err.hidden = false; }
      if (field) { field.classList.add('is-bad'); field.focus(); }
    }

    form.addEventListener('input', function (e) {
      e.target.classList.remove('is-bad');
      if (err) err.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.nombre, day = form.elements.dia, pax = form.elements.personas, msg = form.elements.mensaje;

      if (!name.value.trim())        return fail('Dinos tu nombre para saber a quién guardamos la mesa.', name);
      if (!day.value.trim())         return fail('¿Qué día y a qué hora te esperamos?', day);
      var n = parseInt(pax.value, 10);
      if (!n || n < 1 || n > 30)     return fail('Pon cuántas personas sois (de 1 a 30).', pax);

      var text = 'Hola Flamingo, soy ' + name.value.trim() + '.\n' +
                 'Quería mesa para ' + n + (n === 1 ? ' persona' : ' personas') + ' el ' + day.value.trim() + '.' +
                 (msg.value.trim() ? '\n' + msg.value.trim() : '') +
                 '\n\n(Enviado desde la web)';

      window.open('https://wa.me/' + TEL + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  })();

  /* ══ 5. NAV, SCROLL Y MENÚ MÓVIL ═════════════════════════════════════ */
  var lenis = null;
  if (window.Lenis && !REDUCED) {
    lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
  }

  var nav = $('#nav');
  var burger = $('#burger');
  var drawer = $('#drawer');

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    nav.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); }
    if (lenis) lenis.start();
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    closeDrawer();
    if (lenis) lenis.scrollTo(el, { duration: 1.1, offset: -84 });
    else el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
  });

  if (burger) {
    burger.addEventListener('click', function () {
      var open = !drawer.classList.contains('is-open');
      drawer.classList.toggle('is-open', open);
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      drawer.setAttribute('aria-hidden', String(!open));
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      if (open) {
        nav.classList.remove('is-hidden');
        var first = $('a', drawer);
        if (first) setTimeout(function () { first.focus(); }, 240);
      }
    });
  }

  // Se esconde al bajar y vuelve al subir; arriba del todo siempre está.
  if (nav) {
    var lastY = window.scrollY, ticking = false;
    var onScroll = function () {
      var y = window.scrollY;
      nav.classList.toggle('is-stuck', y > 30);
      if (!drawer || !drawer.classList.contains('is-open')) {
        nav.classList.toggle('is-hidden', y > lastY && y > 240);
      }
      lastY = y;
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
  }

  // Esc cierra el menú y el foco no se escapa del panel abierto
  document.addEventListener('keydown', function (e) {
    if (!drawer || !drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeDrawer();
      if (burger) burger.focus();
      return;
    }
    if (e.key === 'Tab') {
      var f = $$('a', drawer);
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  var yEl = $('#year');
  if (yEl) yEl.textContent = new Date().getFullYear();

  /* ══ 6. VÍDEOS ═══════════════════════════════════════════════
     Solo se descargan y se reproducen cuando entran en pantalla. */
  $$('video').forEach(function (v) {
    if (!('IntersectionObserver' in window)) { v.preload = 'auto'; return; }
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          v.preload = 'auto';
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: .25 }).observe(v);
  });

  /* == 7. ENTRADAS ==========================================
     Un solo gesto en toda la página: los titulares suben línea a
     línea y los bloques entran desde abajo. Nada más se anima.  */
  function splitLines(el) {
    var out = document.createDocumentFragment();
    el.innerHTML.split(/<br\s*\/?>/i).forEach(function (chunk) {
      var ln = document.createElement('span');
      ln.className = 'ln';
      var inner = document.createElement('span');
      inner.innerHTML = chunk.trim();
      ln.appendChild(inner);
      out.appendChild(ln);
    });
    el.innerHTML = '';
    el.appendChild(out);
  }
  var lined = $$('[data-lines]');
  lined.forEach(splitLines);

  /* Ahora sí: brochazo de espray bajo la palabra marcada, que se dibuja
     de un extremo a otro cuando entra en pantalla. */
  $$('.spray').forEach(function (el, i) {
    var seed = 0.9 + i * 2.6;
    var sv = svgEl('spray__ink', '0 0 100 20', true);
    pathEl(sv, swipePath(seed, 1.1, 2.4));        // nube de aerosol
    pathEl(sv, swipePath(seed, 1.3, 2.6));        // trazo
    pathEl(sv, swipePath(seed + 1.2, 2.1, 1.1));  // segunda pasada
    el.appendChild(sv);
    if (REDUCED || !('IntersectionObserver' in window)) { el.classList.add('is-on'); return; }
    new IntersectionObserver(function (en, ob) {
      if (!en[0].isIntersecting) return;
      el.classList.add('is-on');
      ob.disconnect();
    }, { threshold: .55 }).observe(el);
  });

  if (hasGSAP && !REDUCED) {
    lined.forEach(function (h) {
      gsap.from($$('.ln > span', h), {
        yPercent: 108, duration: .95, ease: 'power4.out', stagger: .06,
        scrollTrigger: { trigger: h, start: 'top 92%' }
      });
    });

    gsap.utils.toArray('.hero__row, .local__grid, .why__grid, .gal, .deal__grid, .book__grid, .foot__grid')
      .forEach(function (grid) {
        gsap.from(grid.children, {
          opacity: 0, y: 22, duration: .8, stagger: .05, ease: 'power3.out',
          scrollTrigger: { trigger: grid, start: 'top 90%' }
        });
      });

    gsap.from('.hero__box', { opacity: 0, y: 20, duration: .9, ease: 'power3.out' });
    gsap.utils.toArray('.carta__box, .faq__ph').forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 22, duration: .85, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%' } });
    });

    // El enlace de la sección en la que estás se queda subrayado
    var links = $$('.nav__links a');
    links.forEach(function (a) {
      var id = a.getAttribute('href');
      var sec = id && id.length > 1 ? document.querySelector(id) : null;
      if (!sec) return;
      ScrollTrigger.create({
        trigger: sec, start: 'top 45%', end: 'bottom 45%',
        onToggle: function (self) {
          if (!self.isActive) return;
          links.forEach(function (l) { l.classList.remove('is-current'); });
          a.classList.add('is-current');
        }
      });
    });

    ScrollTrigger.refresh();
  }
})();
