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

/* Contornos geográficos reales (Natural Earth, proyección Mercator).
   viewBox 0 0 1000 1100 · generado desde GeoJSON público. */
const GEO_PAISES = {
  MEX: "M271.0,84.9 L266.8,95.4 L264.9,104.0 L264.1,119.7 L263.0,125.5 L264.9,131.8 L268.3,137.5 L270.4,146.5 L277.6,155.0 L280.1,161.6 L284.3,167.2 L295.8,170.2 L300.3,175.0 L309.7,171.8 L318.0,170.7 L326.1,168.6 L332.9,166.6 L339.7,162.0 L342.3,155.3 L343.2,145.6 L345.0,142.2 L352.4,139.2 L363.8,136.5 L373.3,136.9 L379.9,135.9 L382.5,138.4 L382.1,144.0 L376.3,150.8 L373.7,157.8 L375.7,159.8 L374.1,164.8 L371.4,173.7 L368.7,170.7 L366.4,170.9 L364.4,171.1 L360.5,177.9 L358.5,176.6 L357.2,177.1 L357.3,178.8 L347.3,178.7 L337.2,178.7 L337.2,185.1 L332.4,185.1 L336.4,188.9 L340.4,191.5 L341.6,193.9 L343.3,194.6 L343.0,198.4 L329.2,198.5 L324.0,207.6 L325.5,209.7 L324.3,212.3 L324.0,215.6 L311.8,203.5 L306.2,199.9 L297.4,196.9 L291.4,197.8 L282.7,202.0 L277.2,203.1 L269.6,200.1 L261.5,198.0 L251.4,192.8 L243.3,191.3 L231.1,186.0 L222.1,180.6 L219.4,177.6 L213.3,176.9 L202.3,173.3 L197.8,168.1 L186.2,161.6 L180.8,154.4 L178.2,148.8 L181.8,147.7 L180.7,144.4 L183.2,141.4 L183.2,137.4 L179.6,132.1 L178.6,127.5 L175.0,121.6 L165.5,109.9 L154.6,100.7 L149.3,93.3 L140.1,88.4 L138.1,85.5 L139.7,78.0 L134.2,75.2 L127.9,69.3 L125.2,60.8 L119.4,59.8 L113.1,53.4 L108.0,47.4 L107.6,43.5 L101.7,34.1 L97.9,24.6 L98.1,19.7 L90.3,14.7 L86.7,15.3 L80.5,11.8 L78.8,16.9 L80.6,23.0 L81.6,32.4 L85.3,37.5 L93.3,46.1 L95.1,49.0 L96.8,49.8 L98.2,54.1 L100.1,53.9 L102.3,61.8 L105.5,64.9 L107.8,69.2 L114.6,75.4 L118.2,86.6 L121.4,91.8 L124.4,97.4 L125.0,103.6 L130.2,104.0 L134.6,109.4 L138.5,114.7 L138.2,116.8 L133.7,121.1 L131.7,121.0 L128.9,113.9 L121.8,107.2 L114.0,101.4 L108.5,98.4 L108.9,89.7 L107.2,83.2 L102.1,79.5 L94.7,74.1 L93.2,75.6 L90.5,72.5 L83.9,69.6 L77.5,62.5 L78.3,61.6 L82.7,62.3 L86.7,57.7 L87.1,52.2 L78.8,43.4 L72.5,39.9 L68.5,32.2 L64.5,23.9 L59.5,13.8 L55.1,2.4 L67.4,1.4 L81.1,0.0 L80.1,2.5 L96.4,8.7 L121.0,17.7 L142.5,17.6 L151.1,17.6 L151.1,12.3 L169.8,12.3 L173.7,16.8 L179.3,20.8 L185.7,26.4 L189.3,32.9 L191.9,39.7 L197.5,43.5 L206.5,47.2 L213.3,37.4 L222.1,37.2 L229.7,42.1 L235.1,50.6 L238.9,57.8 L245.3,64.7 L247.6,73.2 L250.7,78.9 L259.1,82.6 L266.7,85.3 L271.0,84.9Z",
  HND: "M377.0,232.8 L375.2,229.4 L371.9,228.4 L372.6,224.0 L371.2,222.8 L368.9,222.0 L364.2,223.3 L363.8,221.8 L360.5,220.0 L358.2,217.8 L355.0,216.8 L357.3,214.0 L356.4,211.8 L357.2,209.7 L362.3,206.5 L367.2,202.3 L368.3,202.7 L370.7,200.7 L373.8,200.6 L374.8,201.5 L376.5,200.9 L381.5,201.9 L386.5,201.6 L390.0,200.4 L391.2,199.1 L394.7,199.7 L397.3,200.5 L400.1,200.2 L402.2,199.3 L407.2,200.8 L408.9,201.1 L412.2,203.2 L415.3,205.7 L419.2,207.4 L422.1,210.5 L418.4,210.2 L416.9,211.8 L413.1,213.2 L410.4,213.2 L408.0,214.6 L405.8,214.1 L404.0,212.4 L402.9,212.8 L401.5,215.4 L400.4,215.3 L400.3,217.6 L396.5,220.7 L394.5,222.0 L393.4,223.4 L390.2,221.1 L387.9,224.1 L385.6,224.0 L383.1,224.3 L383.3,229.8 L381.7,229.9 L380.4,232.4 L377.0,232.8Z",
  CRI: "M424.0,285.1 L418.2,282.7 L416.0,280.4 L417.2,278.5 L416.8,276.1 L413.8,273.5 L409.6,271.3 L405.9,269.9 L405.1,266.7 L402.3,264.8 L403.0,268.0 L400.8,270.6 L398.4,267.5 L394.9,266.5 L393.4,264.3 L393.5,260.9 L394.9,257.5 L391.9,255.9 L394.4,253.8 L396.0,252.4 L403.1,255.3 L405.6,253.8 L409.0,254.8 L410.8,257.0 L414.0,257.8 L416.6,255.4 L419.3,261.4 L423.5,265.8 L428.5,270.5 L424.4,271.5 L424.4,275.9 L426.7,277.5 L425.1,278.8 L425.5,280.8 L424.6,283.0 L424.0,285.1Z",
  PAN: "M478.9,296.1 L475.3,292.9 L473.0,287.0 L475.7,284.1 L472.9,283.4 L470.9,279.8 L465.5,276.7 L460.8,277.4 L458.6,281.2 L454.3,284.0 L451.9,284.3 L450.8,286.6 L456.0,292.5 L453.1,293.9 L451.5,295.5 L446.5,296.1 L444.6,289.6 L443.2,291.4 L439.6,290.8 L437.5,286.4 L433.0,285.7 L430.2,284.4 L425.6,284.4 L425.3,286.8 L424.0,285.1 L424.6,283.0 L425.5,280.8 L425.1,278.8 L426.7,277.5 L424.4,275.9 L424.4,271.5 L428.5,270.5 L432.4,274.4 L432.2,276.7 L436.5,277.2 L437.5,276.3 L440.5,279.0 L445.8,278.2 L450.4,275.5 L457.0,273.3 L460.6,270.0 L466.6,270.6 L466.2,271.7 L472.2,272.1 L477.0,274.0 L480.6,277.3 L484.6,280.3 L483.3,281.9 L485.8,288.3 L483.8,291.5 L480.3,290.8 L478.9,296.1Z",
  COL: "M506.0,375.9 L501.4,373.4 L496.1,369.8 L493.0,371.5 L483.8,370.0 L481.2,365.3 L479.2,365.5 L468.4,359.4 L466.9,356.0 L471.0,355.2 L470.5,349.8 L473.0,345.9 L478.4,345.1 L482.9,338.3 L487.1,332.7 L483.1,330.1 L485.1,323.8 L482.7,313.9 L485.0,311.0 L483.3,301.9 L478.9,296.1 L480.3,290.8 L483.8,291.5 L485.8,288.3 L483.3,281.9 L484.6,280.3 L490.2,280.6 L498.3,273.0 L502.7,271.8 L502.9,268.2 L504.8,258.9 L511.0,253.8 L517.8,253.6 L518.7,251.3 L527.1,252.3 L535.6,246.7 L539.9,244.2 L545.1,238.9 L548.9,239.6 L551.7,242.5 L549.6,246.2 L542.7,248.0 L540.0,253.6 L535.8,256.7 L532.6,260.8 L531.3,268.6 L528.3,275.0 L533.9,275.8 L535.3,280.8 L537.7,283.2 L538.5,287.6 L537.2,291.6 L537.6,293.9 L540.3,294.8 L542.9,298.6 L556.7,297.5 L563.0,298.9 L570.6,308.3 L575.0,307.1 L582.8,307.7 L588.9,306.5 L592.7,308.3 L590.8,314.2 L588.4,317.8 L587.5,325.6 L589.7,332.8 L592.8,336.0 L593.1,338.4 L587.7,343.8 L591.6,346.2 L594.5,350.0 L597.8,360.7 L595.7,362.1 L593.6,355.7 L590.6,352.3 L587.0,356.0 L566.0,355.7 L566.1,362.5 L572.5,363.6 L572.1,367.8 L569.9,366.6 L563.9,368.4 L563.8,376.3 L568.6,380.2 L570.3,386.4 L570.0,391.1 L565.2,420.7 L559.8,415.0 L556.5,414.7 L563.5,403.7 L555.2,398.6 L548.8,399.6 L544.9,397.7 L538.9,400.6 L530.9,399.2 L524.5,387.9 L519.5,385.1 L516.1,380.0 L508.9,374.9 L506.0,375.9Z",
  ECU: "M452.8,411.1 L458.5,403.0 L456.2,398.3 L452.1,403.3 L445.6,398.5 L447.8,395.5 L446.0,385.7 L449.7,384.1 L451.7,377.3 L455.8,370.4 L455.1,366.0 L461.0,363.7 L468.4,359.4 L479.2,365.5 L481.2,365.3 L483.8,370.0 L493.0,371.5 L496.1,369.8 L501.4,373.4 L506.0,375.9 L507.5,384.1 L504.1,391.1 L492.4,402.4 L479.4,406.7 L472.8,416.1 L470.7,423.4 L464.6,427.9 L460.1,422.4 L455.7,421.2 L451.3,422.1 L451.0,418.1 L454.1,415.6 L452.8,411.1Z",
  PER: "M568.4,567.2 L565.6,573.0 L560.0,575.9 L549.2,569.4 L548.2,564.7 L526.8,553.4 L507.5,541.1 L499.1,534.2 L494.7,525.0 L496.4,521.8 L487.3,507.3 L476.6,486.9 L466.4,465.2 L462.0,460.2 L458.6,452.2 L450.2,445.1 L442.5,440.7 L446.0,435.8 L440.8,425.5 L444.2,417.9 L452.8,411.1 L454.1,415.6 L451.0,418.1 L451.3,422.1 L455.7,421.2 L460.1,422.4 L464.6,427.9 L470.7,423.4 L472.8,416.1 L479.4,406.7 L492.4,402.4 L504.1,391.1 L507.5,384.1 L506.0,375.9 L508.9,374.9 L516.1,380.0 L519.5,385.1 L524.5,387.9 L530.9,399.2 L538.9,400.6 L544.9,397.7 L548.8,399.6 L555.2,398.6 L563.5,403.7 L556.5,414.7 L559.8,415.0 L565.2,420.7 L555.4,420.2 L554.0,421.8 L545.1,423.9 L532.8,431.3 L532.0,436.4 L529.3,440.1 L530.3,446.0 L523.8,449.2 L523.8,453.8 L521.0,455.7 L525.5,465.6 L531.5,472.2 L529.2,476.9 L536.3,477.5 L540.4,483.4 L550.0,483.7 L558.8,477.2 L558.1,493.9 L563.0,495.2 L569.1,493.3 L578.4,511.0 L576.1,514.8 L575.6,522.6 L575.4,532.0 L571.2,537.6 L573.1,541.8 L570.6,545.5 L575.3,555.0 L568.4,567.2Z",
  BOL: "M641.3,618.3 L629.0,617.8 L624.7,627.2 L618.4,618.8 L604.3,615.9 L595.3,626.5 L587.5,628.1 L583.2,612.0 L577.4,599.0 L580.8,587.9 L575.2,583.1 L573.7,574.9 L568.4,567.2 L575.3,555.0 L570.6,545.5 L573.1,541.8 L571.2,537.6 L575.4,532.0 L575.6,522.6 L576.1,514.8 L578.4,511.0 L569.1,493.3 L577.1,494.2 L582.7,493.9 L585.1,490.6 L594.5,486.2 L600.2,482.1 L614.4,480.2 L613.2,488.4 L614.5,492.6 L613.7,500.0 L625.4,509.9 L637.5,511.7 L641.7,515.9 L649.0,518.1 L653.5,521.3 L660.3,521.2 L666.6,524.5 L667.0,530.9 L669.2,534.2 L669.3,539.0 L666.1,539.2 L670.3,552.2 L691.0,552.7 L689.4,559.2 L690.6,563.7 L696.5,566.8 L699.0,573.9 L697.1,582.9 L694.1,587.9 L695.2,594.4 L691.8,596.8 L691.6,593.2 L681.6,587.4 L671.5,587.2 L652.7,590.6 L647.5,600.7 L647.3,606.9 L643.0,620.8 L641.3,618.3Z",
  BRA: "M697.7,716.8 L712.1,699.9 L724.2,688.0 L731.5,683.0 L740.6,676.3 L740.8,666.7 L735.4,659.8 L730.0,662.1 L732.2,655.2 L733.6,648.1 L733.6,641.6 L729.7,639.5 L725.7,641.4 L721.7,640.8 L720.4,636.3 L719.4,625.5 L717.4,622.1 L710.1,618.9 L705.7,621.2 L694.3,618.9 L695.0,603.2 L691.8,596.8 L695.2,594.4 L694.1,587.9 L697.1,582.9 L699.0,573.9 L696.5,566.8 L690.6,563.7 L689.4,559.2 L691.0,552.7 L670.3,552.2 L666.1,539.2 L669.3,539.0 L669.2,534.2 L667.0,530.9 L666.6,524.5 L660.3,521.2 L653.5,521.3 L649.0,518.1 L641.7,515.9 L637.5,511.7 L625.4,509.9 L613.7,500.0 L614.5,492.6 L613.2,488.4 L614.4,480.2 L600.2,482.1 L594.5,486.2 L585.1,490.6 L582.7,493.9 L577.1,494.2 L569.1,493.3 L563.0,495.2 L558.1,493.9 L558.8,477.2 L550.0,483.7 L540.4,483.4 L536.3,477.5 L529.2,476.9 L531.5,472.2 L525.5,465.6 L521.0,455.7 L523.8,453.8 L523.8,449.2 L530.3,446.0 L529.3,440.1 L532.0,436.4 L532.8,431.3 L545.1,423.9 L554.0,421.8 L555.4,420.2 L565.2,420.7 L570.0,391.1 L570.3,386.4 L568.6,380.2 L563.8,376.3 L563.9,368.4 L569.9,366.6 L572.1,367.8 L572.5,363.6 L566.1,362.5 L566.0,355.7 L587.0,356.0 L590.6,352.3 L593.6,355.7 L595.7,362.1 L597.8,360.7 L603.7,366.4 L612.1,365.7 L614.2,362.4 L622.2,359.9 L626.7,358.1 L627.9,353.6 L635.6,350.5 L635.0,348.2 L625.9,347.3 L624.4,340.5 L624.8,333.2 L620.0,330.4 L622.0,329.4 L630.0,330.8 L638.6,333.5 L641.7,331.0 L649.5,329.3 L661.6,325.2 L665.5,321.1 L664.1,318.0 L669.7,317.6 L672.2,320.1 L670.8,324.8 L674.5,326.5 L677.0,331.5 L674.0,335.3 L672.3,344.5 L675.0,350.0 L675.8,355.0 L682.5,360.0 L687.8,360.6 L689.0,358.5 L692.4,358.0 L697.3,356.1 L700.8,353.2 L706.7,354.1 L709.4,353.8 L715.2,354.6 L716.2,352.4 L714.4,350.3 L715.5,347.2 L719.8,348.1 L724.9,347.0 L731.1,349.3 L735.8,351.5 L739.2,348.6 L741.6,349.0 L743.1,352.1 L748.2,351.3 L752.4,347.2 L755.7,339.3 L762.1,329.3 L765.8,328.8 L768.4,334.8 L774.5,353.7 L780.3,355.5 L780.6,363.0 L772.4,371.9 L775.8,375.1 L794.9,376.8 L795.3,387.6 L803.5,380.5 L817.1,384.4 L835.0,391.0 L840.3,397.4 L838.5,403.3 L851.1,400.0 L872.1,405.7 L888.2,405.3 L904.2,414.3 L918.0,426.4 L926.3,429.5 L935.5,429.9 L939.4,433.4 L943.1,447.2 L944.9,453.8 L940.6,471.8 L935.1,479.0 L919.9,494.2 L913.0,506.7 L905.0,516.3 L902.3,516.5 L899.3,524.7 L900.0,545.6 L897.0,562.9 L895.9,570.4 L892.5,574.9 L890.6,590.2 L879.6,605.2 L877.8,617.2 L869.0,622.2 L866.5,629.2 L854.8,629.2 L837.8,633.7 L830.2,639.0 L818.1,642.4 L805.4,651.9 L796.2,663.7 L794.7,672.7 L796.5,679.4 L794.4,691.7 L792.0,697.7 L784.4,704.5 L772.5,726.5 L763.0,736.5 L755.6,742.4 L750.7,754.7 L743.6,762.1 L740.6,754.7 L745.3,748.6 L739.1,739.9 L730.6,732.9 L719.5,724.8 L715.5,725.2 L704.7,715.5 L697.7,716.8Z",
  PRY: "M643.0,620.8 L647.3,606.9 L647.5,600.7 L652.7,590.6 L671.5,587.2 L681.6,587.4 L691.6,593.2 L691.8,596.8 L695.0,603.2 L694.3,618.9 L705.7,621.2 L710.1,618.9 L717.4,622.1 L719.4,625.5 L720.4,636.3 L721.7,640.8 L725.7,641.4 L729.7,639.5 L733.6,641.6 L733.6,648.1 L732.2,655.2 L730.0,662.1 L728.3,672.7 L718.5,682.0 L709.9,683.9 L697.8,682.1 L686.9,678.8 L697.6,660.4 L696.0,655.2 L684.9,650.5 L671.7,641.7 L662.9,639.9 L643.0,620.8Z",
  URY: "M697.7,716.8 L704.7,715.5 L715.5,725.2 L719.5,724.8 L730.6,732.9 L739.1,739.9 L745.3,748.6 L740.6,754.7 L743.6,762.1 L738.9,770.3 L726.7,777.6 L718.7,774.9 L712.9,776.3 L702.9,770.7 L695.6,771.1 L689.0,763.9 L689.8,755.5 L692.2,752.6 L692.1,739.9 L695.0,726.9 L697.7,716.8Z",
  ARG: "M612.6,1092.2 L602.4,1093.1 L596.8,1086.5 L590.3,1085.9 L578.8,1085.9 L578.8,1045.1 L582.9,1053.4 L588.3,1067.0 L602.4,1078.1 L617.5,1082.8 L612.6,1092.2Z M618.4,618.8 L624.7,627.2 L629.0,617.8 L641.3,618.3 L643.0,620.8 L662.9,639.9 L671.7,641.7 L684.9,650.5 L696.0,655.2 L697.6,660.4 L686.9,678.8 L697.8,682.1 L709.9,683.9 L718.5,682.0 L728.3,672.7 L730.0,662.1 L735.4,659.8 L740.8,666.7 L740.6,676.3 L731.5,683.0 L724.2,688.0 L712.1,699.9 L697.7,716.8 L695.0,726.9 L692.1,739.9 L692.2,752.6 L689.8,755.5 L689.0,763.9 L688.3,770.7 L702.0,782.0 L700.5,791.1 L707.2,797.0 L706.7,803.5 L696.3,821.0 L680.3,828.4 L658.6,831.3 L646.8,829.9 L649.1,838.2 L646.8,848.7 L648.8,855.9 L642.4,860.9 L631.3,862.9 L620.9,857.7 L616.7,861.4 L618.2,875.7 L625.5,880.1 L631.4,875.5 L634.7,883.1 L624.7,887.7 L616.1,896.9 L614.5,912.0 L611.9,920.1 L601.7,920.2 L593.2,928.0 L590.1,939.7 L600.8,951.2 L611.1,954.4 L607.4,968.8 L594.6,978.0 L587.6,997.4 L577.7,1004.0 L573.3,1012.0 L576.8,1029.9 L584.0,1040.1 L579.4,1039.2 L569.4,1036.4 L543.3,1034.1 L538.9,1023.9 L539.1,1011.0 L531.9,1012.1 L528.1,1006.0 L527.1,988.2 L535.4,981.0 L538.8,970.6 L537.6,962.4 L543.3,948.8 L547.3,928.2 L546.1,919.2 L550.8,916.3 L549.7,910.6 L544.7,907.5 L548.2,901.3 L543.3,895.6 L540.8,878.6 L545.2,875.6 L543.3,858.1 L545.9,843.6 L548.8,831.1 L555.2,826.1 L551.9,812.7 L551.9,800.3 L560.1,791.5 L559.8,780.4 L566.0,767.6 L566.0,755.7 L563.2,753.3 L558.2,731.3 L564.9,718.3 L563.9,706.3 L567.7,695.1 L574.8,683.6 L582.4,676.0 L579.2,671.3 L581.5,667.4 L581.1,647.5 L592.9,641.7 L596.6,629.4 L595.3,626.5 L604.3,615.9 L618.4,618.8Z",
  CHL: "M578.8,1045.1 L578.8,1085.9 L590.3,1085.9 L596.8,1086.5 L593.3,1094.1 L584.0,1100.0 L578.7,1099.4 L572.3,1097.8 L564.5,1092.1 L553.2,1089.4 L539.6,1078.9 L528.5,1069.0 L513.7,1048.7 L522.6,1052.5 L537.7,1064.6 L552.1,1071.2 L557.6,1062.8 L561.1,1050.4 L571.1,1043.0 L578.8,1045.1Z M583.2,612.0 L587.5,628.1 L595.3,626.5 L596.6,629.4 L592.9,641.7 L581.1,647.5 L581.5,667.4 L579.2,671.3 L582.4,676.0 L574.8,683.6 L567.7,695.1 L563.9,706.3 L564.9,718.3 L558.2,731.3 L563.2,753.3 L566.0,755.7 L566.0,767.6 L559.8,780.4 L560.1,791.5 L551.9,800.3 L551.9,812.7 L555.2,826.1 L548.8,831.1 L545.9,843.6 L543.3,858.1 L545.2,875.6 L540.8,878.6 L543.3,895.6 L548.2,901.3 L544.7,907.5 L549.7,910.6 L550.8,916.3 L546.1,919.2 L547.3,928.2 L543.3,948.8 L537.6,962.4 L538.8,970.6 L535.4,981.0 L527.1,988.2 L528.1,1006.0 L531.9,1012.1 L539.1,1011.0 L538.9,1023.9 L543.3,1034.1 L569.4,1036.4 L579.4,1039.2 L569.8,1039.0 L564.6,1043.4 L554.9,1049.8 L553.2,1066.7 L548.6,1067.2 L536.4,1061.2 L524.0,1048.7 L510.6,1038.5 L507.2,1027.4 L510.3,1017.3 L504.8,1006.0 L503.5,977.6 L508.1,962.0 L519.5,949.7 L503.1,945.1 L513.4,931.3 L517.0,906.0 L529.0,911.3 L534.7,880.5 L527.4,876.6 L524.1,895.0 L517.2,892.9 L520.6,871.9 L524.3,845.5 L529.3,835.9 L526.2,822.4 L525.3,807.0 L529.8,806.6 L536.5,784.9 L543.9,763.9 L548.5,744.7 L546.0,725.7 L549.2,715.3 L547.9,700.0 L554.2,685.0 L556.2,661.7 L559.7,637.0 L563.0,610.8 L562.2,592.0 L560.0,575.9 L565.6,573.0 L568.4,567.2 L573.7,574.9 L575.2,583.1 L580.8,587.9 L577.4,599.0 L583.2,612.0Z",
};

