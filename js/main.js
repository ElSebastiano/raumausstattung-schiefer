// Raumausstattung Schiefer – gemeinsame UI-Logik (Navigation, Dropdown, Footer-Jahr)
(function () {
  "use strict";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var isOpen = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!isOpen));
      toggle.setAttribute("aria-expanded", String(!isOpen));
      document.body.style.overflow = !isOpen ? "hidden" : "";
    });
  }

  document.querySelectorAll(".nav-dropdown").forEach(function (dropdown) {
    var btn = dropdown.querySelector(".nav-dropdown-toggle");
    if (!btn) return;

    function close() {
      dropdown.setAttribute("data-open", "false");
      btn.setAttribute("aria-expanded", "false");
    }
    function open() {
      dropdown.setAttribute("data-open", "true");
      btn.setAttribute("aria-expanded", "true");
    }

    btn.addEventListener("click", function () {
      var isOpen = dropdown.getAttribute("data-open") === "true";
      isOpen ? close() : open();
    });

    document.addEventListener("click", function (e) {
      if (!dropdown.contains(e.target)) close();
    });
    dropdown.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { close(); btn.focus(); }
    });
  });

  // Nav schließen, wenn eine mobile Nav-Link-Auswahl getroffen wird
  if (nav) {
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.setAttribute("data-open", "false");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  // Header bekommt Schatten/Kompaktstatus nach dem Scrollen
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Footer-Jahr automatisch aktuell halten
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  // Referenzen-Filter (nur auf referenzen.html vorhanden)
  var filterBar = document.querySelector("[data-filter-bar]");
  if (filterBar) {
    var chips = filterBar.querySelectorAll(".filter-chip");
    var cards = document.querySelectorAll("[data-filter-card]");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        var value = chip.getAttribute("data-filter");
        cards.forEach(function (card) {
          var tags = (card.getAttribute("data-filter-card") || "").split(" ");
          var show = value === "alle" || tags.indexOf(value) !== -1;
          card.style.display = show ? "" : "none";
        });
      });
    });
  }
})();
