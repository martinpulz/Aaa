// ---------------- State ----------------
let currentPage = 'home';
let currentLang = 'en';

// ---------------- Page maps ----------------
const pages = {
  home: { en: 'home-page', de: 'home-de-page' },
  test: { en: 'test-page', de: 'test-page' },
  testimonials: { en: 'testimonials-page', de: 'testimonials-de-page' },
  booking: { en: 'booking-page', de: 'booking-de-page' },
  biography: { en: 'biography-page', de: 'biography-de-page' }
};

const translations = {
  en: {
    'page-title': 'Martin Pulz - Piano Lessons',
    'page-description': 'Professional piano lessons with Martin Pulz. Learn piano with an experienced teacher in a supportive environment.',
    'footer-contact-title': 'Contact',
    'footer-social-title': 'Follow',
    'footer-language-label': 'Language:',
    'current-language': 'English',
    'footer-rights': 'All rights reserved.'
  },
  de: {
    'page-title': 'Martin Pulz - Klavierunterricht',
    'page-description': 'Professioneller Klavierunterricht mit Martin Pulz. Lernen Sie Klavier mit einem erfahrenen Lehrer in einer unterstützenden Umgebung.',
    'footer-contact-title': 'Kontakt',
    'footer-social-title': 'Folgen',
    'footer-language-label': 'Sprache:',
    'current-language': 'Deutsch',
    'footer-rights': 'Alle Rechte vorbehalten.'
  }
};

// ---------------- DOM Ready ----------------
document.addEventListener('DOMContentLoaded', function () {
  try {
    console.log('DOM loaded, initializing...');

    // Mobile vh fix
    function setVh() {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    setVh();
    window.addEventListener('resize', setVh);

    // Initialize with home page
    showPage('home', 'en');

    // Initialize other features
    initializeNormalSiteFeatures();
    initializeTestimonialAnimations();
    initializeBubbleGrid();
    initializeExpandingBubbles();

    console.log('Initialization complete');

  } catch (error) {
    console.error('Error during initialization:', error);
    initializeNormalSiteFeatures();
  }
});

function initializeNormalSiteFeatures() {
  // Iframe loading state
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    iframe.addEventListener('load', function () {
      this.style.opacity = '1';
    });
    iframe.style.opacity = '0.5';
    iframe.style.transition = 'opacity 0.3s ease';
  });

  // Cal.com mobile scroll fix
  enableMobileScroll();
  window.addEventListener('resize', enableMobileScroll);
}

function initializeTestimonialAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.log('GSAP not available for testimonials');
    return;
  }

  const testimonialCards = document.querySelectorAll('.page.active .testimonial-card');

  if (testimonialCards.length === 0) return;

  // Reset all cards to invisible state
  gsap.set(testimonialCards, { 
    opacity: 0, 
    y: 60,
    scale: 0.9
  });

  // Animate each card sequentially with stagger
  testimonialCards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top 85%',
      end: 'top 60%',
      onEnter: () => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: index * 0.2, // Stagger effect: left, then right, then center
          ease: 'power3.out'
        });
      },
      once: true // Only trigger once
    });
  });

  console.log('Testimonial animations initialized');
}

