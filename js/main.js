/* ============================================
   Festival Pewma Antü — Lógica principal
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
  initNavbarScroll();
  initMobileMenu();
  initDropdowns();
  initSmoothScroll();
  initHeroCarousel();
  initCountdown();
  initScrollReveal();
  initBackToTop();
  initParticipantsMap();
  initChileRouteMap();
  initReviewForm();
  initBackgroundMusic();
});

/* ---------- Himno al iniciar la página ----------
   Los navegadores bloquean el audio automático con sonido, así que:
   1) se intenta reproducir al cargar;
   2) si el navegador lo bloquea, arranca en la primera interacción del visitante.
   El botón flotante permite pausar/reanudar en cualquier momento. */
function initBackgroundMusic() {
  const audio = document.querySelector("#himno audio");
  const btn = document.getElementById("musicToggle");
  if (!audio) return;

  audio.volume = 0.55;

  function syncBtn() {
    if (!btn) return;
    btn.classList.toggle("is-playing", !audio.paused);
    btn.setAttribute("aria-pressed", String(!audio.paused));
    btn.setAttribute("aria-label", audio.paused ? "Reproducir el himno" : "Pausar el himno");
  }

  function tryPlay() {
    const p = audio.play();
    return p && p.catch ? p : Promise.resolve();
  }

  audio.addEventListener("play", syncBtn);
  audio.addEventListener("pause", syncBtn);

  // 1) Intento al cargar (la mayoría de los navegadores lo bloquean)
  tryPlay().catch(() => {});

  // 2) Respaldo: arranca en la primera interacción real del visitante.
  //    Los listeners solo se retiran cuando la reproducción realmente comenzó,
  //    porque eventos como el scroll no habilitan el audio en los navegadores.
  const eventos = ["pointerdown", "keydown", "touchstart", "click"];
  const limpiar = () => eventos.forEach((e) => window.removeEventListener(e, alInteractuar));
  function alInteractuar() {
    if (audio.dataset.detenidoPorUsuario) { limpiar(); return; }
    if (!audio.paused) { limpiar(); return; }
    tryPlay().then(limpiar).catch(() => {}); // si falla, seguimos esperando
  }
  eventos.forEach((e) => window.addEventListener(e, alInteractuar, { passive: true }));

  // Botón flotante
  if (btn) {
    btn.addEventListener("click", () => {
      if (audio.paused) {
        delete audio.dataset.detenidoPorUsuario;
        audio.play();
      } else {
        audio.dataset.detenidoPorUsuario = "1"; // no reanudar automáticamente
        audio.pause();
      }
    });
  }

  syncBtn();
}

/* ---------- Formulario de reseñas ---------- */
const WHATSAPP_NUMERO = "56944760296"; // número del festival (formato internacional sin +)

function initReviewForm() {
  const form = document.getElementById("reviewForm");
  if (!form) return;

  const stars = Array.from(document.querySelectorAll(".review-stars__star"));
  const ratingInput = document.getElementById("rvRating");
  const errorEl = document.getElementById("reviewError");
  let rating = 0;

  function paint(v) {
    stars.forEach((s) => s.classList.toggle("is-active", Number(s.dataset.value) <= v));
  }

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      rating = Number(star.dataset.value);
      ratingInput.value = rating;
      paint(rating);
    });
    star.addEventListener("mouseenter", () => paint(Number(star.dataset.value)));
  });
  document.getElementById("reviewStars")?.addEventListener("mouseleave", () => paint(rating));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("rvNombre").value.trim();
    const lugar = document.getElementById("rvLugar").value.trim();
    const mensaje = document.getElementById("rvMensaje").value.trim();

    if (!nombre || !mensaje) {
      errorEl.textContent = "Por favor completa tu nombre y tu experiencia.";
      errorEl.hidden = false;
      return;
    }
    errorEl.hidden = true;

    const estrellas = rating ? "⭐".repeat(rating) + " (" + rating + "/5)" : "Sin calificación";
    let texto = "¡Hola! Quiero dejar mi reseña del Festival Pewma Antü:\n\n";
    texto += "Nombre: " + nombre + "\n";
    if (lugar) texto += "Lugar: " + lugar + "\n";
    texto += "Calificación: " + estrellas + "\n";
    texto += "Experiencia: " + mensaje;

    const url = "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(texto);
    window.open(url, "_blank", "noopener");
  });
}

