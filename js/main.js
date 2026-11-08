/* ============================================================
   FLAMINGO BRUNCH & FOOD — interacción
   ------------------------------------------------------------
   Sin build y sin dependencias: el scroll es el nativo del navegador.

   Índice
     1. Carta: datos, pestañas y JSON-LD
     2. Lo más pedido
     3. Tienda: productos para recoger
     4. Pedido por WhatsApp
     5. Reseñas
     6. Acordeón (+ FAQPage)
     7. Reserva por WhatsApp
     8. Flores
     9. Nav, scroll y menú móvil
    10. Vídeos y entradas
   ============================================================ */
(function () {
  'use strict';

  /* Teléfono que recibe pedidos y reservas: formato internacional, sin +. */
  var TEL = '34607020554';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  /* == 1. LA CARTA ==========================================
     Un único array alimenta la carta, la tienda, "lo más pedido" y
     el JSON-LD: nunca se desincronizan. */
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


  /* Patrón de pestañas compartido por la carta y la tienda. */
  function makeTabs(host, labels, prefix, label, onChange) {
    var cur = 0;
    host.setAttribute('role', 'tablist');
    host.setAttribute('aria-label', label);
    host.innerHTML = labels.map(function (l, i) {
      return '<button type="button" class="tab' + (i === 0 ? ' is-active' : '') + '" id="' + prefix + i + '"' +
             ' role="tab" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '"' +
             ' data-i="' + i + '">' + esc(l) +
             '<svg class="tab__fl" viewBox="-50 -50 100 100" aria-hidden="true"><use href="#f-rosa" x="-50" y="-50" width="100" height="100"/></svg></button>';
    }).join('');
    var els = $$('.tab', host);
    function select(i, focus) {
      if (i !== cur) {
        cur = i;
        els.forEach(function (t, k) {
          var on = k === i;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
        });
        onChange(i);
      }
      if (focus) els[i].focus();
    }
    host.addEventListener('click', function (e) {
      var b = e.target.closest('.tab');
      if (b) select(+b.dataset.i, false);
    });
    host.addEventListener('keydown', function (e) {
      var i = els.indexOf(document.activeElement);
      if (i < 0) return;
      var to = null;
      if (e.key === 'ArrowRight') to = (i + 1) % els.length;
      else if (e.key === 'ArrowLeft') to = (i - 1 + els.length) % els.length;
      else if (e.key === 'Home') to = 0;
      else if (e.key === 'End') to = els.length - 1;
      if (to === null) return;
      e.preventDefault();
      select(to, true);
    });
  }

  (function () {
    var tabsEl = $('#menuTabs');
    var listEl = $('#menuList');
    if (!tabsEl || !listEl) return;
    listEl.setAttribute('role', 'tabpanel');
    listEl.setAttribute('tabindex', '0');

    function render(i) {
      listEl.innerHTML = MENU[i].items.map(function (it, k) {
        var tag = it.tag ? '<span class="tag--dish">' + it.tag + '</span>' : '';
        return '<article class="dish" style="--i:' + k + '">' +
                 '<h3 class="dish__n">' + it.n + tag + '</h3>' +
                 '<p class="dish__p">' + it.p + ' €</p>' +
                 '<p class="dish__d">' + it.d + '</p>' +
               '</article>';
      }).join('');
      listEl.setAttribute('aria-labelledby', 'tab-' + i);
    }
    makeTabs(tabsEl, MENU.map(function (c) { return c.label; }), 'tab-', 'Categorías de la carta', render);
    render(0);
  })();

  /* JSON-LD del menú: toma el dominio del canonical. */
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

  var byName = {};
  MENU.forEach(function (s) { s.items.forEach(function (it) { byName[it.n] = it; }); });

  /* == 2. LO MÁS PEDIDO ====================================== */
  (function () {
    var host = $('#dealList');
    if (!host) return;
    var PICK = ['Club Sándwich', 'Crepe con pollo', 'Bowl de Açaí', 'Flamingo Burger', 'Matilda'];
    host.innerHTML = PICK.map(function (n) { return byName[n]; })
      .filter(Boolean)
      .map(function (it) { return '<li><b>' + it.n + '</b><span class="p">' + it.p + ' €</span></li>'; })
      .join('');
  })();

  /* == 3. TIENDA =============================================
     SHOP agrupa las secciones de MENU en los estantes de la vitrina.
     Precio y nombre salen siempre de MENU. FOTOS es opcional: un plato
     con foto real la enseña, y el resto se presenta solo con texto. */
  var SHOP = [
    { label: 'Dulces',              from: ['Dulces'] },
    { label: 'Bowls y desayunos',   from: ['Bowls'] },
    { label: 'Brunch',              from: ['Brunch', 'Tostas', 'Pancakes'] },
    { label: 'Burgers y compartir', from: ['Burgers', 'Compartir'] },
    { label: 'Café y bebidas',      from: ['Bebidas'] }
  ];
  var FOTOS = {
    'Bowl de Açaí': 'assets/img/reel1-poster.jpg',
    'Cafés clásicos': 'assets/img/reel3-poster.jpg'
  };
  var KEY = 'flamingo.pedido.v1';
  var MAX = 20;

  var cents = function (it) { return Math.round(parseFloat(it.p.replace(',', '.')) * 100); };
  var eur = function (c) { return (c / 100).toFixed(2).replace('.', ',') + ' €'; };

  var cart = (function () {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY)) || {};
      var out = {};
      Object.keys(raw).forEach(function (n) {
        var q = parseInt(raw[n], 10);
        if (byName[n] && q > 0) out[n] = Math.min(q, MAX);
      });
      return out;
    } catch (e) { return {}; }
  })();

  function save() { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (e) {} }
  function count() { return Object.keys(cart).reduce(function (a, n) { return a + cart[n]; }, 0); }
  function total() { return Object.keys(cart).reduce(function (a, n) { return a + cents(byName[n]) * cart[n]; }, 0); }

  var grid = $('#shopGrid');
  var aviso = $('#aviso');

  function prodMarkup(it, k) {
    var foto = FOTOS[it.n] ? '<figure class="prod__ph"><img src="' + FOTOS[it.n] + '" alt="" loading="lazy" decoding="async"></figure>' : '';
    var n = esc(it.n);
    return '<article class="prod" style="--i:' + k + '" data-n="' + n + '">' + foto +
      '<h3 class="prod__n">' + n + '</h3>' +
      '<p class="prod__d">' + esc(it.d) + '</p>' +
      '<div class="prod__foot"><span class="prod__p">' + it.p + ' €</span>' +
        '<button type="button" class="btn btn--sm prod__add" data-a="add" aria-label="Añadir ' + n + ' al pedido">Añadir</button>' +
        '<span class="qty" role="group" aria-label="Cantidad de ' + n + '" hidden>' +
          '<button type="button" data-a="dec" aria-label="Quitar uno de ' + n + '">−</button><output>0</output>' +
          '<button type="button" data-a="inc" aria-label="Añadir otro de ' + n + '">+</button>' +
        '</span></div>' +
      '<svg class="prod__bloom" viewBox="-50 -50 100 100" aria-hidden="true" style="--a:#F7A8C0;--b:#EE7FA6;--c:#C93D78"><use href="#f-rosa" x="-50" y="-50" width="100" height="100"/></svg>' +
    '</article>';
  }

  function paintCard(card) {
    var q = cart[card.dataset.n] || 0;
    card.classList.toggle('is-sel', q > 0);
    $('.prod__add', card).hidden = q > 0;
    $('.qty', card).hidden = q === 0;
    $('output', card).textContent = q;
  }

  function renderShelf(i) {
    var items = [];
    SHOP[i].from.forEach(function (lab) {
      MENU.forEach(function (s) { if (s.label === lab) items = items.concat(s.items); });
    });
    grid.innerHTML = items.map(prodMarkup).join('');
    grid.setAttribute('aria-labelledby', 'shop-' + i);
    $$('.prod', grid).forEach(paintCard);
  }

  function setQty(name, q) {
    q = Math.max(0, Math.min(q, MAX));
    if (q) cart[name] = q; else delete cart[name];
    save();
    paint();
  }

  function replay(el, cls) {
    el.classList.remove(cls);
    void el.getBoundingClientRect();
    el.classList.add(cls);
  }

  if (grid) {
    makeTabs($('#shopTabs'), SHOP.map(function (s) { return s.label; }), 'shop-', 'Estantes de la tienda', renderShelf);
    renderShelf(0);

    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]');
      if (!b) return;
      var card = b.closest('.prod');
      var name = card.dataset.n;
      var q = cart[name] || 0;
      var a = b.dataset.a;

      if (a === 'dec') {
        setQty(name, q - 1);
        if (q - 1 === 0) $('.prod__add', card).focus();
        aviso.textContent = name + ': ' + (q - 1) + ' en el pedido.';
        return;
      }
      setQty(name, q + 1);
      if (a === 'add') $('[data-a="inc"]', card).focus();
      replay(card, 'is-added');
      $$('[data-cuenta]').forEach(function (c) { replay(c, 'is-bump'); });
      aviso.textContent = name + ' añadido. ' + count() + ' en el pedido, ' + eur(total()) + '.';
    });
  }

  /* == 4. PEDIDO POR WHATSAPP ================================
     Sin servidor: el mensaje se compone aquí y se abre en WhatsApp,
     hacia TEL. El pedido llega cuando el cliente pulsa enviar.     */
  var OPEN = 9 * 60, CLOSE = 21 * 60, STEP = 15, LEAD = 30, DAYS = 7;

  var cesta = $('#cesta');
  var form = $('#pedidoForm');
  var lineas = $('#cestaLineas');
  var viewFull = $('#cestaLlena'), viewEmpty = $('#cestaVacia'), viewOk = $('#cestaOk');
  var errEl = $('#pedidoError');
  var lastFocus = null;
  var sent = false;

  function hhmm(m) { return Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); }

  function slots(offset) {
    var now = new Date();
    var nowMin = now.getHours() * 60 + now.getMinutes();
    var start = offset === 0 ? Math.max(OPEN, Math.ceil((nowMin + LEAD) / STEP) * STEP) : OPEN;
    var out = [];
    for (var m = start; m <= CLOSE - STEP; m += STEP) out.push(m);
    return out;
  }

  function dayFor(offset) {
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + offset);
    return d;
  }

  function fillDays() {
    var sel = form.elements.dia;
    var prev = sel.value;
    var html = '';
    for (var i = 0; i < DAYS; i++) {
      if (!slots(i).length) continue;
      var full = dayFor(i).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
      var pre = i === 0 ? 'Hoy, ' : i === 1 ? 'Mañana, ' : '';
      html += '<option value="' + i + '" data-full="' + full + '">' + pre + full + '</option>';
    }
    sel.innerHTML = html;
    if ($('option[value="' + prev + '"]', sel)) sel.value = prev;
    fillHours();
  }

  function fillHours() {
    var sel = form.elements.hora;
    var prev = sel.value;
    sel.innerHTML = slots(parseInt(form.elements.dia.value, 10) || 0).map(function (m) {
      return '<option>' + hhmm(m) + '</option>';
    }).join('');
    if ($$('option', sel).some(function (o) { return o.value === prev; })) sel.value = prev;
  }

  function showView(v) {
    [viewFull, viewEmpty, viewOk].forEach(function (x) { x.hidden = x !== v; });
  }

  function paintLines() {
    var names = Object.keys(cart);
    var active = document.activeElement;
    var keep = active && active.closest && active.closest('.linea')
      ? { n: active.closest('.linea').dataset.n, a: active.dataset.a } : null;

    lineas.innerHTML = names.map(function (n) {
      var e = esc(n);
      return '<li class="linea" data-n="' + e + '"><span class="linea__n">' + e + '</span>' +
        '<span class="qty" role="group" aria-label="Cantidad de ' + e + '">' +
          '<button type="button" data-a="dec" aria-label="Quitar uno de ' + e + '">−</button><output>' + cart[n] + '</output>' +
          '<button type="button" data-a="inc" aria-label="Añadir otro de ' + e + '">+</button>' +
        '</span><span class="linea__p">' + eur(cents(byName[n]) * cart[n]) + '</span></li>';
    }).join('');
    $('#cestaTotal').textContent = eur(total());

    if (keep) {
      var row = $$('.linea', lineas).filter(function (l) { return l.dataset.n === keep.n; })[0];
      var target = row ? $('[data-a="' + keep.a + '"]', row) : $('#cestaCerrar');
      if (target) target.focus();
    }
  }

  function paint() {
    var c = count(), t = eur(total());
    $$('[data-cuenta]').forEach(function (el) { el.textContent = c; });
    $$('[data-total]').forEach(function (el) { el.textContent = t; });
    var bar = $('#pedbar');
    if (bar) bar.hidden = c === 0 || (cesta && cesta.open);
    if (grid) $$('.prod', grid).forEach(paintCard);
    if (lineas) paintLines();
    if (cesta && cesta.open && !sent) showView(c ? viewFull : viewEmpty);
  }

  function openCesta() {
    lastFocus = document.activeElement;
    sent = false;
    fillDays();
    showView(count() ? viewFull : viewEmpty);
    cesta.showModal();
    paint();
  }

  function onClosed() {
    paint();
    if (lastFocus && lastFocus.focus && !lastFocus.hidden) lastFocus.focus();
  }

  function pedidoError(msg, field) {
    errEl.textContent = msg;
    errEl.hidden = false;
    if (field) { field.classList.add('is-bad'); field.focus(); }
  }

  function buildMessage(ref, nombre, cuando, nota) {
    var rows = Object.keys(cart).map(function (n) {
      return cart[n] + ' x ' + n + ' (' + eur(cents(byName[n]) * cart[n]) + ')';
    });
    return 'Hola Flamingo, quiero encargar para recoger en el local.\n\n' +
      '*Pedido ' + ref + '*\n' + rows.join('\n') + '\n\n' +
      '*Total: ' + eur(total()) + '*\n\n' +
      'Nombre: ' + nombre + '\n' +
      'Recogida: ' + cuando +
      (nota ? '\nNota: ' + nota : '') +
      '\n\n(Enviado desde la web. Pago al recoger.)';
  }

  if (cesta && form) {
    $$('[data-abrir-pedido]').forEach(function (b) { b.addEventListener('click', openCesta); });
    $('#cestaCerrar').addEventListener('click', function () { cesta.close(); });

    /* Sin el scroll simulado hay que evitar a mano que la página de
       detrás se mueva con la cesta abierta. */
    var quieta = function (e) {
      if (e.target === cesta || cesta.scrollHeight <= cesta.clientHeight) e.preventDefault();
    };
    cesta.addEventListener('wheel', quieta, { passive: false });
    cesta.addEventListener('touchmove', quieta, { passive: false });
    cesta.addEventListener('close', onClosed);
    cesta.addEventListener('click', function (e) { if (e.target === cesta) cesta.close(); });

    $('#cestaSeguir').addEventListener('click', function () {
      cesta.close();
      var t = $('#tienda');
      if (t) t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
    });

    lineas.addEventListener('click', function (e) {
      var b = e.target.closest('[data-a]');
      if (!b) return;
      var name = b.closest('.linea').dataset.n;
      setQty(name, (cart[name] || 0) + (b.dataset.a === 'inc' ? 1 : -1));
      aviso.textContent = name + ': ' + (cart[name] || 0) + ' en el pedido.';
    });

    form.elements.dia.addEventListener('change', fillHours);
    form.addEventListener('input', function (e) {
      e.target.classList.remove('is-bad');
      errEl.hidden = true;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nombre = form.elements.nombre.value.trim();
      if (!count()) return pedidoError('Añade algún producto para enviar el pedido.');
      if (!nombre) return pedidoError('Escribe el nombre con el que recogerás el pedido.', form.elements.nombre);
      var opt = form.elements.dia.selectedOptions[0];
      if (!opt || !form.elements.hora.value) return pedidoError('Elige el día y la hora de recogida.', form.elements.dia);

      var ref = 'FL-' + String(Date.now()).slice(-4);
      var cuando = opt.dataset.full + ' a las ' + form.elements.hora.value;
      var url = 'https://wa.me/' + TEL + '?text=' +
        encodeURIComponent(buildMessage(ref, nombre, cuando, form.elements.nota.value.trim()));

      var a = $('#okWa');
      a.href = url;
      a.click();

      sent = true;
      $('#okRef').textContent = ref;
      showView(viewOk);
      var ramo = $('#okRamo');
      var flores = ramoItems(300, 200, 12, Date.now() % 1000);
      var planta = ramo._planta || plantar(ramo, function () { return { w: 300, h: 200, items: flores }; });
      planta.build = function () { return { w: 300, h: 200, items: flores }; };
      medir(planta);
      florecer(planta);
      cesta.scrollTop = 0;
    });

    $('#okNuevo').addEventListener('click', function () {
      cart = {};
      save();
      form.reset();
      sent = false;
      cesta.close();
    });
  }

  /* == 5. RESEÑAS ============================================
     Solo reseñas reales, copiadas de Google con permiso del local:
     { autor: 'Nombre', fecha: 'marzo de 2026', nota: 5, texto: '…' }
     Con el array vacío la fila de tarjetas no aparece. */
  var RESENAS = [];

  (function () {
    var host = $('#resenasCards');
    if (!host || !RESENAS.length) return;
    host.innerHTML = RESENAS.map(function (r) {
      var birds = '';
      for (var i = 1; i <= 5; i++) {
        birds += '<svg viewBox="0 0 262 464"' + (i <= r.nota ? ' class="on"' : '') + '><use href="#bird"/></svg>';
      }
      return '<article class="resena"><div class="resena__rate" role="img" aria-label="' + r.nota + ' flamencos de 5">' + birds + '</div>' +
        '<blockquote>' + esc(r.texto) + '</blockquote>' +
        '<footer>' + esc(r.autor) + ', ' + esc(r.fecha) + ', en Google</footer></article>';
    }).join('');
    host.hidden = false;
  })();

  /* == 6. ACORDEÓN =========================================== */
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
      };
      if (REDUCED) done();
      else it.panel.addEventListener('transitionend', done);
    }

    items.forEach(function (it) {
      if (!REDUCED) it.panel.style.transition = 'height .42s cubic-bezier(.22,1,.36,1)';
      it.btn.addEventListener('click', function () {
        var wasOpen = it.btn.getAttribute('aria-expanded') === 'true';
        items.forEach(close);
        if (!wasOpen) open(it);
      });
    });

    var faq = items.map(function (it) {
      return {
        '@type': 'Question',
        'name': it.btn.textContent.replace(/\s+/g, ' ').trim(),
        'acceptedAnswer': { '@type': 'Answer', 'text': it.panel.textContent.replace(/\s+/g, ' ').trim() }
      };
    });
    if (faq.length) {
      var tag = document.createElement('script');
      tag.type = 'application/ld+json';
      tag.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', 'inLanguage': 'es-ES', 'mainEntity': faq });
      document.head.appendChild(tag);
    }
  })();

  /* == 7. RESERVA POR WHATSAPP =============================== */
  (function () {
    var f = $('#bookForm');
    if (!f) return;
    var err = $('#formError');

    function fail(msg, field) {
      err.textContent = msg;
      err.hidden = false;
      if (field) { field.classList.add('is-bad'); field.focus(); }
    }

    f.addEventListener('input', function (e) {
      e.target.classList.remove('is-bad');
      err.hidden = true;
    });

    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = f.elements.nombre, day = f.elements.dia, pax = f.elements.personas, msg = f.elements.mensaje;
      if (!name.value.trim())    return fail('Dinos tu nombre para saber a quién guardamos la mesa.', name);
      if (!day.value.trim())     return fail('¿Qué día y a qué hora te esperamos?', day);
      var n = parseInt(pax.value, 10);
      if (!n || n < 1 || n > 30) return fail('Pon cuántas personas sois (de 1 a 30).', pax);

      var text = 'Hola Flamingo, soy ' + name.value.trim() + '.\n' +
                 'Quería mesa para ' + n + (n === 1 ? ' persona' : ' personas') + ' el ' + day.value.trim() + '.' +
                 (msg.value.trim() ? '\n' + msg.value.trim() : '') +
                 '\n\n(Enviado desde la web)';
      window.open('https://wa.me/' + TEL + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  })();

  /* == 8. FLORES =============================================
     El arco, las guirnaldas y los ramos salen de las mismas piezas
     del sprite (#f-rosa, #f-clavel, #f-peonia, #f-capullo, #f-hoja,
     #f-gipso), repartidas con un azar con semilla: siempre iguales. */
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  var PAL = [
    ['#F7A8C0', '#EE7FA6', '#C93D78'],
    ['#FBCFDC', '#F5A9C1', '#DE6C99'],
    ['#E8457F', '#C92763', '#8E1248'],
    ['#FFF0F3', '#FAD2DD', '#EFA3BA'],
    ['#F48CB1', '#E25F92', '#A92462']
  ];
  var VERDES = [['#5C7A50', '#47633E', '#35502F'], ['#7E9A68', '#5C7A50', '#47633E'], ['#D98BA6', '#C56D8C', '#A9516F']];

  /* Cada flor se dibuja una sola vez en un sprite y las composiciones
     se estampan en un <canvas>. En SVG eran 1.752 flores con decenas de
     trazos cada una que el navegador repintaba al hacer scroll (27 fps).
     Terminada la floración, un canvas es una imagen quieta.            */
  var DEG = Math.PI / 180;
  var U = 2.2, R = 55; // píxeles de sprite por unidad y radio dibujado
  var PETALO = new Path2D('M0 6C-20 -4 -27 -34 0 -46C27 -34 20 -4 0 6Z');
  var ESPIRAL = new Path2D('M-3 0a3 3 0 1 1 3 3');
  var CAPULLO = new Path2D('M0 -34C16 -22 18 -4 0 8C-18 -4 -16 -22 0 -34Z');
  var CAP_LIN = new Path2D('M0 -30C8 -18 8 -4 0 8');
  var SEPALO = new Path2D('M0 22C-12 18 -15 6 -11 -6C-6 2 -3 6 0 8C3 6 6 2 11 -6C15 6 12 18 0 22Z');
  var HOJA = new Path2D('M0 44C-24 18 -24 -18 0 -46C24 -18 24 18 0 44Z');
  var VENAS = new Path2D('M0 40V-38M0 16L-11 4M0 16L11 4M0 -6L-10 -18M0 -6L10 -18');
  var GIPSO = [[0, 0, 7], [-17, -8, 5], [15, -14, 5.5], [-6, -24, 4.5], [20, 8, 4.5], [-20, 13, 5], [3, 20, 5], [-30, -20, 3.2], [30, -28, 3.2], [-32, 24, 3], [24, 28, 3]];

  function festón(rad, rIn, n) {
    var pts = [], i;
    for (i = 0; i < n * 2; i++) {
      var a = Math.PI * i / n, r0 = i % 2 ? rIn : rad;
      pts.push([r0 * Math.cos(a), r0 * Math.sin(a)]);
    }
    var path = new Path2D();
    path.moveTo(pts[0][0], pts[0][1]);
    for (i = 1; i < pts.length; i += 2) {
      var e = pts[(i + 1) % pts.length];
      path.quadraticCurveTo(pts[i][0] * 1.22, pts[i][1] * 1.22, e[0], e[1]);
    }
    path.closePath();
    return path;
  }
  var CLAVEL = [festón(42, 38, 13), festón(30, 26, 11), festón(18, 15, 9)];

  function trazo(c, path, fill, stroke, w) {
    if (fill) { c.fillStyle = fill; c.fill(path); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = w; c.stroke(path); }
  }
  function corona(c, n, sc, rot, fill, stroke) {
    for (var i = 0; i < n; i++) {
      c.save();
      c.rotate((rot + i * 360 / n) * DEG);
      c.scale(sc, sc);
      trazo(c, PETALO, fill, stroke, 1.5);
      c.restore();
    }
  }
  function disco(c, x, y, r, fill, stroke, w) {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = fill;
    c.fill();
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = w; c.stroke(); }
  }
  function girado(c, deg, fn) { c.save(); c.rotate(deg * DEG); fn(); c.restore(); }

  var DIBUJO = {
    rosa: function (c, a, b, d) {
      corona(c, 6, 1, 0, a, d); corona(c, 5, .7, 30, b, d); corona(c, 4, .42, 10, a, d);
      disco(c, 0, 0, 7, d);
      trazo(c, ESPIRAL, null, a, 1.4);
    },
    peonia: function (c, a, b, d) {
      corona(c, 9, 1.06, 0, a, d); corona(c, 8, .8, 20, b, d); corona(c, 7, .56, 8, a, d); corona(c, 5, .34, 40, b, d);
      disco(c, 0, 0, 6, '#E9B949', d, 1);
    },
    clavel: function (c, a, b, d) {
      trazo(c, CLAVEL[0], a, d, 1.5);
      girado(c, 14, function () { trazo(c, CLAVEL[1], b, d, 1.5); });
      girado(c, 30, function () { trazo(c, CLAVEL[2], a, d, 1.5); });
      disco(c, 0, 0, 5, d);
    },
    capullo: function (c, a, b, d) {
      trazo(c, CAPULLO, a, d, 1.5);
      trazo(c, CAP_LIN, null, d, 1.4);
      trazo(c, SEPALO, '#5C7A50');
    },
    hoja: function (c, a, b, d) {
      trazo(c, HOJA, a, d, 1.2);
      trazo(c, VENAS, null, d, 1.1);
    },
    gipso: function (c, a, b) {
      GIPSO.forEach(function (g) { disco(c, g[0], g[1], g[2], '#FFFBF9', b, 1); });
    }
  };

  var sprites = {};
  function sprite(kind, pal) {
    var key = kind + pal[0];
    if (sprites[key]) return sprites[key];
    var cv = document.createElement('canvas');
    cv.width = cv.height = Math.ceil(R * 2 * U);
    var c = cv.getContext('2d');
    c.setTransform(U, 0, 0, U, R * U, R * U);
    c.lineJoin = 'round';
    c.lineCap = 'round';
    DIBUJO[kind](c, pal[0], pal[1], pal[2]);
    return (sprites[key] = cv);
  }

  function pick(r, arr) { return arr[Math.floor(r() * arr.length)]; }

  /* Reparte flores a lo largo de pt(t), con t de 0 a 1. Las grandes
     primero, para que las pequeñas queden encima. */
  function scatter(pt, opts) {
    var r = rng(opts.seed);
    var out = [];
    function layer(n, kinds, pals, smin, smax, spread) {
      for (var i = 0; i < n; i++) {
        var p = pt((i + r()) / n);
        var x = p.x + (r() - .5) * spread, y = p.y + (r() - .5) * spread;
        var s = smin + r() * (smax - smin), rot = r() * 360, kind = pick(r, kinds), pal = pick(r, pals);
        out.push({ x: x, y: y, s: s, rot: rot, img: sprite(kind, pal), d: p.d != null ? p.d + r() * 120 : r() * 700 });
      }
    }
    var k = opts.k || 1;
    layer(Math.round(56 * k), ['hoja'], VERDES, .55, 1, opts.spread * 1.5);
    layer(Math.round(34 * k), ['peonia', 'rosa'], PAL, opts.big * .8, opts.big, opts.spread);
    layer(Math.round(44 * k), ['clavel', 'rosa'], PAL, opts.big * .5, opts.big * .75, opts.spread * 1.15);
    layer(Math.round(26 * k), ['capullo', 'gipso'], PAL, opts.big * .45, opts.big * .7, opts.spread * 1.3);
    return out;
  }

  function ramoItems(w, h, n, seed) {
    return scatter(function (t) {
      var a = Math.PI * (.08 + t * .84);
      return { x: w / 2 - Math.cos(a) * w * .36, y: h * .68 - Math.sin(a) * h * .34 };
    }, { seed: seed, spread: 46, big: .62, k: n / 40 });
  }

  /* Plantas: cada composición con su canvas. `build` devuelve su lienzo
     lógico y sus flores, y se repite si cambia el ancho de la ventana. */
  var plantas = [];
  var activas = [];
  var latiendo = false;

  function plantar(host, build) {
    var cv = document.createElement('canvas');
    host.appendChild(cv);
    var e = { host: host, cv: cv, c: cv.getContext('2d'), build: build, items: [], t0: null, visto: false };
    host._planta = e;
    plantas.push(e);
    medir(e);
    return e;
  }

  function medir(e) {
    var w = e.host.offsetWidth, h = e.host.offsetHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var data = e.build(w, h);
    e.items = data.items;
    var s = data.slice ? Math.max(w / data.w, h / data.h) : w / data.w;
    var pad = data.slice ? 0 : Math.ceil(95 * s);
    e.s = s;
    e.dpr = dpr;
    e.ox = (data.slice ? (w - data.w * s) / 2 : 0) + pad;
    e.oy = pad;
    e.cv.style.left = e.cv.style.top = -pad + 'px';
    e.cv.style.width = (w + pad * 2) + 'px';
    e.cv.style.height = (h + pad * 2) + 'px';
    e.cv.width = Math.round((w + pad * 2) * dpr);
    e.cv.height = Math.round((h + pad * 2) * dpr);
  }

  function escala(p) {
    if (p < .7) { var q = 1 - p / .7; return 1.1 * (1 - q * q * q); }
    return 1.1 - .1 * (p - .7) / .3;
  }

  /* Pinta el estado en `now`; sin floración en curso, el estado final. */
  function pintar(e, now) {
    var c = e.c, k = e.s * e.dpr, listo = true;
    var maxX = e.cv.width + 130 * k, maxY = e.cv.height + 130 * k;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, e.cv.width, e.cv.height);
    c.imageSmoothingQuality = 'high';
    for (var i = 0; i < e.items.length; i++) {
      var it = e.items[i], sc = 1, giro = 0;
      if (e.t0 !== null) {
        var p = (now - e.t0 - it.d) / 720;
        if (p <= 0) { listo = false; continue; }
        if (p < 1) { listo = false; sc = escala(p); giro = -50 * Math.max(0, 1 - p / .7); }
      }
      var X = (it.x * e.s + e.ox) * e.dpr, Y = (it.y * e.s + e.oy) * e.dpr;
      if (X < -130 * k || Y < -130 * k || X > maxX || Y > maxY) continue;
      var S = it.s * sc * k, a = (it.rot + giro) * DEG, co = Math.cos(a) * S, si = Math.sin(a) * S;
      c.setTransform(co, si, -si, co, X, Y);
      c.drawImage(it.img, -R, -R, R * 2, R * 2);
    }
    return listo;
  }

  function latido(now) {
    activas = activas.filter(function (e) {
      if (!pintar(e, now)) return true;
      e.t0 = null;
      return false;
    });
    if (activas.length) requestAnimationFrame(latido);
    else latiendo = false;
  }

  function florecer(e) {
    e.visto = true;
    if (REDUCED) { e.t0 = null; pintar(e, 0); return; }
    e.t0 = performance.now();
    if (activas.indexOf(e) < 0) activas.push(e);
    if (!latiendo) { latiendo = true; requestAnimationFrame(latido); }
  }

  function marchitar(e) {
    activas = activas.filter(function (x) { return x !== e; });
    e.t0 = null;
    e.visto = false;
    e.c.setTransform(1, 0, 0, 1, 0, 0);
    e.c.clearRect(0, 0, e.cv.width, e.cv.height);
  }

  (function () {
    var arco = $('#arco');
    if (arco) {
      var L = 700 + 400 + 700;
      var pt = function (t) {
        var s = t * L, x, y;
        if (s < 700) { x = 76; y = 830 - s; }
        else if (s < 1100) { x = 76 + (s - 700) * 448 / 400; y = 130 - Math.sin((s - 700) / 400 * Math.PI) * 30; }
        else { x = 524; y = 130 + (s - 1100); }
        return { x: x, y: y, d: 150 + Math.min(s, L - s) / (L / 2) * 1150 };
      };
      var arcoK = window.innerWidth < 720 ? 1.05 : 1.55;
      var items = scatter(pt, { seed: 7, spread: 100, big: .9, k: arcoK });
      florecer(plantar(arco, function () { return { w: 600, h: 820, items: items }; }));
    }

    $$('[data-flores="esquina"]').forEach(function (el) {
      var items = scatter(function (t) {
        var s = Math.abs(t - .5) * 2, len = 250 * s;
        return t < .5 ? { x: 20, y: 20 + len, d: s * 600 } : { x: 20 + len, y: 20, d: s * 600 };
      }, { seed: +el.dataset.seed || 9, spread: 46, big: .62, k: .3 });
      plantar(el, function () { return { w: 300, h: 300, items: items }; });
    });

    /* La puerta de las reseñas: el arco sigue el marco real, medido en
       píxeles, para que no se deforme en ningún ancho. */
    $$('[data-flores="porton"]').forEach(function (el) {
      plantar(el, function (W, H) {
        var box = el.getBoundingClientRect();
        var hoja = el.parentNode.querySelector('.porton__hoja').getBoundingClientRect();
        var fuera = W < 520 ? 18 : 10; // el arco va por fuera del marco, sin pisar el texto
        var l = hoja.left - box.left - fuera, r = hoja.right - box.left + fuera, top = hoja.top - box.top - fuera, bot = hoja.bottom - box.top;
        var leg = bot - top, span = r - l, T = 2 * leg + span;
        return { w: W, h: H, items: scatter(function (t) {
          var s = t * T, x, y;
          if (s < leg) { x = l; y = bot - s; }
          else if (s < leg + span) { x = l + s - leg; y = top; }
          else { x = r; y = top + s - leg - span; }
          return { x: x, y: y, d: 100 + Math.min(s, T - s) / (T / 2) * 900 };
        }, { seed: +el.dataset.seed || 19, spread: W < 520 ? 24 : 58, big: W < 520 ? .34 : .62, k: W < 520 ? .6 : 1.1 }) };
      });
    });

    $$('[data-flores="ramo"]').forEach(function (el) {
      var items = ramoItems(300, 200, 16, +el.dataset.seed || 3);
      plantar(el, function () { return { w: 300, h: 200, items: items }; });
    });

    $$('[data-flores="guirnalda"]').forEach(function (el) {
      var items = scatter(function (t) {
        return { x: t * 1600, y: 14 + Math.abs(Math.sin(t * Math.PI * 5)) * 44, d: t * 1100 };
      }, { seed: +el.dataset.seed || 5, spread: 34, big: .5, k: 1.15 });
      plantar(el, function () { return { w: 1600, h: 120, items: items, slice: true }; });
    });

    /* Al cambiar el ancho se recoloca todo en su estado final. */
    var ancho = window.innerWidth, espera = null;
    window.addEventListener('resize', function () {
      clearTimeout(espera);
      espera = setTimeout(function () {
        if (window.innerWidth === ancho) return;
        ancho = window.innerWidth;
        plantas.forEach(function (e) {
          if (!e.host.offsetWidth) return;
          medir(e);
          if (e.visto && e.t0 === null) pintar(e, 0);
        });
      }, 160);
    }, { passive: true });
  })();

  /* == 9. NAV, SCROLL Y MENÚ MÓVIL =========================== */
  var nav = $('#nav');
  var burger = $('#burger');
  var drawer = $('#drawer');

  function setDrawer(open) {
    drawer.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    // Las flores del menú florecen cada vez que se abre.
    $$('.flores', drawer).forEach(function (f) {
      if (!f._planta) return;
      if (open) florecer(f._planta); else marchitar(f._planta);
    });
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.id === 'okWa') return;
    var href = a.getAttribute('href');
    var el = href.length > 1 ? document.querySelector(href) : null;
    if (!el) return;
    e.preventDefault();
    setDrawer(false);
    el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
  });

  var menuQuieto = function (e) {
    if (drawer.scrollHeight <= drawer.clientHeight) e.preventDefault();
  };
  drawer.addEventListener('wheel', menuQuieto, { passive: false });
  drawer.addEventListener('touchmove', menuQuieto, { passive: false });

  burger.addEventListener('click', function () {
    var open = !drawer.classList.contains('is-open');
    setDrawer(open);
    if (open) {
      nav.classList.remove('is-hidden');
      setTimeout(function () { $('a', drawer).focus(); }, 240);
    }
  });

  (function () {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (!drawer.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 240);
        lastY = y;
        ticking = false;
      });
    }, { passive: true });
  })();

  document.addEventListener('keydown', function (e) {
    if (!drawer.classList.contains('is-open')) return;
    if (e.key === 'Escape') { setDrawer(false); burger.focus(); return; }
    if (e.key === 'Tab') {
      var f = $$('a', drawer);
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  var yEl = $('#year');
  if (yEl) yEl.textContent = new Date().getFullYear();

  /* Abierto o cerrado ahora, siempre en hora de Elche. */
  (function () {
    var el = $('#abierto');
    if (!el || !window.Intl) return;
    try {
      var parts = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var get = function (t) { return parseInt(parts.filter(function (p) { return p.type === t; })[0].value, 10); };
      var m = get('hour') * 60 + get('minute');
      el.textContent = (m >= OPEN && m < CLOSE) ? 'Abierto ahora, hasta las 21:00.' : 'Cerrado ahora. Abrimos a las 9:00.';
    } catch (e) {}
  })();

  /* == 10. VÍDEOS Y ENTRADAS ================================= */
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

  function splitLines(el) {
    var out = document.createDocumentFragment();
    el.innerHTML.split(/<br\s*\/?>/i).forEach(function (chunk, i) {
      var ln = document.createElement('span');
      ln.className = 'ln';
      ln.style.setProperty('--l', i);
      var inner = document.createElement('span');
      inner.innerHTML = chunk.trim();
      ln.appendChild(inner);
      out.appendChild(ln);
    });
    el.innerHTML = '';
    el.appendChild(out);
  }
  $$('[data-lines]').forEach(splitLines);

  (function () {
    var targets = $$('[data-lines],[data-r],.flores[data-flores]').filter(function (t) { return !t.closest('.drawer'); });
    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (t) {
        t.classList.add('is-in');
        if (t._planta) florecer(t._planta);
      });
      return;
    }
    $$('.ventanal, .reels').forEach(function (group) {
      $$('[data-r]', group).forEach(function (el, i) { el.style.setProperty('--d', (i % 4) * 60 + 'ms'); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        if (en.target._planta) florecer(en.target._planta);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px', threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });

    var links = $$('.dp');
    links.forEach(function (a, i) { a.style.setProperty('--i', i); });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (l) { l.classList.toggle('is-current', l.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (s) spy.observe(s);
    });

    // Los pétalos solo caen mientras la portada está a la vista.
    var front = $('.front');
    if (front) new IntersectionObserver(function (entries) {
      front.classList.toggle('is-on', entries[0].isIntersecting);
    }).observe(front);
  })();

  paint();
})();