function initializeGSAPHero() {
  // Only initialize on home page and if GSAP is available
  if (currentPage !== 'home' || typeof gsap === 'undefined') {
    console.log('Skipping GSAP hero init - page:', currentPage, 'GSAP available:', typeof gsap !== 'undefined');
    return;
  }

  // Find hero elements in current active page (works for both EN and DE)
  const activeHomePage = document.querySelector('.page.active');
  if (!activeHomePage) {
    console.log('No active home page found');
    return;
  }

  const scene = activeHomePage.querySelector('.scene');
  const hero = activeHomePage.querySelector('.hero');
  const heroBg = activeHomePage.querySelector('.hero__bg');
  const heroBgImg = activeHomePage.querySelector('.hero__bg img');
  const bubble = activeHomePage.querySelector('.bubble');

  if (!scene || !hero || !heroBg || !heroBgImg || !bubble) {
    console.log('GSAP Hero elements not found in active page');
    return;
  }

  console.log('Initializing GSAP hero animation...');

  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);
  gsap.set(bubble, { y: "100vh", opacity: 0 });

  // Kill any existing ScrollTriggers
  ScrollTrigger.getAll().forEach(trigger => trigger.kill());

  // Belt & suspenders: initial state to avoid on-screen flash
  gsap.set(bubble, { y: "120vh", opacity: 0, force3D: true });
  // CRITICAL: Reset any existing transforms on both elements
  gsap.set([heroBg, bubble], { clearProps: "transform", force3D: true });
  gsap.set(heroBg, { y: 0, force3D: true }); // Ensure hero starts at 0
  gsap.set(bubble, { y: "120vh", opacity: 0, force3D: true }); // Bubble starts below

  const tl = gsap.timeline({
    defaults: { ease: "power2.out" },
    scrollTrigger: {
      trigger: scene,
      start: "top top",
      end: "+=200%",
      scrub: 0.05,  // Reduced lag for more responsive but still smooth movement
      pin: hero,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      refreshPriority: -1,
      fastScrollEnd: true
    }
  });

  // Phase 1A — rise + base zoom
  tl.add("rise", 0);
  tl.to(heroBgImg, { scale: 1.08, duration: 0.15 }, "rise");
  tl.to(bubble, { y: "45vh", opacity: 1, duration: 0.15 }, "rise");

  // Phase 1B — hold bubble; micro-zoom
  tl.add("midHold");
  tl.to(bubble, { y: "45vh", duration: 0.12 }, "midHold");
  tl.to(heroBgImg, { scale: 1.10, duration: 0.12 }, "midHold");

  // CRITICAL HAND-OFF: Kill all competing transforms and lock both elements
  tl.add("lockPrep");
  tl.set(heroBg, { y: 0 }, "lockPrep"); // Ensure hero is at exactly 0
  tl.set(bubble, { y: "45vh" }, "lockPrep"); // Ensure bubble is at exactly middle





  // Phase 2 — SINGLE unified tween controlling both elements identically
  tl.add("lift");
  tl.to([heroBg, bubble], {





    y: () => -window.innerHeight,  // exact px; recalculated on refresh
    duration: 0.28,      // IDENTICAL transform on both elements
    ease: "none",        // Linear for ultra-smooth scrub feel
    autoRound: false,
    overwrite: true,    // Kill ALL competing tweens
    immediateRender: false, // Don't apply before timeline reaches this point
    force3D: true
  }, "lift");





  tl.to(heroBgImg, { scale: 0.86, filter: "blur(20px)", opacity: 0, duration: 0.24, ease: "power2.out" }, "lift+=0.18");

  // Optional: bubble fades while moving up (doesn't affect motion)
  tl.to(bubble, { opacity: 0, duration: 0.12, ease: "power2.in" }, "lift+=0.10");

  console.log('GSAP hero animation initialized');
}