/* ---------- Navbar: sólida al hacer scroll ---------- */
function initNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const toggleScrolled = () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  toggleScrolled();
  window.addEventListener("scroll", toggleScrolled, { passive: true });
}

/* ---------- Menú hamburguesa (móvil) ---------- */
function initMobileMenu() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación");
  });

  // Cierra el menú al elegir un link simple (no los toggles de submenú)
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* ---------- Menús desplegables (El Festival, Programación, Galería) ---------- */
function initDropdowns() {
  const dropdowns = document.querySelectorAll(".navbar__item--dropdown");

  dropdowns.forEach((item) => {
    const btn = item.querySelector(".navbar__dropdown-toggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(isOpen));

      // Cierra los demás desplegables abiertos
      dropdowns.forEach((other) => {
        if (other !== item) {
          other.classList.remove("is-open");
          other.querySelector(".navbar__dropdown-toggle")?.setAttribute("aria-expanded", "false");
        }
      });
    });
  });

  // Cierra los desplegables al hacer clic fuera de la navbar
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".navbar__item--dropdown")) {
      dropdowns.forEach((item) => {
        item.classList.remove("is-open");
        item.querySelector(".navbar__dropdown-toggle")?.setAttribute("aria-expanded", "false");
      });
    }
  });
}

/* ---------- Scroll suave para anclas internas ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ---------- Carrusel del hero ---------- */
function initHeroCarousel() {
  const carousel = document.getElementById("heroCarousel");
  if (!carousel) return;

  const slides = Array.from(carousel.querySelectorAll(".hero__slide"));
  const dots = Array.from(carousel.querySelectorAll(".hero__dot"));
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");

  let current = 0;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY = 6000;

  function goToSlide(index) {
    slides[current].classList.remove("hero__slide--active");
    dots[current].classList.remove("hero__dot--active");
    dots[current].setAttribute("aria-selected", "false");

    current = (index + slides.length) % slides.length;

    slides[current].classList.add("hero__slide--active");
    dots[current].classList.add("hero__dot--active");
    dots[current].setAttribute("aria-selected", "true");
  }

  function next() { goToSlide(current + 1); }
  function prev() { goToSlide(current - 1); }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(next, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  prevBtn?.addEventListener("click", () => { prev(); startAutoplay(); });
  nextBtn?.addEventListener("click", () => { next(); startAutoplay(); });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goToSlide(Number(dot.dataset.index));
      startAutoplay();
    });
  });

  carousel.addEventListener("mouseenter", stopAutoplay);
  carousel.addEventListener("mouseleave", startAutoplay);

  // Swipe táctil en móvil
  let touchStartX = 0;
  carousel.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  carousel.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const delta = touchEndX - touchStartX;
    const SWIPE_THRESHOLD = 50;

    if (delta > SWIPE_THRESHOLD) prev();
    else if (delta < -SWIPE_THRESHOLD) next();

    startAutoplay();
  }, { passive: true });

  startAutoplay();
}

/* ---------- Contador regresivo ---------- */
function initCountdown() {
  // Fecha objetivo: 14 de enero de 2027, 00:00 hora de Chile (inicio del festival)
  // Editar esta constante para cambiar la fecha del próximo festival.
  const TARGET_DATE = new Date("2027-01-14T00:00:00-03:00");

  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  function pad(n) { return String(n).padStart(2, "0"); }

  function update() {
    const now = new Date();
    let diff = TARGET_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);

    daysEl.textContent = pad(days);
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  update();
  const timer = setInterval(update, 1000);
}

/* ---------- Animaciones al hacer scroll ---------- */
function initScrollReveal() {
  const elements = document.querySelectorAll(".fade-in");
  if (!elements.length) return;

  if (!("IntersectionObserver" in window)) {
    elements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
  );

  elements.forEach((el) => observer.observe(el));
}