/* Centroide de cada país en % sobre el mapa (para ubicar los pines) */
const GEO_CENTROS = {
  MEX: { x: 20.75, y: 9.81 },
  HND: { x: 38.71, y: 19.42 },
  CRI: { x: 41.1, y: 24.37 },
  PAN: { x: 45.25, y: 25.68 },
  COL: { x: 53.45, y: 29.61 },
  ECU: { x: 46.84, y: 35.73 },
  PER: { x: 52.0, y: 41.87 },
  BOL: { x: 62.86, y: 50.52 },
  BRA: { x: 70.5, y: 43.78 },
  PRY: { x: 69.68, y: 57.65 },
  URY: { x: 71.37, y: 68.04 },
  ARG: { x: 61.64, y: 73.83 },
  CHL: { x: 54.85, y: 75.65 },
};

/* ---------- Mapa de países participantes ---------- */
/* Datos extraídos del Excel de participantes. Editar aquí para actualizar.
   x / y son porcentajes (0–100) sobre el mapa, según la posición geográfica aproximada. */
const COLORES_ANIO = {
  2025: "#4FD1C5", // teal
  2026: "#FFD84D", // dorado
  2027: "#B473C0", // violeta
};

/* Las posiciones (x, y) salen del centroide geográfico real de cada país (GEO_CENTROS) */
const PARTICIPANTES = [
  { pais: "México",    iso: "MEX", flag: "🇲🇽", anio: 2026, grupo: "BAFODAVI",                          ig: "https://www.instagram.com/bafodavi/" },
  { pais: "Honduras",  iso: "HND", flag: "🇭🇳", anio: 2027, grupo: "Grupo Folklórico Pasión UNAH VOAE", ig: "https://www.instagram.com/pasionunah/" },
  { pais: "Costa Rica",iso: "CRI", flag: "🇨🇷", anio: 2025, grupo: "Corteza Amarilla",                  ig: "https://www.instagram.com/corteza_amarillaa/" },
  { pais: "Panamá",    iso: "PAN", flag: "🇵🇦", anio: 2027, grupo: "Academia Panamá y lo Nuestro",      ig: "https://www.instagram.com/panama_y_lonuestro/" },
  { pais: "Colombia",  iso: "COL", flag: "🇨🇴", anio: 2025, grupo: "Andares Colombianos",               ig: "https://www.instagram.com/andares_colombianos/" },
  { pais: "Ecuador",   iso: "ECU", flag: "🇪🇨", anio: 2026, grupo: "Kiamaru",                           ig: "https://www.instagram.com/kiamaru_ec/" },
  { pais: "Perú",      iso: "PER", flag: "🇵🇪", anio: 2025, grupo: "Acuarelas del Perú",                ig: "https://www.instagram.com/acuarelasdelperu/" },
  { pais: "Bolivia",   iso: "BOL", flag: "🇧🇴", anio: 2026, grupo: "Estudio de Danza Pacha",            ig: "https://www.instagram.com/esdanz_pacha/" },
  { pais: "Brasil",    iso: "BRA", flag: "🇧🇷", anio: 2027, grupo: "Grupo de Cultura Os Cariris",       ig: "https://www.instagram.com/os_cariris/" },
  { pais: "Paraguay",  iso: "PRY", flag: "🇵🇾", anio: 2025, grupo: "Tajy Poty",                         ig: "https://www.instagram.com/tajy.poty024/" },
  { pais: "Argentina", iso: "ARG", flag: "🇦🇷", anio: 2026, grupo: "Agrupación Folklórica De Raíz",     ig: "https://www.instagram.com/de.raiz.arg_/" },
  { pais: "Uruguay",   iso: "URY", flag: "🇺🇾", anio: 2027, grupo: "Ballet Folklórico Ypykuéra",        ig: "https://www.instagram.com/ypykuera.uy/" },
].map((p) => ({ ...p, x: GEO_CENTROS[p.iso].x, y: GEO_CENTROS[p.iso].y }));