function initializePhotoSequence() {
  // Only initialize on home page and if GSAP is available
  if (currentPage !== 'home' || typeof gsap === 'undefined') {
    console.log('Skipping photo sequence init - page:', currentPage, 'GSAP available:', typeof gsap !== 'undefined');
    return;
  }

  // Find photo sequence elements in current active page (works for both EN and DE)
  const activeHomePage = document.querySelector('.page.active');
  if (!activeHomePage) {
    console.log('No active home page found for photo sequence');
    return;
  }

  const scene = activeHomePage.querySelector('.photo-sequence-scene');

  // Check for both English and German photo IDs
  const photo1 = activeHomePage.querySelector('#photo1') || activeHomePage.querySelector('#photo1-de');
  const photo2 = activeHomePage.querySelector('#photo2') || activeHomePage.querySelector('#photo2-de');
  const photo3 = activeHomePage.querySelector('#photo3') || activeHomePage.querySelector('#photo3-de');

  // Add this immediately after the photo1/photo2/photo3 lines:
  const blurTop = activeHomePage.querySelector('.photo-sequence-blur-edge.top');
  const blurBottom = activeHomePage.querySelector('.photo-sequence-blur-edge.bottom');

  // start hidden (GSAP will control visibility)
  if (blurTop)    gsap.set(blurTop,    { autoAlpha: 0 });
  if (blurBottom) gsap.set(blurBottom, { autoAlpha: 0 });














  if (!scene || !photo1 || !photo2 || !photo3) {
    console.log('Photo sequence elements not found in active page');
    return;
  }

  console.log('Initializing photo sequence animation...');

  // Kill any existing ScrollTriggers for photos
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.trigger && trigger.trigger.closest('.photo-sequence-container')) {
      trigger.kill();
    }
  });

  // Set initial states for all photos - start hidden and blurred with GPU acceleration
  gsap.set([photo1, photo2, photo3], { opacity: 0, force3D: true });
  photo1.style.filter = 'blur(30px)';
  photo2.style.filter = 'blur(30px)';
  photo3.style.filter = 'blur(30px)';

  // Ensure photo3 is sticky like the others
  photo3.style.position = 'sticky';
  photo3.style.top = '0';

  gsap.set([photo1.querySelector('.photo-sequence-img-small'), photo2.querySelector('.photo-sequence-img-small')], { scale: 1, x: 0, opacity: 1 });
  gsap.set([photo1.querySelector('.photo-sequence-text'), photo2.querySelector('.photo-sequence-text')], { opacity: 1, y: 0 });
  gsap.set(photo3.querySelector('.photo-sequence-img'), { scale: 1.2, transformOrigin: "center center", opacity: 1 });
  // let it start hidden so it can fade in/out
  gsap.set(photo3.querySelector('.photo-sequence-text-center'), {
     opacity: 0,
    visibility: 'hidden',
    scale: 0.9
  });








  // Photo 1 — longer fade-in, slower blur-in
  ScrollTrigger.create({
    trigger: photo1,
    start: "top bottom",
    end: "bottom top",
    scrub: 0.25,
    onUpdate(self) {
      const p = self.progress;              // 0 → 1

      // Tune these two:
      const fadeEnd = 0.75;                 // fade reaches 1.0 at 35% progress
      const blurEnd = 0.20;                 // blur reaches 0px at 20% progress
      const holdEnd = 0.75;                 // start of exit phase

      const entranceEnd = Math.max(fadeEnd, blurEnd);
      const fadeP = Math.min(p / fadeEnd, 1);   // 0 → 1 (slower fade)
      const blurP = Math.min(p / blurEnd, 1);   // 0 → 1 (finishes earlier)

      if (p <= entranceEnd) {
        // ENTRANCE
        gsap.set(photo1, {
          opacity: fadeP,
          filter: `blur(${30 - 30 * blurP}px)`,   // 30px → 0px by blurEnd
          force3D: true
        });
        photo1.classList.remove('active');

        gsap.set(photo1.querySelector('.photo-sequence-img-small'), {
          scale: 1 + 0.1 * fadeP,
          x: -20 + 20 * fadeP,
          force3D: true
        });
        gsap.set(photo1.querySelector('.photo-sequence-text'), {
          opacity: 0.5 + 0.5 * fadeP,
          y: 20 - 20 * fadeP,
          force3D: true
        });
      }
      else if (p <= holdEnd) {
        // HOLD
        gsap.set(photo1, { opacity: 1, filter: "blur(0px)" });
        photo1.classList.add('active');
        gsap.set(photo1.querySelector('.photo-sequence-img-small'), { scale: 1.1, x: 0 });
        gsap.set(photo1.querySelector('.photo-sequence-text'), { opacity: 1, y: 0 });
      }
      else {
        // EXIT
        const outP = (p - holdEnd) / (1 - holdEnd); // 0 → 1
        gsap.set(photo1, {
          opacity: 1 - outP,
          filter: `blur(${30 * outP}px)`
        });
        photo1.classList.remove('active');
        gsap.set(photo1.querySelector('.photo-sequence-img-small'), {
          scale: 1.1 + 0.1 * outP,
          x: 15 * outP
        });
        gsap.set(photo1.querySelector('.photo-sequence-text'), {
          opacity: 1 - outP,
          y: -15 * outP
        });
      }
    }
  });











  // Photo 2 — quick de-blur for image/bubble, super slow background blur
  ScrollTrigger.create({
    trigger: photo2,
    start: "top bottom",
    end: "bottom top",
    scrub: 0.25,
    onUpdate(self) {
      const p = self.progress; // 0 → 1

      // ----- keep the image/bubble fast like before -----
      const fadeEnd = 0.35;   // photo opacity reaches 1 by 35%
      const blurEnd = 0.20;   // photo blur reaches 0 by 20%
      const holdEnd = 0.75;   // after this, start exit

      const entranceEnd = Math.max(fadeEnd, blurEnd);
      const fadeP = Math.min(p / fadeEnd, 1);
      const blurP = Math.min(p / blurEnd, 1);

      if (p <= entranceEnd) {
        // ENTRANCE (fast)
        gsap.set(photo2, {
          opacity: fadeP,
          filter: `blur(${30 - 30 * blurP}px)` // 30 → 0 by 20%
        });
        photo2.classList.remove('active');

        gsap.set(photo2.querySelector('.photo-sequence-img-small'), {
          scale: 1 + 0.1 * fadeP,
          x: 20 - 20 * fadeP
        });
        gsap.set(photo2.querySelector('.photo-sequence-text'), {
          opacity: 0.5 + 0.5 * fadeP,
          y: 20 - 20 * fadeP
        });
      } else if (p <= holdEnd) {
        // HOLD (sharp)
        gsap.set(photo2, { opacity: 1, filter: "blur(0px)" });
        photo2.classList.add('active');
        gsap.set(photo2.querySelector('.photo-sequence-img-small'), { scale: 1.1, x: 0 });
        gsap.set(photo2.querySelector('.photo-sequence-text'), { opacity: 1, y: 0 });
      } else {
        // EXIT (fast)
        const outP = (p - holdEnd) / (1 - holdEnd); // 0 → 1
        gsap.set(photo2, {
          opacity: 1 - outP,
          filter: `blur(${30 * outP}px)`
        });
        photo2.classList.remove('active');
        gsap.set(photo2.querySelector('.photo-sequence-img-small'), {
          scale: 1.1 + 0.1 * outP,
          x: -15 * outP
        });
        gsap.set(photo2.querySelector('.photo-sequence-text'), {
          opacity: 1 - outP,
          y: -15 * outP
        });
      }

      // ----- background blur: takes "eternity" -----
      // ramps up slowly until 90% of the scroll, then fades out in the last 10%
      const BG_MAX_BLUR = 99;     // make this bigger if you want stronger background blur
      const rampFrac = 0.99;      // how much of the scroll is used to ramp up
      let bgBlur;

      if (p <= rampFrac) {
        bgBlur = BG_MAX_BLUR * (p / rampFrac);          // very slow 0 → max
      } else {
        const t = (p - rampFrac) / (1 - rampFrac);       // 0 → 1
        bgBlur = BG_MAX_BLUR * (1 - t);                  // fade out at the end
      }

      const sceneEl = document.querySelector('.photo-sequence-scene');
      if (sceneEl) sceneEl.style.setProperty('--bg-blur', `${bgBlur}px`);
    }
  });
















  // Photo 3 - Layout Center (full photo with centered text) — text bubble locks with photo
  ScrollTrigger.create({
    trigger: photo3,
    start: "top bottom",
    end: "bottom bottom",
    scrub: 0.25,
    onUpdate: (self) => {
      const progress = self.progress;
      const imgEl = photo3.querySelector('.photo-sequence-img');
      const textEl = photo3.querySelector('.photo-sequence-text-center');

      // Blur entrance and fade in (0.0 – 0.15)
      if (progress <= 0.15) {
        const t = progress / 0.15; // 0 → 1
        gsap.set(photo3, {
          opacity: t,
          filter: `blur(${30 - 30*t}px)` // 30 → 0
        });

        // Text bubble fades in centered, slight upward float
        gsap.set(textEl, {
          opacity: t,
          visibility: t > 0 ? 'visible' : 'hidden',
          y: 20 - 20*t,             // 20px → 0 (centered)
          scale: 0.85 + 0.1*t,      // 0.85 → 0.95
          overwrite: 'auto'
        });

        gsap.set(imgEl, { scale: 1.2 + 0.3*t }); // 1.2 → 1.5
      }

      // Hold active and visible - TEXT STAYS CENTERED (0.15 → 0.75)
      else if (progress <= 0.75) {
        gsap.set(photo3, { opacity: 1, filter: "blur(0px)" });

        // Text bubble is fully visible and centered
        gsap.set(textEl, {
          opacity: 1,
          visibility: 'visible',
          y: 0,                     // Centered position
          scale: 0.95,
          overwrite: 'auto'
        });

        gsap.set(imgEl, { scale: 1.5 });
      }

      // Fade out + blur exit - TEXT MOVES UP WITH PHOTO (0.75 → 1.0)
      else {
        const fadeProgress = (progress - 0.75) / 0.25; // 0 → 1
        gsap.set(photo3, {
          opacity: 1 - fadeProgress,
          filter: `blur(${fadeProgress * 30}px)` // 0 → 30
        });

        // Text bubble moves up and fades out with photo
        gsap.set(textEl, {
          opacity: 1 - fadeProgress,
          visibility: (1 - fadeProgress) > 0 ? 'visible' : 'hidden',
          y: -80 * fadeProgress,    // Moves up smoothly
          scale: 0.95 - 0.1*fadeProgress, // 0.95 → 0.85
          overwrite: 'auto'
        });

        gsap.set(imgEl, { scale: 1.5 - 0.2*fadeProgress }); // 1.5 → 1.3
      }
    }
  });










  console.log('Photo sequence animation initialized');
}