/* ---------- Botón volver arriba ---------- */
function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;

  const toggleVisibility = () => {
    btn.classList.toggle("is-visible", window.scrollY > 500);
  };

  toggleVisibility();
  window.addEventListener("scroll", toggleVisibility, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ---------- Mapa de países participantes ---------- */
/* Datos extraídos del Excel de participantes. Editar aquí para actualizar.
   x / y son porcentajes (0–100) sobre el mapa, según la posición geográfica aproximada. */
const COLORES_ANIO = {
  2025: "#4FD1C5", // teal
  2026: "#FFD84D", // dorado
  2027: "#B473C0", // violeta
};

const PARTICIPANTES = [
  { pais: "México",    flag: "🇲🇽", x: 22.8, y: 12.5, anio: 2026, grupo: "BAFODAVI",                         ig: "https://www.instagram.com/bafodavi/" },
  { pais: "Honduras",  flag: "🇭🇳", x: 37.1, y: 18.7, anio: 2027, grupo: "Grupo Folklórico Pasión UNAH VOAE", ig: "https://www.instagram.com/pasionunah/" },
  { pais: "Costa Rica",flag: "🇨🇷", x: 40.8, y: 23.6, anio: 2025, grupo: "Corteza Amarilla",                  ig: "https://www.instagram.com/corteza_amarillaa/" },
  { pais: "Panamá",    flag: "🇵🇦", x: 46.4, y: 24.7, anio: 2027, grupo: "Academia Panamá y lo Nuestro",      ig: "https://www.instagram.com/panama_y_lonuestro/" },
  { pais: "Colombia",  flag: "🇨🇴", x: 52.9, y: 29.8, anio: 2025, grupo: "Andares Colombianos",              ig: "https://www.instagram.com/andares_colombianos/" },
  { pais: "Ecuador",   flag: "🇪🇨", x: 47.6, y: 35.5, anio: 2026, grupo: "Kiamaru",                          ig: "https://www.instagram.com/kiamaru_ec/" },
  { pais: "Perú",      flag: "🇵🇪", x: 49.4, y: 49.4, anio: 2025, grupo: "Acuarelas del Perú",               ig: "https://www.instagram.com/acuarelasdelperu/" },
  { pais: "Bolivia",   flag: "🇧🇴", x: 60.1, y: 54.7, anio: 2026, grupo: "Estudio de Danza Pacha",           ig: "https://www.instagram.com/esdanz_pacha/" },
  { pais: "Brasil",    flag: "🇧🇷", x: 84.5, y: 53.9, anio: 2027, grupo: "Grupo de Cultura Os Cariris",      ig: "https://www.instagram.com/os_cariris/" },
  { pais: "Paraguay",  flag: "🇵🇾", x: 72.8, y: 65.1, anio: 2025, grupo: "Tajy Poty",                        ig: "https://www.instagram.com/tajy.poty024/" },
  { pais: "Argentina", flag: "🇦🇷", x: 71.8, y: 76.0, anio: 2026, grupo: "Agrupación Folklórica De Raíz",    ig: "https://www.instagram.com/de.raiz.arg_/" },
  { pais: "Uruguay",   flag: "🇺🇾", x: 74.5, y: 76.4, anio: 2027, grupo: "Ballet Folklórico Ypykuéra",       ig: "https://www.instagram.com/ypykuera.uy/" },
];

const CHILE = { pais: "Chile", flag: "🇨🇱", x: 57, y: 74.7 };

const NACIONALES = [
  { grupo: "BAFONAN",                              comuna: "Nancagua",       ig: "https://www.instagram.com/bafonanoficial/" },
  { grupo: "Grupo de Danza Folklórica Maulikan",   comuna: "Rancagua",       ig: "https://www.instagram.com/maulikan.oficial/" },
  { grupo: "Las Acacias Ballet Folklórico",        comuna: "Curicó",         ig: "https://www.instagram.com/lasacacias.bfm/" },
  { grupo: "Corporación Cultural Romeral",         comuna: "Romeral",        ig: "https://www.instagram.com/culturaromeral/" },
  { grupo: "Walmapu Compañía Folklórica",          comuna: "Macul",          ig: "https://www.instagram.com/walmapu.cl/" },
  { grupo: "Ballet Folklórico de Llay Llay",       comuna: "Llay Llay",      ig: "https://www.instagram.com/ballet.llay_llay/" },
  { grupo: "DANFORES",                             comuna: "Renca",          ig: "https://www.instagram.com/danfore_renca/" },
  { grupo: "Agrupación Folklórica Alborada",       comuna: "Padre Hurtado",  ig: "https://www.instagram.com/agrupacion.alborada/" },
];

function initParticipantsMap() {
  const map = document.getElementById("worldMap");
  const linesSvg = document.getElementById("mapLines");
  const tooltip = document.getElementById("mapTooltip");
  const legend = document.getElementById("mapLegend");
  const nationalsGrid = document.getElementById("nationalsGrid");
  if (!map || !tooltip) return;

  let activePin = null;

  // --- Anillos tipo radar alrededor de Chile (sede) ---
  [3, 6, 9].forEach((r, i) => {
    const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("cx", CHILE.x);
    ring.setAttribute("cy", CHILE.y);
    ring.setAttribute("r", r);
    ring.setAttribute("fill", "none");
    ring.setAttribute("stroke", "#FFD84D");
    ring.setAttribute("stroke-opacity", 0.18 - i * 0.05);
    ring.setAttribute("stroke-width", "0.3");
    ring.setAttribute("vector-effect", "non-scaling-stroke");
    linesSvg.appendChild(ring);
  });

  // --- Líneas desde Chile (sede) hacia cada país ---
  PARTICIPANTES.forEach((p) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", CHILE.x);
    line.setAttribute("y1", CHILE.y);
    line.setAttribute("x2", p.x);
    line.setAttribute("y2", p.y);
    line.setAttribute("stroke", COLORES_ANIO[p.anio]);
    line.setAttribute("stroke-width", "0.4");
    line.setAttribute("stroke-opacity", "0.35");
    line.setAttribute("stroke-dasharray", "1.5 1.5");
    line.setAttribute("vector-effect", "non-scaling-stroke");
    line.setAttribute("class", "worldmap__line");
    line.dataset.anio = p.anio;
    linesSvg.appendChild(line);
  });

  // --- Pin de Chile (sede) ---
  const chilePin = document.createElement("button");
  chilePin.className = "map-pin map-pin--host";
  chilePin.style.left = CHILE.x + "%";
  chilePin.style.top = CHILE.y + "%";
  chilePin.innerHTML = '<span class="map-pin__star" aria-hidden="true">★</span>';
  chilePin.setAttribute("aria-label", "Chile, país anfitrión del festival");
  map.appendChild(chilePin);

  const hostHtml =
    '<span class="map-tooltip__flag">🇨🇱</span>' +
    '<div class="map-tooltip__body">' +
    '<strong class="map-tooltip__country">Chile</strong>' +
    '<span class="map-tooltip__badge map-tooltip__badge--host">País anfitrión · Sede</span>' +
    '<span class="map-tooltip__group">' + NACIONALES.length + " agrupaciones nacionales</span>" +
    "</div>";
  bindTooltip(chilePin, hostHtml, null);

  // --- Pines de cada país ---
  PARTICIPANTES.forEach((p) => {
    const pin = document.createElement("button");
    pin.className = "map-pin";
    pin.style.left = p.x + "%";
    pin.style.top = p.y + "%";
    pin.style.setProperty("--pin-color", COLORES_ANIO[p.anio]);
    pin.dataset.anio = p.anio;
    pin.innerHTML = '<span class="map-pin__flag">' + p.flag + "</span>";
    pin.setAttribute("aria-label", p.pais + ", participó en " + p.anio + " con " + p.grupo);

    const html =
      '<span class="map-tooltip__flag">' + p.flag + "</span>" +
      '<div class="map-tooltip__body">' +
      '<strong class="map-tooltip__country">' + p.pais + "</strong>" +
      '<span class="map-tooltip__badge" style="background:' + COLORES_ANIO[p.anio] + '">Edición ' + p.anio + "</span>" +
      '<span class="map-tooltip__group">' + p.grupo + "</span>" +
      '<a class="map-tooltip__link" href="' + p.ig + '" target="_blank" rel="noopener">Ver en Instagram →</a>' +
      "</div>";
    bindTooltip(pin, html, p.anio);
    map.appendChild(pin);
  });

  // --- Leyenda por año (clic para resaltar) ---
  let filtroActivo = null;
  Object.keys(COLORES_ANIO).forEach((anio) => {
    const chip = document.createElement("button");
    chip.className = "map-legend__chip";
    chip.style.setProperty("--chip-color", COLORES_ANIO[anio]);
    chip.innerHTML = '<span class="map-legend__dot"></span>' + anio;
    chip.addEventListener("click", () => {
      filtroActivo = filtroActivo === anio ? null : anio;
      aplicarFiltro(filtroActivo);
      legend.querySelectorAll(".map-legend__chip").forEach((c) => c.classList.remove("is-active"));
      if (filtroActivo) chip.classList.add("is-active");
    });
    legend.appendChild(chip);
  });

  function aplicarFiltro(anio) {
    map.querySelectorAll(".map-pin[data-anio]").forEach((pin) => {
      pin.classList.toggle("is-dimmed", anio && pin.dataset.anio !== anio);
    });
    linesSvg.querySelectorAll("line").forEach((line) => {
      line.setAttribute("stroke-opacity", anio ? (line.dataset.anio === anio ? "0.6" : "0.06") : "0.35");
    });
  }

  // --- Tooltip: hover en escritorio, toque en móvil ---
  function bindTooltip(pin, html, anio) {
    const show = () => {
      tooltip.innerHTML = html;
      tooltip.classList.add("is-visible");
      positionTooltip(pin);
      pin.classList.add("is-hover");
      activePin = pin;
    };
    const hide = () => {
      tooltip.classList.remove("is-visible");
      pin.classList.remove("is-hover");
      if (activePin === pin) activePin = null;
    };
    pin.addEventListener("mouseenter", show);
    pin.addEventListener("mouseleave", hide);
    pin.addEventListener("focus", show);
    pin.addEventListener("blur", hide);
    pin.addEventListener("click", (e) => {
      e.preventDefault();
      if (activePin === pin && tooltip.classList.contains("is-visible")) hide();
      else show();
    });
  }

  function positionTooltip(pin) {
    const stage = map.parentElement; // .worldmap__stage
    const stageRect = stage.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();
    const left = pinRect.left - stageRect.left + pinRect.width / 2;
    const top = pinRect.top - stageRect.top;
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";
  }

  // Cerrar tooltip al tocar fuera (móvil)
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".map-pin") && !e.target.closest(".map-tooltip")) {
      tooltip.classList.remove("is-visible");
      if (activePin) { activePin.classList.remove("is-hover"); activePin = null; }
    }
  });

}

