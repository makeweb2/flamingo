/* ============================================================
   FLAMINGO — mural WebGL del hero (three.js)
   Los tres vídeos del local en tríptico, virados a rosa con
   duotono, grano y viñeta. Mientras cargan se ve papel cálido.
   ============================================================ */
window.FlamingoScene = (function () {
  'use strict';

  var VERT = 'varying vec2 vUv;\nvoid main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }';

  var FRAG = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform float uTime;',
    'uniform float uMix;',        // 0 = papel, 1 = mural de video
    'uniform vec2  uRes;',
    'uniform vec2  uMouse;',
    'uniform sampler2D uV0;',
    'uniform sampler2D uV1;',
    'uniform sampler2D uV2;',
    'uniform float uCols;',
    'uniform vec2  uVA;',         // relacion de aspecto de cada video
    'uniform vec3  uShadow;',
    'uniform vec3  uLight;',
    'uniform vec3  uPaper;',
    'uniform vec3  uWarm;',
    'uniform vec3  uBlush;',

    'float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }',
    'float vnoise(vec2 p){',
    '  vec2 i = floor(p), f = fract(p);',
    '  f = f * f * (3.0 - 2.0 * f);',
    '  float a = hash(i), b = hash(i + vec2(1.0, 0.0));',
    '  float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));',
    '  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);',
    '}',

    // uv de "cover" para una columna de ancho colW y alto uRes.y
    'vec2 coverUV(vec2 uv, float colAspect, float vidAspect, float zoom){',
    '  vec2 c = uv - 0.5;',
    '  if (colAspect > vidAspect) c.y *= vidAspect / colAspect;',
    '  else                       c.x *= colAspect / vidAspect;',
    '  return c / zoom + 0.5;',
    '}',

    'void main(){',
    '  vec2 uv = vUv;',

    // --- papel de base (lo que se ve antes de que arranquen los videos) ---
    '  vec3 paper = mix(uWarm, uPaper, smoothstep(-0.1, 0.9, uv.y));',
    '  float drift = vnoise(uv * vec2(2.2, 1.6) + uMouse * 0.06 + uTime * 0.012);',
    '  paper = mix(paper, uBlush, smoothstep(0.3, 0.95, drift + (1.0 - uv.y) * 0.3) * 0.4);',

    // --- triptico ---
    '  float colAspect = (uRes.x / uCols) / uRes.y;',
    '  float idx = floor(uv.x * uCols);',
    '  vec2 cuv = vec2(fract(uv.x * uCols), uv.y);',
    // deriva lenta tipo ken burns, distinta en cada columna
    '  float zoom = 1.045 + 0.035 * sin(uTime * 0.16 + idx * 2.1);',
    '  vec2 suv = coverUV(cuv, colAspect, uVA.x / uVA.y, zoom);',
    '  suv.y += sin(uTime * 0.09 + idx) * 0.012;',
    '  vec3 vid;',
    '  if (idx < 0.5)      vid = texture2D(uV0, suv).rgb;',
    '  else if (idx < 1.5) vid = texture2D(uV1, suv).rgb;',
    '  else                vid = texture2D(uV2, suv).rgb;',
    // el shader trabaja en lineal; el video llega en sRGB
    '  vid = pow(clamp(vid, 0.0, 1.0), vec3(2.2));',

    // --- viraje: duotono rosa sobre la luminancia ---
    '  float lum = dot(vid, vec3(0.2126, 0.7152, 0.0722));',
    '  lum = pow(clamp(lum, 0.0, 1.0), 0.7);',
    '  vec3 duo = mix(uShadow, uLight, smoothstep(0.04, 0.95, lum));',
    // un 18% del color original para que la comida no quede plana del todo
    '  vec3 graded = mix(duo, mix(duo, vid, 0.22), 0.88);',

    // juntas finas entre columnas, como tres pantallas
    '  float gap = min(smoothstep(0.0, 0.006, cuv.x), smoothstep(1.0, 0.994, cuv.x));',
    '  graded = mix(uPaper, graded, gap);',

    // --- mezcla papel / mural ---
    '  vec3 col = mix(paper, graded, uMix);',

    // viñeta y grano
    '  vec2 p = (uv - 0.5) * vec2(uRes.x / uRes.y, 1.0);',
    '  float d = length(p * vec2(0.9, 1.0));',
    '  col *= 1.0 - smoothstep(0.6, 1.35, d) * 0.2 * uMix;',
    '  col += (hash(uv * uRes) - 0.5) * 0.02;',

    '  gl_FragColor = vec4(col, 1.0);',
    '  #include <colorspace_fragment>',
    '}'
  ].join('\n');

  function init(canvas) {
    var root = document.documentElement;

    function toCSS() {
      root.classList.add('no-webgl');
      if (canvas) canvas.style.display = 'none';
    }

    // Abierto con doble clic (file://) el vídeo "mancha" la textura y el
    // navegador bloquea el WebGL: ahí el mural se pinta directamente en CSS.
    if (location.protocol === 'file:') { toCSS(); return null; }
    if (!window.THREE || !canvas) { toCSS(); return null; }

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: false, alpha: false });
    } catch (e) {
      toCSS();
      return null;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (renderer.outputColorSpace !== undefined) renderer.outputColorSpace = THREE.SRGBColorSpace;

    var vids = ['v0', 'v1', 'v2'].map(function (id) { return document.getElementById(id); });
    if (vids.some(function (v) { return !v; })) { toCSS(); return null; }

    var texs = vids.map(function (v) {
      var t = new THREE.VideoTexture(v);
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
      t.colorSpace = THREE.SRGBColorSpace;
      if (t.wrapS !== undefined) { t.wrapS = THREE.ClampToEdgeWrapping; t.wrapT = THREE.ClampToEdgeWrapping; }
      return t;
    });

    var scene = new THREE.Scene();
    var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    var U = {
      uTime:   { value: 0 },
      uMix:    { value: 0 },
      uRes:    { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uMouse:  { value: new THREE.Vector2(0, 0) },
      uV0:     { value: texs[0] },
      uV1:     { value: texs[1] },
      uV2:     { value: texs[2] },
      uCols:   { value: window.innerWidth < 760 ? 1 : 3 },
      uVA:     { value: new THREE.Vector2(9, 16) },
      uShadow: { value: new THREE.Color('#6b3140') },
      uLight:  { value: new THREE.Color('#ffd6e0') },
      uPaper:  { value: new THREE.Color('#fdfaf8') },
      uWarm:   { value: new THREE.Color('#f7f0ec') },
      uBlush:  { value: new THREE.Color('#f4dfe2') }
    };
    scene.add(new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: U, depthTest: false, depthWrite: false })
    ));

    // En pantallas estrechas el mural es de una sola columna: los otros
    // dos vídeos ni se reproducen ni se descargan.
    function active() { return U.uCols.value === 1 ? vids.slice(0, 1) : vids; }
    vids.slice(1).forEach(function (v) { if (U.uCols.value === 1) v.preload = 'none'; });

    // arranca la reproducción en cuanto se pueda (autoplay silenciado)
    active().forEach(function (v) {
      var go = function () { var p = v.play(); if (p && p.catch) p.catch(function () {}); };
      go();
      v.addEventListener('loadeddata', go, { once: true });
    });
    document.addEventListener('click', function once() {
      active().forEach(function (v) { if (v.paused) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } });
      document.removeEventListener('click', once);
    });

    var mouse = new THREE.Vector2(), target = new THREE.Vector2();
    var running = true, clock = new THREE.Clock();

    window.addEventListener('pointermove', function (e) {
      target.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
    }, { passive: true });
    window.addEventListener('resize', function () {
      renderer.setSize(window.innerWidth, window.innerHeight);
      U.uRes.value.set(window.innerWidth, window.innerHeight);
      var cols = window.innerWidth < 760 ? 1 : 3;
      if (cols !== U.uCols.value) {
        U.uCols.value = cols;
        active().forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); });
        if (cols === 1) vids.slice(1).forEach(function (v) { v.pause(); });
      }
    });
    document.addEventListener('visibilitychange', function () {
      running = !document.hidden;
      if (document.hidden) vids.forEach(function (v) { v.pause(); });
      else active().forEach(function (v) { var p = v.play(); if (p && p.catch) p.catch(function () {}); });
    });

    function ready() {
      return active().every(function (v) { return v.readyState >= 2 && v.videoWidth > 0; });
    }

    function frame(dt, t) {
      mouse.x += (target.x - mouse.x) * 0.03;
      mouse.y += (target.y - mouse.y) * 0.03;
      U.uTime.value = t;
      U.uMouse.value.set(mouse.x, mouse.y);

      if (ready()) {
        U.uVA.value.set(vids[0].videoWidth, vids[0].videoHeight);
        U.uMix.value = Math.min(1, U.uMix.value + dt * 0.9);   // fundido desde el papel
      }
      renderer.render(scene, cam);
    }

    var dead = false;
    function safeFrame(dt, t) {
      if (dead) return;
      try {
        frame(dt, t);
      } catch (err) {
        dead = true;
        toCSS();
      }
    }

    if (reduced) {
      // sin bucle: un fotograma cuando los vídeos tengan imagen
      var tries = 0;
      (function once() {
        if (ready() || tries++ > 40) { U.uMix.value = ready() ? 1 : 0; safeFrame(0, 0); return; }
        setTimeout(once, 120);
      })();
    } else {
      (function loop() {
        if (dead) return;
        requestAnimationFrame(loop);
        if (!running) return;
        safeFrame(Math.min(clock.getDelta(), 0.05), clock.elapsedTime);
      })();
    }

    return { uniforms: U };
  }

  return { init: init };
})();