// ---------------- Page Meta helpers ----------------
function updatePageMeta() {
  try {
    const titleEl = document.getElementById('page-title');
    const descEl = document.getElementById('page-description');
    if (titleEl && translations[currentLang] && translations[currentLang]['page-title']) {
      titleEl.textContent = translations[currentLang]['page-title'];
    }
    if (descEl && translations[currentLang] && translations[currentLang]['page-description']) {
      descEl.setAttribute('content', translations[currentLang]['page-description']);
    }
  } catch (error) {
    console.error('Error updating page meta:', error);
  }
}

function updateFooterText() {
  try {
    const contactTitle = document.getElementById('footer-contact-title');
    const socialTitle = document.getElementById('footer-social-title');
    const langLabel = document.getElementById('footer-language-label');
    const currentLangEl = document.getElementById('current-language');
    const rightsEl = document.getElementById('footer-rights');

    if (contactTitle && translations[currentLang]) contactTitle.textContent = translations[currentLang]['footer-contact-title'] || 'Contact';
    if (socialTitle && translations[currentLang]) socialTitle.textContent = translations[currentLang]['footer-social-title'] || 'Follow';
    if (langLabel && translations[currentLang]) langLabel.textContent = translations[currentLang]['footer-language-label'] || 'Language:';
    if (currentLangEl && translations[currentLang]) currentLangEl.textContent = translations[currentLang]['current-language'] || 'English';
    if (rightsEl && translations[currentLang]) rightsEl.textContent = translations[currentLang]['footer-rights'] || 'All rights reserved.';
  } catch (error) {
    console.error('Error updating footer text:', error);
  }
}

