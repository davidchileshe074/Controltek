(function () {
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

  let lastScrollY = window.scrollY;
  const backToTop = document.getElementById("backToTop");

  const heroBgTrack = document.querySelector(".hero__background-track");
  const heroGalleryNav = document.querySelector(".hero__gallery-nav");
  const heroCaptionTitle = document.querySelector(".hero__caption-title");
  const heroCaptionText = document.querySelector(".hero__caption-text");
  if (heroBgTrack) {
    const heroBgSlides = Array.from(heroBgTrack.children);

    if (heroBgSlides.length > 1) {
      const heroSlideMeta = heroBgSlides.map((slide, index) => ({
        background: slide.style.backgroundImage,
        title: slide.dataset.title || `Featured project ${index + 1}`,
        caption: slide.dataset.caption || "",
      }));
      const loopSlide = heroBgSlides[0].cloneNode(true);
      loopSlide.setAttribute("aria-hidden", "true");
      heroBgTrack.appendChild(loopSlide);

      const slideCount = heroBgSlides.length;
      const slideDuration = 1100;
      const slideDelay = 7600;
      let heroBgIndex = 0;
      let heroBgTimer = null;
      let heroBgResetTimer = null;
      const heroThumbs = [];

      const setActiveSlideMeta = (index) => {
        const meta = heroSlideMeta[index % slideCount];
        if (!meta) return;

        if (heroCaptionTitle) {
          heroCaptionTitle.textContent = meta.title;
        }

        if (heroCaptionText) {
          heroCaptionText.textContent = meta.caption;
        }

        heroThumbs.forEach((thumb, thumbIndex) => {
          const isActive = thumbIndex === index;
          thumb.classList.toggle("is-active", isActive);
          thumb.setAttribute("aria-current", isActive ? "true" : "false");
        });
      };

      const moveToSlide = (index, animate = true) => {
        heroBgTrack.style.transition = animate
          ? `transform ${slideDuration}ms cubic-bezier(0.77, 0, 0.18, 1)`
          : "none";
        heroBgTrack.style.transform = `translate3d(-${index * 100}%, 0, 0)`;
        setActiveSlideMeta(index % slideCount);
      };

      const nextSlide = () => {
        heroBgIndex += 1;
        moveToSlide(heroBgIndex, true);

        if (heroBgIndex === slideCount - 1) {
          window.clearTimeout(heroBgResetTimer);
          heroBgResetTimer = window.setTimeout(() => {
            heroBgIndex = 0;
            moveToSlide(0, false);
          }, slideDuration);
        }
      };

      const clearTimers = () => {
        window.clearInterval(heroBgTimer);
        window.clearTimeout(heroBgResetTimer);
        heroBgTimer = null;
        heroBgResetTimer = null;
      };

      const startTimer = () => {
        if (prefersReducedMotion || slideCount < 2) return;

        clearTimers();
        heroBgTimer = window.setInterval(nextSlide, slideDelay);
      };

      const goToSlide = (index) => {
        heroBgIndex = index;
        moveToSlide(index, true);
        clearTimers();
        startTimer();
      };

      if (heroGalleryNav) {
        heroGalleryNav.innerHTML = "";

        heroSlideMeta.forEach((meta, index) => {
          const thumb = document.createElement("button");
          thumb.type = "button";
          thumb.className = "hero__thumb";
          thumb.style.backgroundImage = meta.background;
          thumb.setAttribute("aria-label", `${meta.title}. ${meta.caption}`);
          thumb.title = meta.title;
          thumb.addEventListener("click", () => goToSlide(index));
          heroGalleryNav.appendChild(thumb);
          heroThumbs.push(thumb);
        });
      }

      moveToSlide(0, false);
      setActiveSlideMeta(0);

      if (!prefersReducedMotion) {
        startTimer();

        document.addEventListener("visibilitychange", () => {
          if (document.hidden) {
            clearTimers();
            return;
          }

          startTimer();
        });
      }
    }
  }

  const setHeaderState = () => {
    const currentScrollY = window.scrollY;
    
    // Sticky state
    header?.classList.toggle("is-scrolled", currentScrollY > 24);
    
    // Keep header visible
    header?.classList.remove("is-hidden");
    
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

  // Mobile mega menu: click to toggle the Services dropdown accordion
  const dropdownItems = Array.from(document.querySelectorAll(".nav-item.has-dropdown"));
  dropdownItems.forEach((item) => {
    const trigger = item.querySelector(":scope > a");
    const megaMenu = item.querySelector(".mega-menu");
    if (!trigger || !megaMenu) return;

    trigger.addEventListener("click", (e) => {
      // Only intercept on mobile breakpoint
      if (window.innerWidth > 1080) return;
      e.preventDefault();
      const isOpen = item.classList.toggle("is-open");
      megaMenu.classList.toggle("is-open", isOpen);
    });

    // Close the mega menu when an inner link is clicked
    megaMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        item.classList.remove("is-open");
        megaMenu.classList.remove("is-open");
        nav?.classList.remove("is-open");
        navToggle?.classList.remove("is-open");
        navToggle?.setAttribute("aria-expanded", "false");
      });
    });
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      // Don't close nav when clicking the Services trigger on mobile (it toggles)
      if (link.closest(".has-dropdown") && window.innerWidth <= 1080) return;
      nav?.classList.remove("is-open");
      navToggle?.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  const galleryNav = document.querySelector(".gallery-nav");
  const galleryCards = Array.from(document.querySelectorAll(".gallery-card"));

  if (galleryNav && galleryCards.length) {
    const filterButtons = Array.from(galleryNav.querySelectorAll("[data-filter]"));

    const setFilter = (filter) => {
      galleryCards.forEach((card) => {
        const category = card.dataset.category || "all";
        const isVisible = filter === "all" || category === filter;
        card.classList.toggle("is-hidden", !isVisible);
        card.setAttribute("aria-hidden", String(!isVisible));
      });
    };

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => {
          const isActive = btn === button;
          btn.classList.toggle("is-active", isActive);
          btn.setAttribute("aria-pressed", String(isActive));
        });

        setFilter(button.dataset.filter || "all");
      });
    });
  }

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

  const FORMSUBMIT_EMAIL = "controltekservices3@gmail.com";
  const WHATSAPP_NUMBER = "260978245904";
  const WHATSAPP_NUMBER2 = "260978508059";

  window.openWhatsAppBoth = (message = "") => {
    const text = message ? `?text=${encodeURIComponent(message)}` : "";
    window.open(`https://wa.me/${WHATSAPP_NUMBER}${text}`, "_blank", "noopener,noreferrer");
    setTimeout(() => {
      window.open(`https://wa.me/${WHATSAPP_NUMBER2}${text}`, "_blank", "noopener,noreferrer");
    }, 300);
  };

  const submitRequestForm = async (form, note, successMessage, fallbackMessage) => {
    const data = new FormData(form);
    const name = String(data.get("name") || data.get("quoteName") || "").trim();
    const phone = String(data.get("phone") || data.get("quotePhone") || "").trim();
    const service = String(data.get("service") || data.get("quoteType") || "").trim();
    const details = String(data.get("message") || data.get("quoteDetails") || "").trim();
    const files = Array.from(document.getElementById("projectFiles")?.files || document.getElementById("quoteFiles")?.files || []).map((file) => file.name);

    note.textContent = successMessage;

    let emailSent = false;

    try {
      const response = await fetch(`https://formsubmit.co/ajax/${FORMSUBMIT_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          Name: name,
          Phone: phone,
          Service: form.id === "contactForm" ? service : `Quote request - ${service}`,
          Details: details || "No details provided.",
          Files: files.length ? files.join(", ") : "None",
          _subject: form.id === "contactForm" ? `New Contact Request from ${name}` : `New Quote Request from ${name}`
        })
      });

      if (response.ok) {
        emailSent = true;
      }
    } catch (error) {
      console.error("FormSubmit error:", error);
    }

    const waMessage = `*New ${form.id === "contactForm" ? "Contact Request" : "Quote Request"} — Controltek Services*\n\n*Name:* ${name}\n*Phone:* ${phone}\n*${form.id === "contactForm" ? "Service" : "Project Type"}:* ${service}\n*Project Files:* ${files.length ? files.join(", ") : "None"}\n\n*Details:*\n${details || "No details provided."}\n\n_Sent from Controltek Services website_`;

    window.openWhatsAppBoth(waMessage);
    note.textContent = emailSent
      ? "Your request has been sent successfully. We will contact you shortly."
      : "Your request has been sent successfully. We will contact you shortly.";
    form.reset();
  };

  contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitRequestForm(
      contactForm,
      formNote,
      "Sending your request...",
      "Your request was sent via WhatsApp. We will follow up shortly."
    );
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

  modalForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitRequestForm(
      modalForm,
      modalNote,
      "Sending your quotation request...",
      "Your quotation request was sent via WhatsApp. We will follow up shortly."
    );
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