/* ---------- Mapa de la ruta por Chile (enero 2027) ----------
   x / y son porcentajes sobre el mapa según la ubicación geográfica de cada comuna.
   Editar aquí para cambiar fechas, comunas o enlaces. */
const COLOR_REGION = {
  "Valparaíso": "#3a7bd5",
  "Metropolitana": "#4FD1C5",
  "O'Higgins": "#B473C0",
  "Maule": "#E0A32E",
};

/* Bandas de región (de norte a sur), en % de altura del mapa */
const BANDAS_REGION = [
  { region: "Valparaíso", desde: 0, hasta: 23 },
  { region: "Metropolitana", desde: 23, hasta: 54 },
  { region: "O'Higgins", desde: 54, hasta: 88.5 },
  { region: "Maule", desde: 88.5, hasta: 100 },
];

/* Paradas en orden cronológico (la ruta sigue este orden) */
const RUTA_2027 = [
  { dia: 15, comuna: "Nancagua",      grupo: "BAFONAN",                            region: "O'Higgins",     x: 26.4, y: 79.6, ig: "https://www.instagram.com/bafonanoficial/" },
  { dia: 16, comuna: "Romeral",       grupo: "Corporación Cultural Romeral",       region: "Maule",         x: 32.7, y: 91.2, ig: "https://www.instagram.com/culturaromeral/" },
  { dia: 17, comuna: "Curicó",        grupo: "Las Acacias Ballet Folklórico",      region: "Maule",         x: 23.6, y: 91.5, ig: "https://www.instagram.com/lasacacias.bfm/" },
  { dia: 18, comuna: "Rancagua",      grupo: "Grupo de Danza Folklórica Maulikan", region: "O'Higgins",     x: 69.1, y: 60.4, ig: "https://www.instagram.com/maulikan.oficial/" },
  { dia: 19, comuna: "Nancagua",      grupo: "BAFONAN",                            region: "O'Higgins",     x: 26.4, y: 79.6, ig: "https://www.instagram.com/bafonanoficial/" },
  { dia: 21, comuna: "Renca",         grupo: "DANFORES",                           region: "Metropolitana", x: 70.0, y: 30.8, ig: "https://www.instagram.com/danfore_renca/" },
  { dia: 22, comuna: "Macul",         grupo: "Walmapu Compañía Folklórica",        region: "Metropolitana", x: 81.8, y: 35.5, ig: "https://www.instagram.com/walmapu.cl/" },
  { dia: 23, comuna: "Llay Llay",     grupo: "Ballet Folklórico de Llay Llay",     region: "Valparaíso",    x: 49.1, y: 9.2,  ig: "https://www.instagram.com/ballet.llay_llay/" },
  { dia: 24, comuna: "Padre Hurtado", grupo: "Agrupación Folklórica Alborada",     region: "Metropolitana", x: 62.7, y: 37.3, ig: "https://www.instagram.com/agrupacion.alborada/" },
  { dia: 26, comuna: "Providencia",   grupo: "Gala de Clausura",                   region: "Metropolitana", x: 80.9, y: 29.5, ig: null },
];

