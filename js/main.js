/* ============================================================
   FLAMINGO BRUNCH & FOOD — interacción
   ------------------------------------------------------------
   Sin build y sin dependencias obligatorias: GSAP y Lenis solo
   mejoran la entrada y el scroll. Si el CDN no responde, la
   carta se pinta igual y las pestañas siguen funcionando.

   Índice
     1. Carta: datos, pestañas y JSON-LD
     2. Franja de rótulo
     3. Nav y menú móvil
     4. Vídeos
     5. Entradas
   ============================================================ */
(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGSAP = !!window.gsap;
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };


  /* ══ 1. LA CARTA ═════════════════════════════════════════════
     Un único array alimenta la lista, las pestañas y el JSON-LD
     del menú, así que nunca se desincronizan.                  */
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
  var current = 0;

  function dishMarkup(it) {
    var tag = it.tag ? '<span class="tag">' + it.tag + '</span>' : '';
    return '<article class="dish">' +
             '<h3 class="dish__name">' + it.n + tag + '</h3>' +
             '<p class="dish__price">' + it.p + ' €</p>' +
             '<p class="dish__desc">' + it.d + '</p>' +
           '</article>';
  }

  function renderMenu(i) {
    current = i;
    listEl.innerHTML = MENU[i].items.map(dishMarkup).join('');
    listEl.setAttribute('aria-labelledby', 'tab-' + i);
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


  /* ══ 2. FRANJA DE RÓTULO ═════════════════════════════════════
     El contenido se duplica en JS: la animación desplaza la mitad
     exacta, así que las dos copias tienen que existir para que el
     bucle no dé un salto. Duplicar a mano invita a olvidarse. */
  (function () {
    var row = $('#ticker');
    if (!row) return;
    var WORDS = ['Brunch todo el día', 'Café de especialidad', 'Repostería casera', 'Terraza en la plaza'];
    var once = WORDS.map(function (w) { return '<span>' + w + '</span><i>✳</i>'; }).join('');
    row.innerHTML = once + once;
  })();


  /* ══ 3. NAV Y MENÚ MÓVIL ═════════════════════════════════════ */
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
    if (lenis) lenis.scrollTo(el, { duration: 1.1, offset: -66 });
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


  /* ══ 4. VÍDEOS ═══════════════════════════════════════════════
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


  /* ══ 5. ENTRADAS ═════════════════════════════════════════════
     Un solo gesto en toda la página: los titulares suben línea a
     línea, recortados por su propia caja. Nada más se anima.    */
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

  if (hasGSAP && !REDUCED) {
    lined.forEach(function (h) {
      gsap.from($$('.ln > span', h), {
        yPercent: 108, duration: 1, ease: 'power4.out', stagger: .07,
        scrollTrigger: { trigger: h, start: 'top 92%' }
      });
    });

    gsap.utils.toArray('.cell--media').forEach(function (c) {
      gsap.from(c, {
        opacity: 0, duration: .9, ease: 'power2.out',
        scrollTrigger: { trigger: c, start: 'top 94%' }
      });
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
