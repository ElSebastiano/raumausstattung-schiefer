/*
 * Raumausstattung Schiefer – Hero-Interaktion (Variante C: 2.5D-Ersatz)
 * Vanilla JS, keine externen Bibliotheken. Reagiert auf Scroll (Parallaxe der
 * Bild-/Licht-/Partikelebenen) und dezent auf Mauspointer (nur Desktop).
 * Deaktiviert sich vollständig bei prefers-reduced-motion und pausiert
 * außerhalb des Viewports (IntersectionObserver) aus Performance-Gründen.
 */
(function () {
  "use strict";

  var hero = document.querySelector("[data-hero]");
  if (!hero) return;

  var media = hero.querySelector(".hero-media");
  var sweep = hero.querySelector(".hero-lightsweep");
  var particles = hero.querySelector(".hero-particles");
  var stage = hero.querySelector(".hero-stage");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  var inView = true;
  var ticking = false;
  var pointer = { x: 0, y: 0 };
  var targetPointer = { x: 0, y: 0 };

  if (reduceMotion) return; // statisches Bild bleibt, keine Animationslogik nötig

  // Dekorative Staubpartikel generieren (rein visuell, aria-hidden im Markup)
  if (particles && !particles.dataset.filled) {
    var count = window.innerWidth < 780 ? 8 : 16;
    for (var i = 0; i < count; i++) {
      var span = document.createElement("span");
      span.style.setProperty("--x", Math.random() * 100 + "%");
      span.style.setProperty("--y", Math.random() * 100 + "%");
      span.style.setProperty("--s", 2 + Math.random() * 3 + "px");
      span.style.setProperty("--dur", 10 + Math.random() * 10 + "s");
      span.style.setProperty("--delay", Math.random() * 6 + "s");
      particles.appendChild(span);
    }
    particles.dataset.filled = "true";
  }

  function render() {
    ticking = false;
    if (!inView) return;

    var rect = hero.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    var progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;

    // Hintergrundbild: langsamere Scrollbewegung + leichte Skalierung (Tiefenwirkung)
    var mediaY = progress * -40; // px
    var mediaScale = 1.06 + progress * 0.05;
    var pointerShiftX = isCoarsePointer ? 0 : pointer.x * 8;
    var pointerShiftY = isCoarsePointer ? 0 : pointer.y * 6;
    if (media) {
      media.style.transform =
        "translate3d(" + pointerShiftX.toFixed(2) + "px," + (mediaY + pointerShiftY).toFixed(2) + "px,0) scale(" + mediaScale.toFixed(3) + ")";
    }

    // Lichtkegel gleitet unabhängig, schneller als der Hintergrund, über die Szene
    if (sweep) {
      var sweepX = -20 + progress * 140;
      var sweepShiftX = isCoarsePointer ? 0 : pointer.x * 14;
      sweep.style.transform = "translate3d(" + (sweepX + sweepShiftX).toFixed(2) + "%," + (progress * -10).toFixed(2) + "%,0)";
    }

    // Partikelebene bewegt sich am langsamsten -> stärkster Tiefeneindruck
    if (particles) {
      particles.style.transform = "translate3d(" + (pointer.x * 4).toFixed(2) + "px," + (progress * -18).toFixed(2) + "px,0)";
    }
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  document.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);

  if (!isCoarsePointer) {
    stage.addEventListener("pointermove", function (e) {
      var rect = stage.getBoundingClientRect();
      targetPointer.x = (e.clientX - rect.left) / rect.width - 0.5;
      targetPointer.y = (e.clientY - rect.top) / rect.height - 0.5;
      pointer.x += (targetPointer.x - pointer.x) * 0.4;
      pointer.y += (targetPointer.y - pointer.y) * 0.4;
      requestTick();
    });
    stage.addEventListener("pointerleave", function () {
      pointer.x = 0; pointer.y = 0;
      requestTick();
    });
  }

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        inView = entry.isIntersecting;
        if (inView) requestTick();
      });
    }, { threshold: 0 });
    io.observe(hero);
  }

  render();
})();
