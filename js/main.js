/* ============================================================
   FLAMINGO — interaccion (GSAP + ScrollTrigger + Lenis)
   Sin pantalla de carga y sin cursor personalizado.
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ================= Botones =================================
     Cada botón se traza como si alguien lo hubiera rodeado con un
     rotulador: el contorno se genera a partir de un superelipse con
     una ondulación determinista (misma semilla = mismo trazo), la
     segunda pasada se dibuja al pasar por encima y los goterones
     caen con su propio retardo. El movimiento magnético y el cambio
     de etiqueta van por variables CSS para no pisarse entre sí.
     ========================================================== */
  var NS = 'http://www.w3.org/2000/svg';
  var BOX = { w: 220, h: 66 };

  // Ondulación suave y reproducible: tres senos desfasados por semilla.
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

  function svgEl(cls, viewBox, stretch) {
    var el = document.createElementNS(NS, 'svg');
    el.setAttribute('class', cls);
    el.setAttribute('viewBox', viewBox);
    if (stretch) el.setAttribute('preserveAspectRatio', 'none');
    el.setAttribute('aria-hidden', 'true');
    el.setAttribute('focusable', 'false');
    return el;
  }
  function pathEl(parent, d, cls) {
    var p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    if (cls) p.setAttribute('class', cls);
    p.setAttribute('pathLength', '100');
    parent.appendChild(p);
    return p;
  }

  var TAU = Math.PI * 2;

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
      var y = base + Math.sin(t * 6 + seed) * 1.5;
      d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
    }
    return d;
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


  document.querySelectorAll('.btn').forEach(function (btn, n) {
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

    // Contorno: relleno + primera pasada + segunda pasada (se dibuja al hover)
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

    // Imán: el botón se acerca un poco al cursor y vuelve a su sitio.
    // Lerp propio para escribir las variables con unidades y parar el bucle
    // en cuanto se asienta: nada corriendo de fondo sin necesidad.
    if (window.matchMedia('(hover:hover) and (pointer:fine)').matches && !REDUCED) {
      var cur = { x: 0, y: 0 }, aim = { x: 0, y: 0 }, raf = 0;
      function tick() {
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
      }
      function nudge() { if (!raf) raf = requestAnimationFrame(tick); }
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        aim.x = ((e.clientX - r.left) / r.width - 0.5) * 14;
        aim.y = ((e.clientY - r.top) / r.height - 0.5) * 9;
        nudge();
      });
      btn.addEventListener('pointerleave', function () { aim.x = 0; aim.y = 0; nudge(); });
    }
  });

  /* ---------------- Brochazos y tachones ----------------
     Cada uno se traza aparte: ningún subrayado repite el mismo gesto.  */
  document.querySelectorAll('.paint').forEach(function (el, i) {
    var seed = 0.7 + i * 2.9;
    var sv = svgEl('ink-ul ink-ul--big', '0 0 100 20', true);
    pathEl(sv, swipe(seed, 1.4, 3), 'ink-ul__p ink-ul__p--1');
    pathEl(sv, swipe(seed + 1.1, 1.9, 1.4), 'ink-ul__p ink-ul__p--2');
    el.appendChild(sv);
  });

  document.querySelectorAll('.strike').forEach(function (el, i) {
    var seed = 1.9 + i * 3.4;
    var sv = svgEl('ink-x', '0 0 100 30', true);
    pathEl(sv, slash(seed, 1), 'ink-x__p ink-x__p--1');
    pathEl(sv, slash(seed + 2.2, -1), 'ink-x__p ink-x__p--2');
    el.appendChild(sv);
  });

  /* Subrayado a mano en los enlaces del nav */
  document.querySelectorAll('.nav__links a').forEach(function (a, i) {
    var sq = svgEl('squig', '0 0 100 12', true);
    pathEl(sq, swipe(4.3 + i * 2.6, 1.6, 1.8), 'squig__p');
    a.appendChild(sq);
  });

  /* ---------------- Carta ---------------- */
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

  var tabsEl = document.getElementById('menuTabs');
  var listEl = document.getElementById('menuList');
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
    // el precio se rodea a rotulador
    var price = dish.querySelector('.dish__price');
    if (price) ring(price, 'ink-ring ink-ring--price', seed, 0.05, 96, 24, 1);
    // el nombre se subraya
    var name = dish.querySelector('.dish__n');
    if (name) {
      var u = svgEl('ink-ul', '0 0 100 20', true);
      pathEl(u, swipe(seed, 1.1, 2.2), 'ink-ul__p');
      name.appendChild(u);
    }
    // la etiqueta va rodeada
    var flag = dish.querySelector('.flag');
    if (flag) ring(flag, 'ink-ring ink-ring--flag', seed + 3, 0.07, 92, 22, 1);
  }

  function renderMenu(i) {
    current = i;
    listEl.innerHTML = MENU[i].items.map(dishMarkup).join('');
    listEl.setAttribute('aria-labelledby', 'tab-' + i);
    var dishes = listEl.querySelectorAll('.dish');
    dishes.forEach(inkDish);
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

    var tabs = Array.prototype.slice.call(tabsEl.querySelectorAll('.tab'));
    tabs.forEach(function (t, i) { ring(t, 'ink-ring ink-ring--tab', 5.1 + i * 1.4, 0.055, 100, 26, 2); });

    function select(i, focus) {
      if (i === current) { if (focus) tabs[i].focus(); return; }
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      renderMenu(i);
      if (focus) tabs[i].focus();
    }

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

  /* ---------------- Schema.org de la carta ----------------
     Se genera desde MENU para que nunca se desincronice del contenido.
     El dominio sale del canonical, así no hay que tocarlo dos veces.   */
  (function () {
    var canon = document.querySelector('link[rel="canonical"]');
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
              'offers': {
                '@type': 'Offer',
                'price': it.p.replace(',', '.'),
                'priceCurrency': 'EUR'
              }
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

  /* ---------------- Fondo WebGL ---------------- */
  if (window.FlamingoScene) window.FlamingoScene.init(document.getElementById('gl'));

  /* ---------------- Scroll suave ---------------- */
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
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var el = document.querySelector(a.getAttribute('href'));
    if (!el) return;
    e.preventDefault();
    closeDrawer();
    if (lenis) lenis.scrollTo(el, { duration: 1.2 });
    else el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
  });

  /* ---------------- Nav ---------------- */
  var nav = document.getElementById('nav');
  var burger = document.getElementById('burger');
  var drawer = document.getElementById('drawer');

  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    nav.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (burger) { burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); }
    if (lenis) lenis.start();
  }
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
        var first = drawer.querySelector('a');
        if (first) setTimeout(function () { first.focus(); }, 260);
      }
    });
  }
  // Filo inferior trazado a mano, se dibuja al despegarse del hero
  if (nav) {
    var edge = svgEl('nav__edge', '0 0 100 8', true);
    pathEl(edge, swipe(9.4, 1.1, 1.2), 'nav__edge__p');
    nav.appendChild(edge);
  }

  // Se esconde al bajar y vuelve al subir; arriba del todo siempre está.
  var lastY = window.scrollY, ticking = false;
  function onScroll() {
    var y = window.scrollY;
    nav.classList.toggle('is-stuck', y > 50);
    if (!drawer.classList.contains('is-open')) {
      var down = y > lastY && y > 220;
      nav.classList.toggle('is-hidden', down);
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  // Esc cierra el menú y el foco no se escapa del panel abierto
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
      if (burger) burger.focus();
    }
    if (e.key === 'Tab' && drawer.classList.contains('is-open')) {
      var f = drawer.querySelectorAll('a');
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------- Titulares por palabras ----------------
     Envuelve palabra a palabra sin destruir los <span> internos
     (los brochazos y tachones sobreviven).                      */
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
  document.querySelectorAll('[data-split]').forEach(wrapWords);

  /* ---------------- Vídeos ---------------- */
  document.querySelectorAll('.clip video').forEach(function (v) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { v.preload = 'auto'; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: .3 }).observe(v);
  });

  /* ---------------- Momentos ----------------
     Tira arrastrable con inercia, barra de avance trazada a mano y
     un marco de rotulador que se dibuja sobre el clip señalado.      */
  (function () {
    var strip = document.querySelector('.strip');
    if (!strip) return;

    strip.setAttribute('tabindex', '0');
    strip.setAttribute('role', 'region');
    strip.setAttribute('aria-label', 'Fotos y vídeos del local, desplazable en horizontal');

    // marco de rotulador en cada clip
    strip.querySelectorAll('.clip').forEach(function (c, i) {
      var cb = { w: 90, h: 160 };
      var f = svgEl('clip__frame', '0 0 90 160', true);
      pathEl(f, trace(7.7 + i * 1.9, 0.010, -0.3, TAU + 0.22, false, 44, 79, cb, 7), 'clip__frame__p');
      c.appendChild(f);
    });

    // avance
    var bar = document.querySelector('.strip-progress');
    if (bar) {
      var line = svgEl('strip-progress__ink', '0 0 100 10', true);
      pathEl(line, swipe(3.3, 0.9, 0), 'strip-progress__track');
      pathEl(line, swipe(3.3, 0.9, 0), 'strip-progress__fill');
      bar.appendChild(line);
    }
    var host = strip.closest('.moments') || strip;
    function progress() {
      var max = strip.scrollWidth - strip.clientWidth;
      host.style.setProperty('--p', max > 0 ? (strip.scrollLeft / max).toFixed(4) : 1);
    }
    strip.addEventListener('scroll', progress, { passive: true });
    window.addEventListener('resize', progress);
    progress();

    if (REDUCED) return;

    // arrastre con inercia
    var down = false, moved = 0, startX = 0, startScroll = 0, lastX = 0, vel = 0, raf = 0;
    function glide() {
      vel *= 0.94;
      strip.scrollLeft -= vel;
      if (Math.abs(vel) > 0.4) raf = requestAnimationFrame(glide);
      else raf = 0;
    }
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;      // el táctil ya va nativo
      down = true; moved = 0; vel = 0;
      startX = lastX = e.clientX;
      startScroll = strip.scrollLeft;
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      strip.classList.add('is-dragging');
      strip.setPointerCapture(e.pointerId);
    });
    strip.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      vel = e.clientX - lastX;
      lastX = e.clientX;
      strip.scrollLeft = startScroll - dx;
    });
    function release(e) {
      if (!down) return;
      down = false;
      strip.classList.remove('is-dragging');
      try { strip.releasePointerCapture(e.pointerId); } catch (err) {}
      if (Math.abs(vel) > 1) raf = requestAnimationFrame(glide);
    }
    strip.addEventListener('pointerup', release);
    strip.addEventListener('pointercancel', release);
    // tras arrastrar, el clic no debe contar
    strip.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);

    // rueda vertical -> avance horizontal cuando el cursor está encima
    strip.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var max = strip.scrollWidth - strip.clientWidth;
      var next = strip.scrollLeft + e.deltaY;
      if (next <= 0 || next >= max) return;        // en los extremos, sigue la página
      e.preventDefault();
      strip.scrollLeft = next;
    }, { passive: false });
  })();

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------------- Animaciones ---------------- */
  if (hasGSAP && !REDUCED) {
    // Entrada del hero
    gsap.from('.hero__title .ch', { yPercent: 110, duration: 1.1, stagger: .04, ease: 'power4.out', delay: .1 });
    gsap.from('.hero__place', { opacity: 0, y: -10, duration: .8, ease: 'power2.out', delay: .2 });
    gsap.from('.hero__sub', { opacity: 0, y: 18, duration: .9, ease: 'power3.out', delay: .55 });
    gsap.from('.hero__actions .btn', { opacity: 0, y: 18, duration: .8, stagger: .08, ease: 'power3.out', delay: .7 });
    gsap.from('.hero__logo', { opacity: 0, scale: .7, rotate: -14, duration: 1, ease: 'back.out(1.7)' });
    gsap.from('.hero__veil', { opacity: 0, duration: 1.4, ease: 'power2.out' });

    // Titulares
    document.querySelectorAll('[data-split]').forEach(function (h) {
      gsap.from(h.querySelectorAll('.w i'), {
        yPercent: 110, duration: .95, ease: 'power4.out', stagger: .05,
        scrollTrigger: { trigger: h, start: 'top 88%' }
      });
    });

    // Bloques
    gsap.utils.toArray('.eyebrow, .local__txt p, .facts, .info, .visit__actions, .note, .deliv, .foot__claim').forEach(function (el) {
      gsap.from(el, { opacity: 0, y: 20, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%' } });
    });

    // Brochazos y tachones: el trazo se dibuja, no aparece recortado
    gsap.utils.toArray('.paint, .strike').forEach(function (el) {
      gsap.fromTo(el.querySelectorAll('path'),
        { strokeDashoffset: 100 },
        {
          strokeDashoffset: 0, duration: .5, stagger: .1, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%' }
        });
    });

    // Fotos
    gsap.utils.toArray('.local__ph img').forEach(function (img) {
      gsap.from(img, { scale: 1.12, duration: 1.4, ease: 'power3.out', scrollTrigger: { trigger: img, start: 'top 94%' } });
    });

    // Los clips entran con un barrido, no con un fundido
    gsap.fromTo('.strip .clip',
      { clipPath: 'inset(0 0 100% 0)', y: 26 },
      {
        clipPath: 'inset(0 0 0% 0)', y: 0, duration: 1, stagger: .07, ease: 'power3.out',
        scrollTrigger: { trigger: '.strip', start: 'top 88%' }
      });
    gsap.from('.strip-progress', { opacity: 0, duration: .8, scrollTrigger: { trigger: '.strip', start: 'top 88%' } });

    // Pintada de la pared
    gsap.from('.wall__txt > *', {
      opacity: 0, y: 30, duration: 1, stagger: .09, ease: 'power4.out',
      scrollTrigger: { trigger: '.wall', start: 'top 70%' }
    });
    gsap.from('.doodle', {
      opacity: 0, scale: .4, rotate: -25, duration: .8, stagger: .12, ease: 'back.out(2)',
      scrollTrigger: { trigger: '.wall', start: 'top 65%' }
    });

    // El enlace de la sección en la que estás se queda subrayado
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
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