function showPage(pageKey, lang = currentLang) {
  try {
    console.log('Showing page:', pageKey, 'lang:', lang);

    // Kill any existing ScrollTriggers when changing pages
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    }

    document.querySelectorAll('.page').forEach((page) => page.classList.remove('active'));

    const targetPageId = pages[pageKey] && pages[pageKey][lang];
    if (targetPageId) {
      const targetPage = document.getElementById(targetPageId);
      if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageKey;
        currentLang = lang;
      }
    }

    document.querySelectorAll('.nav-link').forEach((link) => link.classList.remove('active'));
    const activeNavLink = document.querySelector(`[data-page="${pageKey}"]`);
    if (activeNavLink && activeNavLink.classList.contains('nav-link')) {
      activeNavLink.classList.add('active');
    }

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
      btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
    });

    updatePageMeta();
    updateFooterText();

    if (pageKey === 'booking') {
      document.body.classList.add('booking-page');
      setTimeout(() => {
        const iframe = document.querySelector('.cal-embed');
        if (iframe && window.matchMedia('(max-width: 768px)').matches) {
          iframe.style.overflowY = 'auto';
          iframe.style.height = '600px';
        }
      }, 100);
    } else {
      document.body.classList.remove('booking-page');
    }

    // Ensure normal scrolling
    document.body.style.overflow = '';
    window.scrollTo(0, 0);

    // Initialize GSAP animations ONLY for home page
    if (pageKey === 'home') {
      setTimeout(() => {
        initializeGSAPHero();
        initializePhotoSequence();
        initializeAppleBlurOverlay(); // Initialize Apple blur overlay
      }, 100);
    }

    // Initialize testimonial animations for any page that has them
    setTimeout(() => { 
      triggerAnimations();
      initializeTestimonialAnimations();
    }, 200);

  } catch (error) {
    console.error('Error in showPage:', error);
  }
}

function triggerAnimations() {
  try {
    const textSections = document.querySelectorAll('.page.active .text-section');
    textSections.forEach((section, index) => {
      section.classList.remove('is-visible');
      setTimeout(() => {
        section.classList.add('is-visible');
      }, 600 + (index * 200)); // Reduced delay since photo sequence is scroll-driven
    });

    const glassCards = document.querySelectorAll('.page.active .glass-card:not(.text-section)');
    glassCards.forEach((card, index) => {
      if (!card.style.transition) {
        card.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      }
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 1400 + (index * 100)); // Further delayed to show after text sections
    });
  } catch (error) {
    console.error('Error in triggerAnimations:', error);
  }
}

// Global click handler for navigation and language switching
document.addEventListener('click', function (e) {
  try {
    const pageLink = e.target.closest('[data-page]');
    if (pageLink) {
      e.preventDefault();
      const targetPage = pageLink.dataset.page;
      if (targetPage.endsWith('-de')) {
        const basePage = targetPage.replace('-de', '');
        showPage(basePage, 'de');
      } else {
        showPage(targetPage, currentLang);
      }
      return;
    }

    const langBtn = e.target.closest('.lang-btn');
    if (langBtn) {
      const targetLang = langBtn.dataset.lang;
      showPage(currentPage, targetLang);
      return;
    }
  } catch (error) {
    console.error('Error in click handler:', error);
  }
});

