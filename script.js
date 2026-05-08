(function () {
  const body = document.body;
  const preloader = document.getElementById("preloader");
  const header = document.getElementById("siteHeader");
  const navToggle = document.getElementById("navToggle");
  const nav = document.getElementById("siteNav");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const counters = Array.from(document.querySelectorAll("[data-counter]"));
  const contactForm = document.getElementById("contactForm");
  const formNote = document.getElementById("formNote");
  const modalForm = document.getElementById("modalForm");
  const modalNote = document.getElementById("modalNote");
  const canvas = document.getElementById("particleCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  body.classList.add("is-loading");

  let loaderHidden = false;
  const hidePreloader = () => {
    if (loaderHidden) return;
    loaderHidden = true;
    preloader?.classList.add("is-hidden");
    body.classList.remove("is-loading");
  };

  window.addEventListener("load", () => {
    window.setTimeout(hidePreloader, 550);
  });
  window.setTimeout(hidePreloader, 1600);

  let lastScrollY = window.scrollY;
  const backToTop = document.getElementById("backToTop");

  const setHeaderState = () => {
    const currentScrollY = window.scrollY;
    
    // Sticky state
    header?.classList.toggle("is-scrolled", currentScrollY > 24);
    
    // Smart hide/show
    if (currentScrollY > 150) {
      if (currentScrollY > lastScrollY) {
        header?.classList.add("is-hidden");
      } else {
        header?.classList.remove("is-hidden");
      }
    } else {
      header?.classList.remove("is-hidden");
    }
    
    // Back to top
    backToTop?.classList.toggle("is-visible", currentScrollY > 500);

    if (!prefersReducedMotion && currentScrollY < window.innerHeight) {
      document.documentElement.style.setProperty("--hero-parallax-y", `${currentScrollY * 0.08}px`);
    }
    
    lastScrollY = currentScrollY;
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  navToggle?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", Boolean(isOpen));
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav?.classList.remove("is-open");
      navToggle?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 35, 240)}ms`;
    revealObserver.observe(el);
  });

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = Number(el.dataset.counter || 0);
        const duration = 1200;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased).toString();

          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
        });
      });
    },
    { rootMargin: "-42% 0px -50% 0px" }
  );

  document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const service = String(data.get("service") || "").trim();
    const message = String(data.get("message") || "").trim();
    const files = Array.from(document.getElementById("projectFiles")?.files || []).map((file) => file.name);
    const subject = encodeURIComponent(`Service request from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nService: ${service}\nProject files: ${files.length ? files.join(", ") : "None"}\n\nProject details:\n${message}`
    );

    formNote.textContent = "Opening your email app with the service request details.";
    window.location.href = `mailto:controltekservices3@gmail.com?subject=${subject}&body=${body}`;
    contactForm.reset();
  });

  // Calculators
  const calcSolarBtn = document.getElementById("calcSolar");
  const calcHVACBtn = document.getElementById("calcHVAC");
  const calcElecBtn = document.getElementById("calcElec");

  calcSolarBtn?.addEventListener("click", () => {
    const load = parseFloat(document.getElementById("solarLoad").value) || 0;
    const backup = parseFloat(document.getElementById("solarBackup").value) || 1;
    const resultDiv = document.getElementById("solarResult");
    
    if (load <= 0) return;
    
    // Simple Estimation Logic
    const panels = Math.ceil((load / 4.5) * 1.25 * 2); // 4.5 average sun hours
    const battery = Math.ceil(load * backup * 1.2);
    const inverter = Math.ceil(load * 0.6);
    
    resultDiv.innerHTML = `
      <strong>Estimation:</strong>
      - Panels: ${panels} x 550W<br>
      - Battery: ${battery} kWh<br>
      - Inverter: ${inverter} kW
    `;
    resultDiv.classList.add("is-active");
  });

  calcHVACBtn?.addEventListener("click", () => {
    const area = parseFloat(document.getElementById("hvacArea").value) || 0;
    const insulation = parseFloat(document.getElementById("hvacInsulation").value) || 1;
    const resultDiv = document.getElementById("hvacResult");
    
    if (area <= 0) return;
    
    const btu = Math.ceil(area * 600 * insulation); // 600 BTU per sq.m base
    
    resultDiv.innerHTML = `
      <strong>Estimation:</strong>
      - Required BTU: ${btu}<br>
      - Recommendation: ${btu <= 9000 ? "9,000 BTU Unit" : btu <= 12000 ? "12,000 BTU Unit" : btu <= 18000 ? "18,000 BTU Unit" : "24,000+ BTU Unit"}
    `;
    resultDiv.classList.add("is-active");
  });

  calcElecBtn?.addEventListener("click", () => {
    const rooms = parseInt(document.getElementById("elecRooms").value) || 0;
    const appliances = Array.from(document.querySelectorAll(".appliance:checked")).reduce((sum, el) => sum + parseInt(el.value), 0);
    const resultDiv = document.getElementById("elecResult");
    
    if (rooms <= 0 && appliances <= 0) return;
    
    const baseLoad = rooms * 500; // 500W per room base
    const totalLoad = baseLoad + appliances;
    const amps = Math.ceil(totalLoad / 230);
    
    resultDiv.innerHTML = `
      <strong>Estimation:</strong>
      - Total Load: ${(totalLoad / 1000).toFixed(1)} kW<br>
      - Current: ~${amps} Amps<br>
      - Recom. MCB: ${amps + 10}A
    `;
    resultDiv.classList.add("is-active");
  });

  // Modal Logic
  const quoteModal = document.getElementById("quoteModal");
  const closeModal = document.getElementById("closeModal");
  const quoteTriggers = document.querySelectorAll(".quote-trigger");

  quoteTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      quoteModal?.classList.add("is-active");
    });
  });

  closeModal?.addEventListener("click", () => {
    quoteModal?.classList.remove("is-active");
  });

  quoteModal?.addEventListener("click", (e) => {
    if (e.target === quoteModal) {
      quoteModal.classList.remove("is-active");
    }
  });

  modalForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(modalForm);
    const name = String(data.get("quoteName") || "").trim();
    const phone = String(data.get("quotePhone") || "").trim();
    const type = String(data.get("quoteType") || "").trim();
    const details = String(data.get("quoteDetails") || "").trim();
    const files = Array.from(document.getElementById("quoteFiles")?.files || []).map((file) => file.name);
    const subject = encodeURIComponent(`Quotation request from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nPhone: ${phone}\nProject type: ${type}\nProject files: ${files.length ? files.join(", ") : "None"}\n\nDetails:\n${details}`
    );

    modalNote.textContent = "Opening your email app with the quotation request details.";
    window.location.href = `mailto:controltekservices3@gmail.com?subject=${subject}&body=${body}`;
    modalForm.reset();
  });

  if (!canvas || !ctx) return;

  const state = {
    width: 0,
    height: 0,
    particles: [],
    mouse: { x: 0, y: 0, active: false },
    raf: 0
  };

  const particleCount = () => {
    const area = window.innerWidth * window.innerHeight;
    return Math.min(92, Math.max(42, Math.floor(area / 21000)));
  };

  const createParticle = () => ({
    x: Math.random() * state.width,
    y: Math.random() * state.height,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    radius: Math.random() * 1.8 + 0.8,
    charge: Math.random()
  });

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    state.particles = Array.from({ length: particleCount() }, createParticle);
  };

  const drawLine = (from, to, opacity, width) => {
    const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
    gradient.addColorStop(0, `rgba(0, 180, 216, ${opacity})`);
    gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity * 0.8})`);
    gradient.addColorStop(1, `rgba(11, 94, 215, ${opacity})`);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    const midX = (from.x + to.x) / 2 + (Math.random() - 0.5) * 8;
    const midY = (from.y + to.y) / 2 + (Math.random() - 0.5) * 8;
    ctx.lineTo(midX, midY);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const animate = () => {
    ctx.clearRect(0, 0, state.width, state.height);

    state.particles.forEach((particle, index) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > state.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > state.height) particle.vy *= -1;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(130, 235, 255, ${0.18 + particle.charge * 0.28})`;
      ctx.fill();

      for (let i = index + 1; i < state.particles.length; i += 1) {
        const other = state.particles[i];
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 135) {
          const opacity = (1 - distance / 135) * 0.28;
          drawLine(particle, other, opacity, 0.8);
        }
      }

      if (state.mouse.active) {
        const dx = particle.x - state.mouse.x;
        const dy = particle.y - state.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 170) {
          drawLine(particle, state.mouse, (1 - distance / 170) * 0.52, 1.15);
        }
      }
    });

    if (!prefersReducedMotion) {
      state.raf = requestAnimationFrame(animate);
    }
  };

  window.addEventListener("pointermove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    state.mouse.x = x;
    state.mouse.y = y;
    state.mouse.active = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
  });

  window.addEventListener("pointerleave", () => {
    state.mouse.active = false;
  });

  window.addEventListener("resize", () => {
    cancelAnimationFrame(state.raf);
    resize();
    animate();
  });

  resize();
  animate();
})();