function initChileRouteMap() {
  const map = document.getElementById("chileMap");
  const svg = document.getElementById("chileLines");
  const tooltip = document.getElementById("chileTooltip");
  if (!map || !svg || !tooltip) return;

  // --- Bandas de región ---
  BANDAS_REGION.forEach((b) => {
    const band = document.createElement("div");
    band.className = "chilemap__band";
    band.style.top = b.desde + "%";
    band.style.height = b.hasta - b.desde + "%";
    band.style.setProperty("--band-color", COLOR_REGION[b.region]);
    band.innerHTML = '<span class="chilemap__band-label">' + b.region + "</span>";
    map.appendChild(band);
  });

  // --- Línea de la ruta (en orden de fecha) ---
  const puntos = RUTA_2027.map((p) => p.x + "," + p.y).join(" ");
  const linea = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  linea.setAttribute("points", puntos);
  linea.setAttribute("fill", "none");
  linea.setAttribute("stroke", "#FFD84D");
  linea.setAttribute("stroke-width", "0.5");
  linea.setAttribute("stroke-opacity", "0.5");
  linea.setAttribute("stroke-dasharray", "1.6 1.4");
  linea.setAttribute("vector-effect", "non-scaling-stroke");
  linea.setAttribute("class", "chilemap__route");
  svg.appendChild(linea);

  // --- Agrupa paradas por comuna (Nancagua se repite el 15 y el 19) ---
  const porComuna = new Map();
  RUTA_2027.forEach((p) => {
    if (porComuna.has(p.comuna)) porComuna.get(p.comuna).dias.push(p.dia);
    else porComuna.set(p.comuna, { ...p, dias: [p.dia] });
  });

  let activo = null;

  porComuna.forEach((p) => {
    const esEnlace = Boolean(p.ig);
    const pin = document.createElement(esEnlace ? "a" : "button");
    pin.className = "route-pin";
    pin.style.left = p.x + "%";
    pin.style.top = p.y + "%";
    pin.style.setProperty("--pin-color", COLOR_REGION[p.region]);
    pin.innerHTML = '<span class="route-pin__day">' + p.dias[0] + "</span>";

    const fechas = p.dias.map((d) => d + " de enero").join(" y ");
    if (esEnlace) {
      pin.href = p.ig;
      pin.target = "_blank";
      pin.rel = "noopener";
      pin.setAttribute("aria-label", p.comuna + ", " + fechas + ", " + p.grupo + ". Abre su Instagram");
    } else {
      pin.type = "button";
      pin.setAttribute("aria-label", p.comuna + ", " + fechas + ", " + p.grupo);
    }

    const html =
      '<div class="map-tooltip__body">' +
      '<strong class="map-tooltip__country">' + p.comuna + "</strong>" +
      '<span class="map-tooltip__badge" style="background:' + COLOR_REGION[p.region] + '">' + fechas + "</span>" +
      '<span class="map-tooltip__group">' + p.grupo + "</span>" +
      '<span class="map-tooltip__region">Región ' + p.region + "</span>" +
      (esEnlace ? '<span class="map-tooltip__link">Ver en Instagram →</span>' : "") +
      "</div>";

    const mostrar = () => {
      tooltip.innerHTML = html;
      tooltip.classList.add("is-visible");
      const stage = map.parentElement;
      const sr = stage.getBoundingClientRect();
      const pr = pin.getBoundingClientRect();
      tooltip.style.left = pr.left - sr.left + pr.width / 2 + "px";
      tooltip.style.top = pr.top - sr.top + "px";
      pin.classList.add("is-hover");
      activo = pin;
    };
    const ocultar = () => {
      tooltip.classList.remove("is-visible");
      pin.classList.remove("is-hover");
      if (activo === pin) activo = null;
    };

    pin.addEventListener("mouseenter", mostrar);
    pin.addEventListener("mouseleave", ocultar);
    pin.addEventListener("focus", mostrar);
    pin.addEventListener("blur", ocultar);

    map.appendChild(pin);
  });

  // Cierra el tooltip al tocar fuera (móvil)
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".route-pin") && !e.target.closest("#chileTooltip")) {
      tooltip.classList.remove("is-visible");
      if (activo) { activo.classList.remove("is-hover"); activo = null; }
    }
  });
}