// Form submission handler
document.addEventListener('submit', function (e) {
  try {
    if (e.target.id === 'booking-form' || e.target.id === 'booking-form-de') {
      e.preventDefault();

      const isGerman = e.target.id === 'booking-form-de';
      const suffix = isGerman ? '-de' : '';

      const nameEl = document.getElementById('fullName' + suffix);
      const emailEl = document.getElementById('email' + suffix);
      const experienceEl = document.getElementById('experience' + suffix);

      if (!nameEl || !emailEl || !experienceEl) {
        console.error('Form elements not found');
        return;
      }

      const name = nameEl.value.trim();
      const email = emailEl.value.trim();
      const experience = experienceEl.value;

      let isValid = true;
      document.querySelectorAll('.error-message').forEach((el) => (el.textContent = ''));

      if (!name) {
        const errorEl = document.getElementById('fullName' + suffix + '-error');
        if (errorEl) {
          errorEl.textContent = isGerman ? 'Name ist erforderlich' : 'Name is required';
        }
        isValid = false;
      }

      if (!email) {
        const errorEl = document.getElementById('email' + suffix + '-error');
        if (errorEl) {
          errorEl.textContent = isGerman ? 'E-Mail ist erforderlich' : 'Email is required';
        }
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        const errorEl = document.getElementById('email' + suffix + '-error');
        if (errorEl) {
          errorEl.textContent = isGerman ? 'Bitte geben Sie eine gültige E-Mail ein' : 'Please enter a valid email';
        }
        isValid = false;
      }

      if (!experience) {
        const errorEl = document.getElementById('experience' + suffix + '-error');
        if (errorEl) {
          errorEl.textContent = isGerman ? 'Bitte wählen Sie Ihr Erfahrungsniveau' : 'Please select your experience level';
        }
        isValid = false;
      }

      if (isValid) {
        alert(
          isGerman
            ? 'Vielen Dank! Ihre Stundenanfrage wurde gesendet. Ich kontaktiere Sie innerhalb von 24 Stunden.'
            : "Thank you! Your lesson request has been submitted. I'll contact you within 24 hours."
        );
        e.target.reset();
      }
    }
  } catch (error) {
    console.error('Error in form submission:', error);
  }
});

// ---------------- Expanding Bubbles Functionality ----------------
function initializeExpandingBubbles() {
  const cards = Array.from(document.querySelectorAll('.expand-card'));
  const dim = document.getElementById('expand-dim');
  let activeClone = null;
  let activeCard = null;

  // Store original innerHTML
  cards.forEach(c => c._orig = c.innerHTML);

  function createCloneFrom(card) {
    const rect = card.getBoundingClientRect();
    const clone = document.createElement('div');
    clone.className = 'expand-clone';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    const computedStyle = window.getComputedStyle(card);
    clone.style.borderRadius = computedStyle.borderRadius || '26px';

    // Content
    const title = card.dataset.title || '';
    clone.innerHTML = `
      <div class="expand-clone-title">${title}</div>
      <div class="expand-clone-content">(Calendar embed placeholder)</div>
    `;

    document.body.appendChild(clone);
    return { clone, rect };
  }

  function expandCard(card) {
    if (activeClone) return;
    activeCard = card;
    const { clone, rect } = createCloneFrom(card);
    activeClone = { el: clone, rect };

    // Hide original visually but keep layout
    card.style.opacity = '0';

    // Show dim
    dim.classList.add('active');

    // Force reflow then animate to center/full size
    requestAnimationFrame(() => {
      const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
      const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
      const targetW = Math.round(vw * 0.92);
      const targetH = Math.round(vh * 0.82);
      const targetLeft = Math.round((vw - targetW) / 2);
      const targetTop = Math.round((vh - targetH) / 2);

      clone.style.transition = 'all 0.5s cubic-bezier(.25,.1,.25,1)';
      clone.style.left = targetLeft + 'px';
      clone.style.top = targetTop + 'px';
      clone.style.width = targetW + 'px';
      clone.style.height = targetH + 'px';
      clone.style.borderRadius = '36px';
    });

    // Close when clicking outside clone
    setTimeout(() => {
      document.addEventListener('click', outsideClick);
      document.addEventListener('keydown', escHandler);
    }, 60);
  }

  function outsideClick(e) {
    if (!activeClone) return;
    if (e.target.closest('.expand-clone')) return; // Clicked inside
    collapseClone();
  }

  function collapseClone() {
    if (!activeClone) return;
    const { el: clone, rect } = activeClone;

    // Animate back to original rect
    clone.style.transition = 'all 0.5s cubic-bezier(.25,.1,.25,1)';
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    const activeComputedStyle = window.getComputedStyle(activeCard);
    clone.style.borderRadius = activeComputedStyle.borderRadius || '26px';

    // After animation ends remove clone and restore original
    clone.addEventListener('transitionend', onTransitionEnd);

    function onTransitionEnd() {
      clone.removeEventListener('transitionend', onTransitionEnd);
      try {
        clone.remove();
      } catch (e) {}
      if (activeCard) {
        activeCard.style.opacity = '';
        activeCard.innerHTML = activeCard._orig; // Ensure original content
      }
      activeClone = null;
      activeCard = null;
      dim.classList.remove('active');
      document.removeEventListener('click', outsideClick);
      document.removeEventListener('keydown', escHandler);
    }
  }

  function escHandler(e) {
    if (e.key === 'Escape') collapseClone();
  }

  document.addEventListener('click', (e) => {
    const card = e.target.closest('.expand-card');
    if (!card) return;
    // If clicking original while clone open, ignore
    if (activeClone) return;
    expandCard(card);
  });
}