const CHILE = { pais: "Chile", iso: "CHL", flag: "🇨🇱", x: GEO_CENTROS.CHL.x, y: GEO_CENTROS.CHL.y };

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

  // --- Contornos geográficos reales de cada país ---
  const geoSvg = document.getElementById("mapGeo");
  if (geoSvg) {
    const participantesPorIso = {};
    PARTICIPANTES.forEach((p) => (participantesPorIso[p.iso] = p));

    Object.keys(GEO_PAISES).forEach((iso) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", GEO_PAISES[iso]);
      path.setAttribute("class", "worldmap__country");
      path.dataset.iso = iso;

      const p = participantesPorIso[iso];
      if (iso === "CHL") {
        path.classList.add("worldmap__country--host");
      } else if (p) {
        path.classList.add("worldmap__country--active");
        path.style.setProperty("--pais-color", COLORES_ANIO[p.anio]);
        path.dataset.anio = p.anio;
      }
      geoSvg.appendChild(path);
    });
  }

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
  { region: "Valparaíso", desde: 0, hasta: 33 },
  { region: "Metropolitana", desde: 33, hasta: 48 },
  { region: "O'Higgins", desde: 48, hasta: 68 },
  { region: "Maule", desde: 68, hasta: 100 },
];

/* Contorno real de Chile central (GeoJSON Natural Earth, proyeccion Mercator).
   viewBox 0 0 600 900 · encuadre lat -31.5 a -36.3, lon -73.2 a -69.6 */
