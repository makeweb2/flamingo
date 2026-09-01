/* ============================================================
   FLAMINGO BRUNCH & FOOD — interacción
   ------------------------------------------------------------
   Sin build y sin dependencias obligatorias: GSAP y Lenis solo
   mejoran la entrada y el scroll. Si el CDN no responde, la
   carta se pinta, las pestañas cambian, el acordeón abre y el
   formulario envía igual.

   Índice
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
      { n: 'Cookie Pistacho', d: 'Rellena de pistacho, con chispas de chocolate blanco.', p: '4,50' },
      { n: 'Cookie Lotus', d: 'Rellena de Lotus, con chispas de chocolate negro.', p: '3,80' },
      { n: 'Cookie Oreo', d: 'Galleta de chocolate rellena de Oreo, con chispas de chocolate blanco.', p: '3,80' },
      { n: 'Cookie Kinder', d: 'Rellena de Kinder, con chispas de chocolate blanco.', p: '3,80' }
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
     carta, desaparece también de aquí en vez de quedarse colgado.
     Los tres primeros no son una elección nuestra: son los que el
     reparto publica como más vendidos (Club Sándwich, Crepe con pollo
     y el bowl de açaí, por ese orden). Detrás van la burger y la
     Matilda, que son las dos que la casa quiere enseñar. */
  (function () {
    var host = $('#dealList');
    if (!host) return;
    var PICK = ['Club Sándwich', 'Crepe con pollo', 'Bowl de Açaí', 'Flamingo Burger', 'Matilda'];
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
    // Lenis lleva su propio contador de scroll. El <head> ya ha subido el
    // nativo; si no se le sube también a él, arranca con la posición que
    // encuentre y devuelve la página a media altura.
    if (!location.hash) lenis.scrollTo(0, { immediate: true, force: true });
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

  /* Las tres fichas de "el local" están en baraja: la de encima tapa a
     las otras dos. Con ratón basta el :hover del CSS, pero en un móvil
     no hay ratón, así que al tocar una se saca del montón y se guardan
     las demás. Se toca otra vez y vuelve a su sitio. */
  (function () {
    var cards = $$('.thumbs li');
    if (!cards.length) return;
    cards.forEach(function (li) {
      li.addEventListener('click', function () {
        var was = li.classList.contains('is-out');
        cards.forEach(function (o) { o.classList.remove('is-out'); });
        if (!was) li.classList.add('is-out');
      });
    });
  })();

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

    /* Los reels no aparecen ni se desvanecen: suben desde detrás de su
       propio marco, que es exactamente el gesto con el que entra cada
       titular de la página —la línea sube desde detrás de su caja—.
       Aplicado a un vídeo: el marco ya está ahí, del rosa de los filos,
       y la imagen trepa dentro. Van uno detrás de otro, y el letrero de
       cada uno entra cuando su reel ya ha llegado.
       Se anima recortando (`clip-path`) y no moviendo la imagen, para no
       pisarle el transform al zoom que hacen las fotos al señalarlas. */
    (function () {
      var st = $$('.ig__r');
      if (!st.length) return;
      var r = getComputedStyle(document.documentElement)
                .getPropertyValue('--r').trim() || '18px';
      var trig = { trigger: '.ig__grid', start: 'top 88%' };
      gsap.from(st, {
        clipPath: 'inset(100% 0% 0% 0% round ' + r + ')',
        y: 26, duration: .9, ease: 'power3.out', stagger: .09,
        scrollTrigger: trig
      });
      /* `from` toma el valor final del estilo calculado, y el rótulo nace
         con opacidad 0 en `.ph`: se le dan los dos extremos a mano para
         que no acabe animando de 0 a 0. */
      gsap.fromTo($$('.ig__r figcaption'),
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: .5, ease: 'power2.out',
          stagger: .09, delay: .4, scrollTrigger: trig });
    })();

    /* El flamenco de la pared va un poco más lento que la página, como
       una figura pintada al fondo y no pegada encima: cuarenta píxeles
       en todo el recorrido, lo justo para que tenga profundidad sin que
       se note el truco. */
    (function () {
      var bird = $('.wall__bird');
      if (!bird) return;
      gsap.fromTo(bird, { y: 26 }, {
        y: -26, ease: 'none',
        scrollTrigger: { trigger: '.wall', start: 'top bottom', end: 'bottom top', scrub: .8 }
      });
    })();

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