// Form submission handler
document.addEventListener('submit', function (e) {
  try {
    if (e.target.id === 'booking-form' || e.target.id === 'booking-form-de') {
      e.preventDefault();

      const isGerman = e.target.id === 'booking-form-de';
      const suffix = isGerman ? '-de' : '';

      const nameEl = document.getElementById('fullName' + suffix);
      const emailEl = document.getElementById('email' + suffix);
      const experienceEl = document.getElementById('experience' + suffix);

      if (!nameEl || !emailEl || !experienceEl) {
        console.error('Form elements not found');
        return;
      }

      const name = nameEl.value.trim();
      const email = emailEl.value.trim();
      const experience = experienceEl.value;

      let isValid = true;
      document.querySelectorAll('.error-message').forEach((el) => (el.textContent = ''));

      if (!name) {
        const errorEl = document.getElementById('fullName' + suffix + '-error');
        if (errorEl) {
          errorEl.textContent = isGerman ? 'Name ist erforderlich' : 'Name is required';
        }
        isValid = false;
      }

      if (!email) {
        const errorEl = document.getElementById('email' + suffix + '-error');
        if (errorEl) {
          errorEl.textContent = isGerman ? 'E-Mail ist erforderlich' : 'Email is required';
        }
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        const errorEl = document.getElementById('email' + suffix + '-error');
        if (errorEl) {
          errorEl.textContent = isGerman ? 'Bitte geben Sie eine gültige E-Mail ein' : 'Please enter a valid email';
        }
        isValid = false;
      }

      if (!experience) {
        const errorEl = document.getElementById('experience' + suffix + '-error');
        if (errorEl) {
          errorEl.textContent = isGerman ? 'Bitte wählen Sie Ihr Erfahrungsniveau' : 'Please select your experience level';
        }
        isValid = false;
      }

      if (isValid) {
        alert(
          isGerman
            ? 'Vielen Dank! Ihre Stundenanfrage wurde gesendet. Ich kontaktiere Sie innerhalb von 24 Stunden.'
            : "Thank you! Your lesson request has been submitted. I'll contact you within 24 hours."
        );
        e.target.reset();
      }
    }
  } catch (error) {
    console.error('Error in form submission:', error);
  }
});