const GEO_CHILE = "M830.0,-1742.3 L895.3,-1510.7 L1015.6,-1533.8 L1035.8,-1491.5 L978.6,-1315.3 L797.1,-1231.2 L802.3,-944.3 L767.5,-888.4 L817.4,-820.1 L699.8,-711.4 L590.6,-546.1 L531.1,-384.7 L546.8,-211.0 L444.2,-24.6 L520.9,292.8 L564.2,326.8 L563.8,498.8 L468.7,683.4 L472.5,843.2 L346.4,969.3 L346.9,1148.5 L397.6,1341.3 L297.7,1413.7 L253.2,1593.2 L214.0,1802.2 L242.2,2055.1 L175.2,2097.8 L214.1,2342.5 L289.3,2423.9 L234.4,2514.6 L311.7,2558.2 L329.5,2640.5 L256.8,2682.0 L274.7,2811.8 L213.8,3109.5 L125.4,3305.3 L144.8,3422.9 L92.0,3572.0 L-35.9,3676.4 L-21.3,3932.2 L37.4,4021.0 L148.3,4005.2 L145.1,4190.5 L214.2,4336.9 L616.9,4370.8 L771.4,4410.5 L623.1,4408.6 L542.9,4471.4 L392.5,4564.1 L365.6,4807.6 L295.0,4813.7 L107.0,4728.3 L-83.8,4547.6 L-291.1,4401.2 L-343.3,4241.4 L-296.1,4095.5 L-380.0,3932.1 L-401.3,3523.6 L-330.5,3299.2 L-154.4,3121.9 L-407.4,3055.6 L-248.7,2857.0 L-192.0,2492.1 L-6.7,2568.5 L80.4,2124.8 L-31.5,2069.0 L-83.6,2333.3 L-188.7,2303.2 L-136.3,2001.5 L-79.5,1620.4 L-2.9,1482.4 L-50.9,1287.7 L-64.7,1066.2 L5.5,1059.8 L107.8,748.1 L223.0,445.4 L293.6,168.5 L255.2,-105.4 L305.0,-254.3 L285.0,-474.8 L382.5,-690.4 L412.5,-1027.2 L466.0,-1382.7 L518.1,-1759.2 L505.9,-2031.1 L471.2,-2262.9 L556.9,-2304.7 L601.6,-2388.5 L683.3,-2277.3 L705.5,-2158.9 L793.0,-2089.1 L740.5,-1929.1 L830.0,-1742.3Z";

