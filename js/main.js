/* ============================================================
   FLAMINGO BRUNCH & FOOD — interacción
   ------------------------------------------------------------
   Un solo fichero, sin build, sin dependencias obligatorias:
   GSAP y Lenis mejoran la página, pero si el CDN no responde
   todo sigue funcionando (la carta se pinta, las pestañas
   cambian, el acordeón abre y el formulario envía).

   Índice
     1. Motor de tinta (trazos SVG)
     2. Botones
     3. Subrayados, tachones y nav
     4. Carta: datos, pestañas y JSON-LD
     5. Lo más pedido
     6. Estado abierto / cerrado
     7. Acordeón de preguntas (+ FAQPage)
     8. Reserva por WhatsApp
     9. Scroll, nav y menú móvil
    10. Vídeos
    11. Animaciones
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };


  /* ══ 1. MOTOR DE TINTA ═══════════════════════════════════════
     Cada trazo se genera a partir de un superelipse con una
     ondulación determinista: misma semilla, mismo gesto. Así no
     hay dos botones iguales, pero sí son iguales entre recargas. */
  var NS  = 'http://www.w3.org/2000/svg';
  var BOX = { w: 220, h: 66 };
  var TAU = Math.PI * 2;

  function wobble(a, seed, amp) {
    return 1 + amp * (
      Math.sin(a * 3 + seed) * 0.5 +
      Math.sin(a * 5 + seed * 1.7) * 0.3 +
      Math.sin(a * 7 + seed * 2.3) * 0.2
    );
  }

  // Superelipse: un rectángulo redondeado, que es como se rodea una palabra.
  function point(a, seed, amp, rx, ry, box, sq) {
    var ca = Math.cos(a), sa = Math.sin(a), e = 2 / (sq || 3.6);
    var k = wobble(a, seed, amp);
    return [
      box.w / 2 + Math.sign(ca) * Math.pow(Math.abs(ca), e) * rx * k,
      box.h / 2 + Math.sign(sa) * Math.pow(Math.abs(sa), e) * ry * k
    ];
  }

  function trace(seed, amp, from, to, close, rx, ry, box, sq) {
    box = box || BOX;
    var steps = 76, d = '';
    for (var i = 0; i <= steps; i++) {
      var p = point(from + (to - from) * (i / steps), seed, amp, rx, ry, box, sq);
      d += (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }
    return d + (close ? 'Z' : '');
  }

  // Brochazo horizontal: cae y remonta un poco, como un gesto de verdad.
  function swipe(seed, amp, rise) {
    var steps = 26, d = '';
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var x = 1 + t * 98;
      var y = 13 - rise * t + Math.sin(t * 7 + seed) * amp + Math.sin(t * 13 + seed * 1.6) * amp * 0.45;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
  }

  // Aspa de tachón: cruza la palabra y se pasa un poco por los dos lados.
  function slash(seed, dir) {
    var steps = 18, d = '';
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var x = -2 + t * 104;
      var base = dir > 0 ? 21 - t * 12 : 9 + t * 12;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + (base + Math.sin(t * 6 + seed) * 1.5).toFixed(1);
    }
    return d;
  }

  function svgEl(cls, viewBox, stretch) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('class', cls);
    s.setAttribute('viewBox', viewBox);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    if (stretch) s.setAttribute('preserveAspectRatio', 'none');
    return s;
  }

  function pathEl(parent, d, cls) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    if (cls) p.setAttribute('class', cls);
    p.setAttribute('pathLength', '100');
    parent.appendChild(p);
    return p;
  }

  // Anillo de rotulador reutilizable (pestañas, precios, etiquetas)
  function ring(host, cls, seed, amp, rx, ry, passes) {
    var el = svgEl(cls, '0 0 ' + BOX.w + ' ' + BOX.h, true);
    for (var i = 0; i < (passes || 1); i++) {
      pathEl(el, trace(seed + i * 0.9, amp + i * 0.014, -0.4 - i * 0.2, TAU + 0.2 + i * 0.3, false, rx - i * 3, ry - i * 2), 'ink-ring__p');
    }
    host.appendChild(el);
    return el;
  }


  /* ══ 2. BOTONES ══════════════════════════════════════════════
     Contorno trazado, etiqueta que rota, goterones y un imán que
     acerca el botón al cursor. Todo por variables CSS para que
     los estados no se pisen entre sí.                            */
  function inkButton(btn, n) {
    if (btn.querySelector('.btn__ink')) return;
    var seed = 1.3 + n * 2.11;

    // La etiqueta se duplica: una sale por arriba y la copia entra por abajo.
    var text = btn.textContent.trim();
    btn.textContent = '';
    var label = document.createElement('span');
    label.className = 'btn__label';
    var t1 = document.createElement('span');
    t1.className = 'btn__t';
    t1.textContent = text;
    var t2 = document.createElement('span');
    t2.className = 'btn__t btn__t--alt';
    t2.textContent = text;
    t2.setAttribute('aria-hidden', 'true');
    label.appendChild(t1);
    label.appendChild(t2);
    btn.appendChild(label);

    // Relleno + primera pasada + segunda pasada (esta se dibuja al señalar)
    var ink = svgEl('btn__ink', '0 0 ' + BOX.w + ' ' + BOX.h, true);
    pathEl(ink, trace(seed, 0.022, 0, TAU, true, 104, 28), 'btn__fill');
    pathEl(ink, trace(seed, 0.030, -0.5, TAU + 0.22, false, 104, 28), 'btn__stroke btn__stroke--1');
    pathEl(ink, trace(seed + 0.9, 0.046, -0.18, TAU + 0.55, false, 101, 26), 'btn__stroke btn__stroke--2');
    btn.appendChild(ink);

    // Goterones: cada uno con su longitud y su retardo
    var drips = svgEl('btn__drips', '0 0 74 34', false);
    var g = document.createElementNS(NS, 'g');
    var LENS = [8, 19, 12];
    [0, 1, 2].forEach(function (i) {
      var x = 9 + i * 22 + (wobble(i * 2.1, seed, 1) - 1) * 4;
      var len = LENS[i] * (0.8 + Math.abs(wobble(i * 1.4, seed, 1) - 1) * 0.45);
      var r = 3.4 + i * 0.5;
      var d = document.createElementNS(NS, 'g');
      d.setAttribute('class', 'drip');
      d.style.setProperty('--i', i);
      var line = document.createElementNS(NS, 'path');
      line.setAttribute('d', 'M' + x.toFixed(1) + ' 0v' + len.toFixed(1));
      d.appendChild(line);
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x.toFixed(1));
      c.setAttribute('cy', (len + r * 0.72).toFixed(1));
      c.setAttribute('r', r);
      d.appendChild(c);
      g.appendChild(d);
    });
    drips.appendChild(g);
    btn.appendChild(drips);

    // Imán: lerp propio para escribir las variables con unidades y parar
    // el bucle en cuanto se asienta. Nada corriendo de fondo sin motivo.
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && !REDUCED) {
      var cur = { x: 0, y: 0 }, aim = { x: 0, y: 0 }, raf = 0;
      var tick = function () {
        cur.x += (aim.x - cur.x) * 0.16;
        cur.y += (aim.y - cur.y) * 0.16;
        btn.style.setProperty('--mx', cur.x.toFixed(2) + 'px');
        btn.style.setProperty('--my', cur.y.toFixed(2) + 'px');
        if (Math.abs(aim.x - cur.x) + Math.abs(aim.y - cur.y) > 0.05) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = 0;
          btn.style.setProperty('--mx', aim.x.toFixed(2) + 'px');
          btn.style.setProperty('--my', aim.y.toFixed(2) + 'px');
        }
      };
      var nudge = function () { if (!raf) raf = requestAnimationFrame(tick); };
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        aim.x = ((e.clientX - r.left) / r.width - 0.5) * 14;
        aim.y = ((e.clientY - r.top) / r.height - 0.5) * 9;
        nudge();
      });
      btn.addEventListener('pointerleave', function () { aim.x = 0; aim.y = 0; nudge(); });
    }
  }
  $$('.btn').forEach(inkButton);


  /* ══ 3. SUBRAYADOS, TACHONES Y NAV ═══════════════════════════
     Cada uno se traza aparte: ningún gesto se repite.            */
  $$('.paint').forEach(function (el, i) {
    var seed = 0.7 + i * 2.9;
    var sv = svgEl('ink-ul ink-ul--big', '0 0 100 20', true);
    pathEl(sv, swipe(seed, 1.4, 3), 'ink-ul__p ink-ul__p--1');
    pathEl(sv, swipe(seed + 1.1, 1.9, 1.4), 'ink-ul__p ink-ul__p--2');
    el.appendChild(sv);
  });

  $$('.strike').forEach(function (el, i) {
    var seed = 1.9 + i * 3.4;
    var sv = svgEl('ink-x', '0 0 100 30', true);
    pathEl(sv, slash(seed, 1), 'ink-x__p ink-x__p--1');
    pathEl(sv, slash(seed + 2.2, -1), 'ink-x__p ink-x__p--2');
    el.appendChild(sv);
  });

  $$('.nav__links a').forEach(function (a, i) {
    var sq = svgEl('squig', '0 0 100 12', true);
    pathEl(sq, swipe(4.3 + i * 2.6, 1.6, 1.8), 'squig__p');
    a.appendChild(sq);
  });


  /* ══ 4. LA CARTA ═════════════════════════════════════════════
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

  function dishMarkup(it, i) {
    var flag = it.tag ? '<span class="flag"><em>' + it.tag + '</em></span>' : '';
    return '<article class="dish" style="--d:' + i + '">' +
             '<h3 class="dish__name"><span class="dish__n">' + it.n + '</span>' + flag + '</h3>' +
             '<p class="dish__price"><span>' + it.p + ' €</span></p>' +
             '<p class="dish__desc">' + it.d + '</p>' +
           '</article>';
  }

  function inkDish(dish, n) {
    var seed = 2.4 + n * 1.77;
    var price = $('.dish__price', dish);
    if (price) ring(price, 'ink-ring ink-ring--price', seed, 0.05, 96, 24, 1);
    var name = $('.dish__n', dish);
    if (name) {
      var u = svgEl('ink-ul', '0 0 100 20', true);
      pathEl(u, swipe(seed, 1.1, 2.2), 'ink-ul__p');
      name.appendChild(u);
    }
    var flag = $('.flag', dish);
    if (flag) ring(flag, 'ink-ring ink-ring--flag', seed + 3, 0.07, 92, 22, 1);
  }

  function renderMenu(i) {
    current = i;
    listEl.innerHTML = MENU[i].items.map(dishMarkup).join('');
    listEl.setAttribute('aria-labelledby', 'tab-' + i);
    listEl.scrollLeft = 0;
    var dishes = $$('.dish', listEl);
    dishes.forEach(inkDish);
    if (dotsEl) $$('i', dotsEl).forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
    if (hasGSAP && !REDUCED) {
      gsap.fromTo(dishes,
        { opacity: 0, y: 14, clipPath: 'inset(0 0 100% 0)' },
        { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)', duration: .6, stagger: .04, ease: 'power3.out', overwrite: true });
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
             ' data-i="' + i + '"><span>' + c.label + '</span></button>';
    }).join('');
    if (dotsEl) dotsEl.innerHTML = MENU.map(function () { return '<i></i>'; }).join('');

    var tabs = $$('.tab', tabsEl);
    tabs.forEach(function (t, i) { ring(t, 'ink-ring ink-ring--tab', 5.1 + i * 1.4, 0.055, 100, 26, 2); });

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
    var data = {
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
    };
    var tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.textContent = JSON.stringify(data);
    document.head.appendChild(tag);
  })();


  /* ══ 5. LO MÁS PEDIDO ════════════════════════════════════════
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
        return '<li><b>' + it.n + '</b><span class="dot" aria-hidden="true"></span>' +
               '<span class="p">' + it.p + ' €</span></li>';
      });
    host.innerHTML = rows.join('');
  })();


  /* ══ 6. ABIERTO / CERRADO ════════════════════════════════════
     El horario vive en los data- del propio elemento, que son los
     mismos que el JSON-LD del <head>. */
  (function () {
    var el = $('#status');
    if (!el) return;
    var word = $('.status__word', el);
    var mins = function (hhmm) {
      var p = String(hhmm).split(':');
      return (+p[0]) * 60 + (+p[1] || 0);
    };
    function paint() {
      var now = new Date();
      var t = now.getHours() * 60 + now.getMinutes();
      var open = mins(el.dataset.open), close = mins(el.dataset.close);
      var isOpen = t >= open && t < close;
      el.classList.toggle('is-closed', !isOpen);
      if (!word) return;
      if (isOpen) word.textContent = t >= close - 60 ? 'Cerramos pronto' : 'Abierto ahora';
      else word.textContent = t < open ? 'Abrimos a las 9:00' : 'Cerrado por hoy';
    }
    paint();
    setInterval(paint, 60000);
  })();


  /* ══ 7. ACORDEÓN ═════════════════════════════════════════════
     Altura animada en píxeles y devuelta a `auto` al terminar,
     para que el texto siga fluyendo si cambia el ancho.          */
  (function () {
    var acc = $('#acc');
    if (!acc) return;
    var items = $$('.acc__item', acc).map(function (item, i) {
      var btn = $('.acc__btn', item);
      var panel = $('.acc__panel', item);
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


  /* ══ 8. RESERVA POR WHATSAPP ═════════════════════════════════
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


  /* ══ 9. SCROLL, NAV Y MENÚ MÓVIL ═════════════════════════════ */
  var lenis = null;
  if (window.Lenis && !REDUCED) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
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
    if (lenis) lenis.scrollTo(el, { duration: 1.2, offset: -70 });
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
        if (first) setTimeout(function () { first.focus(); }, 260);
      }
    });
  }

  // Se esconde al bajar y vuelve al subir; arriba del todo siempre está.
  if (nav) {
    var lastY = window.scrollY, ticking = false;
    var onScroll = function () {
      var y = window.scrollY;
      nav.classList.toggle('is-stuck', y > 40);
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

  /* Titulares por palabras: envuelve palabra a palabra sin destruir
     los <span> internos, así los brochazos y tachones sobreviven. */
  function wrapWords(el) {
    var out = document.createDocumentFragment();
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType === 3) {
        node.nodeValue.split(/(\s+)/).forEach(function (chunk) {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) { out.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span');
          w.className = 'w';
          var i = document.createElement('i');
          i.textContent = chunk;
          w.appendChild(i);
          out.appendChild(w);
        });
      } else {
        var w = document.createElement('span');
        w.className = 'w';
        var i = document.createElement('i');
        i.appendChild(node.cloneNode(true));
        w.appendChild(i);
        out.appendChild(w);
      }
    });
    el.innerHTML = '';
    el.appendChild(out);
  }
  $$('[data-split]').forEach(wrapWords);

  var yEl = $('#year');
  if (yEl) yEl.textContent = new Date().getFullYear();


  /* ══ 10. VÍDEOS ══════════════════════════════════════════════
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


  /* ══ 11. ANIMACIONES ═════════════════════════════════════════ */
  if (hasGSAP && !REDUCED) {
    // Entrada del hero
    gsap.from('.hero__lead > *', { opacity: 0, y: 22, duration: .9, stagger: .07, ease: 'power3.out', delay: .1 });
    gsap.from('.hero__media, .hero__ph1, .hero__status, .hero__ph2', {
      opacity: 0, y: 26, scale: .985, duration: 1, stagger: .07, ease: 'power3.out', delay: .25
    });

    // Titulares, palabra a palabra
    $$('[data-split]').forEach(function (h) {
      gsap.from($$('.w i', h), {
        yPercent: 110, duration: .95, ease: 'power4.out', stagger: .05,
        scrollTrigger: { trigger: h, start: 'top 90%' }
      });
    });

    // Tarjetas: entran desde abajo, escalonadas dentro de su rejilla
    gsap.utils.toArray('.local__grid, .reasons__grid, .gallery, .deal__grid, .visit__grid, .faq__grid, .bubbles').forEach(function (grid) {
      gsap.from(grid.children, {
        opacity: 0, y: 26, duration: .85, stagger: .06, ease: 'power3.out',
        scrollTrigger: { trigger: grid, start: 'top 88%' }
      });
    });

    gsap.utils.toArray('.carta__shell, .head > *, .carta__foot > *').forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 20, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });

    // Los trazos se dibujan, no aparecen recortados
    gsap.utils.toArray('.paint, .strike').forEach(function (el) {
      gsap.fromTo($$('path', el),
        { strokeDashoffset: 100 },
        { strokeDashoffset: 0, duration: .5, stagger: .1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%' } });
    });

    // Las fotos se asientan: entran con un pelín de zoom de más
    gsap.utils.toArray('.card--media > img').forEach(function (img) {
      gsap.from(img, { scale: 1.1, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: img, start: 'top 95%' } });
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