// Smooth scroll for anchor links
document.addEventListener('click', function (e) {
  try {
    const link = e.target.closest('a[href^="#"]');
    if (link && !link.hasAttribute('data-page')) {
      const href = link.getAttribute('href');
      if (href === '#' || href.length <= 1) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  } catch (error) {
    console.error('Error in smooth scroll:', error);
  }
});

function enableMobileScroll() {
  try {
    const iframe = document.querySelector('.cal-embed');
    if (iframe && window.matchMedia('(max-width: 768px)').matches) {
      iframe.style.overflowY = 'auto';
      iframe.style.height = '600px';
    }
  } catch (error) {
    console.error('Error in enableMobileScroll:', error);
  }
}













function initializeAppleBlurOverlay() {
  // Only initialize on home page and if GSAP is available
  if (currentPage !== 'home' || typeof gsap === 'undefined') {
    console.log('Skipping Apple blur overlay init - page:', currentPage, 'GSAP available:', typeof gsap !== 'undefined');
    return;
  }

  // Find elements in the currently active page
  const activePage = document.querySelector('.page.active');
  if (!activePage) return;

  const seamBlur = document.querySelector('.apple-blur-overlay');
  const heroWrap = activePage.querySelector('.scene');                 // pinned section
  const heroEl   = activePage.querySelector('.scene .hero') || heroWrap;
  const photos   = activePage.querySelector('.photo-sequence-scene');

  if (seamBlur && heroWrap && heroEl && photos) {
    // let JS drive vertical placement
    seamBlur.style.position = 'fixed';
    seamBlur.style.left = '0';
    seamBlur.style.right = '0';
    seamBlur.style.zIndex = '50';
    seamBlur.style.pointerEvents = 'none';
    seamBlur.style.removeProperty('bottom');

    const Y_OFFSET = -45; // tweak seam by a few px if needed
    const overlayH = () => seamBlur.getBoundingClientRect().height || window.innerHeight * 0.32;

    function placeBand() {
      const heroBottom = heroEl.getBoundingClientRect().bottom; // px from viewport top
      const photosTop  = photos.getBoundingClientRect().top;    // px from viewport top
      const bandH = overlayH();

      let targetTop;
      if (photosTop <= 0) {
        // photo sequence top is at/above viewport top → center on viewport top
        targetTop = (-bandH / 2) + Y_OFFSET;
      } else if (photosTop < window.innerHeight) {
        // during the handoff region → center on whichever edge is leading
        if (heroBottom < photosTop) {
          targetTop = (heroBottom - bandH / 2) + Y_OFFSET; // center on hero bottom
        } else {
          targetTop = (photosTop  - bandH / 2) + Y_OFFSET; // center on photos top
        }
      } else {
        // photos not near yet → center on hero bottom
        targetTop = (heroBottom - bandH / 2) + Y_OFFSET;
      }

      seamBlur.style.top = `${Math.round(targetTop)}px`;
    }

    // SINGLE trigger: visible only between end of hero pin and start of photos
    ScrollTrigger.create({
      trigger: heroWrap,
      start: 'bottom 55%',             // when hero pin ends
      endTrigger: photos,
      end: 'top top',                  // until photos top hits top
      scrub: true,
      onEnter:      () => { seamBlur.classList.add('show'); placeBand(); },
      onEnterBack:  () => { seamBlur.classList.add('show'); placeBand(); },
      onUpdate:     placeBand,
      onLeave:      () => seamBlur.classList.remove('show'),
      onLeaveBack:  () => seamBlur.classList.remove('show')
    });

    // keep correct on resize/refresh
    ScrollTrigger.addEventListener('refreshInit', placeBand);
    window.addEventListener('resize', () => ScrollTrigger.refresh());
  }

  console.log('Apple blur overlay initialized');
}

// Good hygiene: fix measurements after assets load
window.addEventListener('load', () => {
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.refresh();
  }
  // Re-initialize photo sequence to ensure it works after page load
  if (currentPage === 'home') {
    setTimeout(() => {
      initializePhotoSequence();
    }, 200);
  }
});




























// ---------------- Bubble Grid Functionality ----------------
function initializeBubbleGrid() {
  const bubbleItems = document.querySelectorAll('.bubble-item');
  const overlay = document.getElementById('bubbleOverlay');
  const closeBtn = document.getElementById('closeOverlay');
  const overlayIcon = overlay?.querySelector('.overlay-icon');
  const overlayTitle = overlay?.querySelector('.overlay-title');
  const overlayDescription = overlay?.querySelector('.overlay-description');

  const categoryContent = {
    vocal: {
      icon: '🎤',
      title: 'Vocal Accompanying',
      description: 'Professional piano accompaniment for vocalists of all levels. From classical arias to musical theatre, I provide supportive and expressive accompaniment.'
    },
    instrumental: {
      icon: '🎻',
      title: 'Instrumental Accompanying',
      description: 'Expert accompaniment for string, wind, and brass instruments. Perfect for exams, competitions, and performances.'
    },
    auditions: {
      icon: '🎭',
      title: 'Audition Preparation',
      description: 'Comprehensive support for music school and professional auditions. We\'ll work together to polish your pieces and build confidence.'
    },
    recitals: {
      icon: '🎹',
      title: 'Recital Performances',
      description: 'Collaborative performances for student and professional recitals. Sensitive musical partnership for your special event.'
    },
    chamber: {
      icon: '🎼',
      title: 'Chamber Music',
      description: 'Experienced collaborative pianist for chamber music ensembles. Let\'s create beautiful music together.'
    },
    recording: {
      icon: '🎙️',
      title: 'Recording Sessions',
      description: 'Studio-quality accompaniment for recordings, demos, and audition tapes. Professional and reliable service.'
    }
  };

  bubbleItems.forEach(item => {
    item.addEventListener('click', () => {
      const category = item.dataset.category;
      const content = categoryContent[category];

      if (content && overlay) {
        if (overlayIcon) overlayIcon.textContent = content.icon;
        if (overlayTitle) overlayTitle.textContent = content.title;
        if (overlayDescription) overlayDescription.textContent = content.description;

        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  if (closeBtn && overlay) {
    closeBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close on overlay background click
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('active')) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

console.log('Martin Pulz Piano Website - GSAP ScrollTrigger Implementation loaded successfully');