/* Paradas con coordenadas geograficas reales de cada comuna (% sobre el mapa) */
const RUTA_2027 = [
  { dia: 15, comuna: "Nancagua",      grupo: "BAFONAN",                            region: "O'Higgins",     x: 55.22, y: 65.34, ig: "https://www.instagram.com/bafonanoficial/" },
  { dia: 16, comuna: "Romeral",       grupo: "Corporación Cultural Romeral",       region: "Maule",         x: 57.08, y: 71.63, ig: "https://www.instagram.com/culturaromeral/" },
  { dia: 17, comuna: "Curicó",        grupo: "Las Acacias Ballet Folklórico",      region: "Maule",         x: 54.47, y: 71.99, ig: "https://www.instagram.com/lasacacias.bfm/" },
  { dia: 18, comuna: "Rancagua",      grupo: "Grupo de Danza Folklórica Maulikan", region: "O'Higgins",     x: 68.22, y: 54.92, ig: "https://www.instagram.com/maulikan.oficial/" },
  { dia: 19, comuna: "Nancagua",      grupo: "BAFONAN",                            region: "O'Higgins",     x: 55.22, y: 65.34, ig: "https://www.instagram.com/bafonanoficial/" },
  { dia: 21, comuna: "Renca",         grupo: "DANFORES",                           region: "Metropolitana", x: 68.70, y: 39.00, ig: "https://www.instagram.com/danfore_renca/" },
  { dia: 22, comuna: "Macul",         grupo: "Walmapu Compañía Folklórica",        region: "Metropolitana", x: 72.28, y: 40.72, ig: "https://www.instagram.com/walmapu.cl/" },
  { dia: 23, comuna: "Llay Llay",     grupo: "Ballet Folklórico de Llay Llay",     region: "Valparaíso",    x: 62.12, y: 27.40, ig: "https://www.instagram.com/ballet.llay_llay/" },
  { dia: 24, comuna: "Padre Hurtado", grupo: "Agrupación Folklórica Alborada",     region: "Metropolitana", x: 66.30, y: 42.50, ig: "https://www.instagram.com/agrupacion.alborada/" },
  { dia: 26, comuna: "Providencia",   grupo: "Gala de Clausura",                   region: "Metropolitana", x: 71.95, y: 39.46, ig: null },
];

function initChileRouteMap() {
  const map = document.getElementById("chileMap");
  const svg = document.getElementById("chileLines");
  const tooltip = document.getElementById("chileTooltip");
  if (!map || !svg || !tooltip) return;

  // --- Contorno geográfico real de Chile ---
  const geo = document.getElementById("chileGeo");
  if (geo) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", GEO_CHILE);
    path.setAttribute("class", "chilemap__country");
    geo.appendChild(path);
  }

  // --- Etiquetas de región (referencia lateral) ---
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
