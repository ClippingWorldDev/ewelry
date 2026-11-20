/**
 * Studio API Configuration
 * Plug in your production backend endpoints below to enable live form submissions.
 */
window.STUDIO_API = {
  trialEndpoint: '',
  quoteEndpoint: '',
  contactEndpoint: '',
  contactEmail: 'studio@bestjewelryretouching.com',
  maxTrialFiles: 2,
  maxFileSizeBytes: 250 * 1024 * 1024,
  allowedExtensions: ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'psd', 'cr2', 'cr3', 'nef', 'arw', 'dng', 'webp']
};

(function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1. HASH ROUTING & MULTI-VIEW NAVIGATION
     ---------------------------------------------------------------------- */
  const PAGE_TITLES = {
    home: 'Best Jewelry Retouching | Luxury Post-Production Studio for USA & Europe',
    about: 'About Studio | Best Jewelry Retouching',
    trial: 'Free Trial (2 Test Images) | Best Jewelry Retouching',
    quote: 'Get Custom Quote | Best Jewelry Retouching',
    contact: 'Contact Us | Best Jewelry Retouching',
    privacy: 'Privacy Policy | Best Jewelry Retouching',
    terms: 'Terms & Conditions | Best Jewelry Retouching'
  };

  const HOME_ANCHORS = new Set([
    'services', 'service-1', 'service-2', 'service-3', 'service-4',
    'macro-loupe', 'colorways', 'pricing',
    'how-we-work', 'portfolio', 'workflow', 'why-us', 'testimonials',
    'free-trial-home', 'faq'
  ]);

  let lenis = null;
  let testimonialsSwiper = null;

  function parseHash(rawHash) {
    const clean = (rawHash || '#home').replace(/^#/, '').trim();
    if (!clean || clean === 'home') return { page: 'home', anchor: null };
    if (PAGE_TITLES[clean]) return { page: clean, anchor: null };
    if (HOME_ANCHORS.has(clean)) return { page: 'home', anchor: clean };
    return { page: 'home', anchor: null };
  }

  function refreshMotion() {
    if (lenis && typeof lenis.resize === 'function') lenis.resize();
    if (testimonialsSwiper && typeof testimonialsSwiper.update === 'function') {
      testimonialsSwiper.update();
    }
    if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
      window.ScrollTrigger.refresh();
    }
  }

  function scrollToAnchor(anchorId) {
    const offset = 88;

    if (!anchorId) {
      if (lenis) {
        lenis.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      return;
    }

    const el = document.getElementById(anchorId);
    if (!el) return;

    if (lenis) {
      lenis.scrollTo(el, { offset: -offset, duration: 1.0 });
    } else {
      const y = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }

  function navigateRoute(hash, shouldScroll = true) {
    const { page, anchor } = parseHash(hash);

    document.querySelectorAll('.page-view').forEach((view) => {
      view.classList.toggle('active', view.id === 'page-' + page);
    });

    document.querySelectorAll('[data-route]').forEach((link) => {
      link.classList.toggle('active', link.getAttribute('data-route') === page);
    });

    document.title = PAGE_TITLES[page] || PAGE_TITLES.home;
    closeMobileDrawer();

    if (shouldScroll) {
      requestAnimationFrame(() => {
        scrollToAnchor(anchor);
        refreshMotion();
      });
    } else {
      refreshMotion();
    }
  }

  /* ----------------------------------------------------------------------
     2. MOBILE DRAWER
     ---------------------------------------------------------------------- */
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOpenBtn = document.getElementById('mobileMenuOpen');
  const mobileCloseBtn = document.getElementById('mobileMenuClose');
  const mobileBackdrop = document.getElementById('mobileDrawerBackdrop');

  function openMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    if (mobileOpenBtn) mobileOpenBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    if (mobileCloseBtn) mobileCloseBtn.focus();
  }

  function closeMobileDrawer() {
    if (!mobileDrawer || !mobileDrawer.classList.contains('open')) return;
    mobileDrawer.classList.remove('open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    if (mobileOpenBtn) mobileOpenBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (mobileOpenBtn) mobileOpenBtn.addEventListener('click', openMobileDrawer);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', () => {
    closeMobileDrawer();
    if (mobileOpenBtn) mobileOpenBtn.focus();
  });
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileDrawer);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeMobileDrawer();
      if (mobileOpenBtn) mobileOpenBtn.focus();
    }
  });
  document.addEventListener('click', (e) => {
    const trialLink = e.target.closest('[data-preselect-trial]');
    if (trialLink) {
      const val = trialLink.getAttribute('data-preselect-trial');
      document.querySelectorAll('.js-trial-service').forEach((sel) => { sel.value = val; });
    }
  });

  /* ----------------------------------------------------------------------
     3. DYNAMIC DUAL-IMAGE (OLD VS NEW) BEFORE / AFTER SLIDERS
     ---------------------------------------------------------------------- */
  function initSliders() {
    document.querySelectorAll('[data-ba-slider]').forEach((slider) => {
      if (slider.hasAttribute('data-ba-initialized')) return;
      slider.setAttribute('data-ba-initialized', 'true');

      const newSrc = slider.getAttribute('data-new-image') || slider.getAttribute('data-after');
      const oldSrc = slider.getAttribute('data-old-image') || slider.getAttribute('data-before');
      const altText = slider.getAttribute('data-alt') || 'Jewelry Retouching Masterpiece';
      const oldLabel = slider.getAttribute('data-old-label') || 'Old (Raw)';
      const newLabel = slider.getAttribute('data-new-label') || 'New (Master)';

      // If the container only has data-old-image and data-new-image attributes (no nested layers),
      // mount the slider markup
      if (!slider.querySelector('.ba-layer')) {
        slider.innerHTML = `
          <div class="ba-layer ba-layer--new ba-layer--after">
            <img src="${newSrc || ''}" class="ba-img ba-img--new" alt="New Retouched Master: ${altText}" loading="lazy" decoding="async" />
          </div>
          <div class="ba-layer ba-layer--old ba-layer--before">
            <img src="${oldSrc || ''}" class="ba-img ba-img--old" alt="Old Raw Capture: ${altText}" loading="lazy" decoding="async" />
          </div>
          <div class="ba-divider" aria-hidden="true"></div>
          <span class="ba-badge ba-badge--old ba-badge--before">${oldLabel}</span>
          <span class="ba-badge ba-badge--new ba-badge--after">${newLabel}</span>
          <button type="button" class="ba-handle" role="slider" aria-label="Compare ${oldLabel} and ${newLabel} for ${altText}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M6.5 4.5L2.5 9L6.5 13.5M11.5 4.5L15.5 9L11.5 13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        `;
      } else {
        const newImg = slider.querySelector('.ba-layer--new img, .ba-layer--after img');
        const oldImg = slider.querySelector('.ba-layer--old img, .ba-layer--before img');
        if (newSrc && newImg && !newImg.getAttribute('src')) newImg.src = newSrc;
        if (oldSrc && oldImg && !oldImg.getAttribute('src')) oldImg.src = oldSrc;
      }

      // Add Glare layer for 3D holographic tilt reflection
      if (!slider.querySelector('.ba-glare')) {
        const glare = document.createElement('div');
        glare.className = 'ba-glare';
        slider.appendChild(glare);
      }

      const handle = slider.querySelector('.ba-handle');
      if (!handle) return;

      let pct = 50;

      const setPos = (value) => {
        pct = Math.max(2, Math.min(98, value));
        slider.style.setProperty('--pos', pct + '%');
        handle.setAttribute('aria-valuenow', String(Math.round(pct)));
      };

      const updateFromClientX = (clientX) => {
        const rect = slider.getBoundingClientRect();
        if (!rect.width) return;
        const x = clientX - rect.left;
        setPos((x / rect.width) * 100);
      };

      let activePointerId = null;

      const onPointerMove = (e) => {
        if (activePointerId !== e.pointerId) return;
        updateFromClientX(e.clientX);
        if (e.cancelable) e.preventDefault();
      };

      const onPointerEnd = (e) => {
        if (activePointerId !== e.pointerId) return;
        activePointerId = null;
        slider.classList.remove('is-dragging');
        try {
          slider.releasePointerCapture(e.pointerId);
        } catch (_) {}
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerEnd);
        window.removeEventListener('pointercancel', onPointerEnd);
      };

      const onPointerDown = (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        activePointerId = e.pointerId;
        slider.classList.add('is-dragging');
        try {
          slider.setPointerCapture(e.pointerId);
        } catch (_) {}

        updateFromClientX(e.clientX);

        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerEnd);
        window.addEventListener('pointercancel', onPointerEnd);
      };

      slider.addEventListener('pointerdown', onPointerDown);

      handle.addEventListener('keydown', (e) => {
        const step = e.shiftKey ? 10 : 2;
        if (e.key === 'ArrowLeft') { e.preventDefault(); setPos(pct - step); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); setPos(pct + step); }
        else if (e.key === 'Home') { e.preventDefault(); setPos(2); }
        else if (e.key === 'End') { e.preventDefault(); setPos(98); }
      });

      setPos(50);
    });
  }

  // Public API to dynamically update any slider's Old & New images programmatically
  window.updateSliderImages = function (sliderElOrSelector, oldImageSrc, newImageSrc) {
    const slider = typeof sliderElOrSelector === 'string'
      ? document.querySelector(sliderElOrSelector)
      : sliderElOrSelector;
    if (!slider) return;

    if (oldImageSrc) {
      slider.setAttribute('data-old-image', oldImageSrc);
      slider.setAttribute('data-before', oldImageSrc);
      const oldImg = slider.querySelector('.ba-layer--old img, .ba-layer--before img');
      if (oldImg) oldImg.src = oldImageSrc;
    }

    if (newImageSrc) {
      slider.setAttribute('data-new-image', newImageSrc);
      slider.setAttribute('data-after', newImageSrc);
      const newImg = slider.querySelector('.ba-layer--new img, .ba-layer--after img');
      if (newImg) newImg.src = newImageSrc;
    }
  };

  /* ----------------------------------------------------------------------
     3B. GSAP 3D IMAGE TILT ON HOVER (LUXURY HOLOGRAPHIC SPECULAR DEPTH)
     ---------------------------------------------------------------------- */
  function init3DImageTilt() {
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(hover: none)').matches;
    if (isTouch) return;
    if (!window.gsap) return;

    const tiltElements = document.querySelectorAll(
      '.hero-frame, .service-media .ba-slider, .pf-card .ba-slider, [data-tilt]'
    );

    tiltElements.forEach((el) => {
      let bounds = null;
      const glare = el.querySelector('.ba-glare');

      const onMouseEnter = () => {
        bounds = el.getBoundingClientRect();
        el.classList.add('is-hovered');
      };

      const onMouseMove = (e) => {
        if (el.classList.contains('is-dragging')) return;
        if (!bounds) bounds = el.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;

        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const xRel = (mouseX / bounds.width) - 0.5; // -0.5 to 0.5
        const yRel = (mouseY / bounds.height) - 0.5;

        const maxTilt = 9; // degrees noticeable luxury 3D tilt
        const rotY = xRel * maxTilt;
        const rotX = -yRel * maxTilt;

        window.gsap.to(el, {
          rotateX: rotX,
          rotateY: rotY,
          scale: 1.02,
          transformPerspective: 1000,
          ease: 'power1.out',
          duration: 0.3,
          overwrite: 'auto'
        });

        // Dynamic specular glare lighting
        if (glare) {
          const glareX = (mouseX / bounds.width) * 100;
          const glareY = (mouseY / bounds.height) * 100;
          glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 65%)`;
        }
      };

      const onMouseLeave = () => {
        bounds = null;
        el.classList.remove('is-hovered');
        window.gsap.to(el, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          ease: 'power2.out',
          duration: 0.6,
          overwrite: 'auto'
        });
      };

      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mousemove', onMouseMove);
      el.addEventListener('mouseleave', onMouseLeave);
    });
  }

  /* ----------------------------------------------------------------------
     3C. 400% MACRO LOUPE INSPECTOR INTERACTIVE LENS
     ---------------------------------------------------------------------- */
  function initMacroLoupe() {
    const wrap = document.querySelector('.js-macro-loupe');
    if (!wrap) return;

    const lens = wrap.querySelector('.macro-loupe-lens');
    const zoomImg = wrap.querySelector('.macro-loupe-zoom-img');
    if (!lens || !zoomImg) return;

    const zoomFactor = 3.5;

    const updateLoupe = (clientX, clientY) => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

      lens.style.left = `${x}px`;
      lens.style.top = `${y}px`;

      zoomImg.style.left = `${-x * (zoomFactor - 1)}px`;
      zoomImg.style.top = `${-y * (zoomFactor - 1)}px`;
    };

    const onMouseEnter = (e) => {
      lens.classList.add('active');
      updateLoupe(e.clientX, e.clientY);
    };

    const onMouseMove = (e) => {
      updateLoupe(e.clientX, e.clientY);
    };

    const onMouseLeave = () => {
      lens.classList.remove('active');
    };

    wrap.addEventListener('mouseenter', onMouseEnter);
    wrap.addEventListener('mousemove', onMouseMove);
    wrap.addEventListener('mouseleave', onMouseLeave);

    // Touch support for mobile / tablets
    wrap.addEventListener('touchstart', (e) => {
      if (!e.touches.length) return;
      lens.classList.add('active');
      updateLoupe(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    wrap.addEventListener('touchmove', (e) => {
      if (!e.touches.length) return;
      updateLoupe(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    wrap.addEventListener('touchend', () => {
      lens.classList.remove('active');
    });
  }

  /* ----------------------------------------------------------------------
     3D. 1 SKU, 4 LUXURY METAL COLORWAYS GSAP SWITCHER
     ---------------------------------------------------------------------- */
  function initColorwayStudio() {
    const swatchBtns = document.querySelectorAll('.swatch-btn[data-alloy-target]');
    const images = {
      yellow: document.getElementById('colorwayImgYellow'),
      rose: document.getElementById('colorwayImgRose'),
      white: document.getElementById('colorwayImgWhite'),
      black: document.getElementById('colorwayImgBlack')
    };
    const badgeText = document.getElementById('colorwayBadgeText');
    if (!swatchBtns.length || !images.yellow) return;

    const alloyTitles = {
      yellow: '18K Classic Yellow Gold Alloy',
      rose: '18K Blush Rose Gold Alloy',
      white: 'Platinum / 18K White Gold Alloy',
      black: 'Gunmetal Black Rhodium Finish'
    };

    let activeAlloy = 'yellow';

    swatchBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetAlloy = btn.getAttribute('data-alloy-target');
        if (targetAlloy === activeAlloy || !images[targetAlloy]) return;

        // Update active button state
        swatchBtns.forEach((b) => {
          const isCurrent = b === btn;
          b.setAttribute('aria-selected', String(isCurrent));
          const statusSpan = b.querySelector('.swatch-status');
          if (statusSpan) {
            statusSpan.textContent = isCurrent ? 'Active' : 'Select';
            statusSpan.className = isCurrent
              ? 'text-xs text-gold font-semibold uppercase tracking-wider swatch-status'
              : 'text-xs text-stone-400 font-semibold uppercase tracking-wider swatch-status';
          }
        });

        // Update badge text
        if (badgeText && alloyTitles[targetAlloy]) {
          badgeText.textContent = alloyTitles[targetAlloy];
        }

        // GSAP Cross-fade transition
        if (window.gsap) {
          window.gsap.to(images[activeAlloy], {
            opacity: 0,
            duration: 0.45,
            ease: 'power2.out',
            onComplete: () => {
              images[activeAlloy].classList.remove('active');
            }
          });

          images[targetAlloy].classList.add('active');
          window.gsap.fromTo(images[targetAlloy],
            { opacity: 0, scale: 1.015 },
            { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out' }
          );
        } else {
          images[activeAlloy].style.opacity = '0';
          images[targetAlloy].style.opacity = '1';
        }

        activeAlloy = targetAlloy;
      });
    });
  }

  /* ----------------------------------------------------------------------
     4. PORTFOLIO FILTERING WITH SMOOTH GSAP TRANSITION
     ---------------------------------------------------------------------- */
  function initPortfolioFilters() {
    const chips = document.querySelectorAll('.pf-chip[data-filter]');
    const cards = document.querySelectorAll('.pf-card[data-cat]');

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const filter = chip.getAttribute('data-filter');
        chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));

        const visibleCards = [];
        cards.forEach((card) => {
          const show = filter === 'all' || card.getAttribute('data-cat') === filter;
          card.hidden = !show;
          if (show) visibleCards.push(card);
        });

        if (window.gsap) {
          window.gsap.fromTo(
            visibleCards,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: 'power2.out', clearProps: 'transform,opacity' }
          );
        }
        refreshMotion();
      });
    });
  }

  /* ----------------------------------------------------------------------
     5. TESTIMONIALS TOUCH SWIPER SLIDER
     ---------------------------------------------------------------------- */
  function initTestimonialsSwiper() {
    if (typeof window.Swiper !== 'function') return;
    const container = document.querySelector('.testimonials-swiper');
    if (!container) return;

    try {
      testimonialsSwiper = new window.Swiper(container, {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        grabCursor: true,
        speed: 700,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        pagination: {
          el: '.testimonials-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.testimonials-next',
          prevEl: '.testimonials-prev'
        },
        breakpoints: {
          640: {
            slidesPerView: 2,
            spaceBetween: 28
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 32
          }
        }
      });
    } catch (err) {
      console.warn('Swiper initialization skipped:', err);
    }
  }

  /* ----------------------------------------------------------------------
     6. ACCESSIBLE FAQ ACCORDION
     ---------------------------------------------------------------------- */
  function initFaq() {
    document.querySelectorAll('.faq-trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded') === 'true';
        const panel = document.getElementById(btn.getAttribute('aria-controls'));
        if (!panel) return;
        btn.setAttribute('aria-expanded', String(!expanded));
        panel.classList.toggle('open', !expanded);
        setTimeout(refreshMotion, 400);
      });
    });
  }

  /* ----------------------------------------------------------------------
     6. FORM VALIDATION, 2-IMAGE UPLOAD ENFORCEMENT & API INTEGRATION
     ---------------------------------------------------------------------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function validUrl(val) {
    try {
      const u = new URL(val);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (_) {
      return false;
    }
  }

  function setFieldError(ctrl, msg) {
    const errId = ctrl.getAttribute('aria-describedby');
    const errEl = errId ? document.getElementById(errId) : null;
    if (msg) {
      ctrl.setAttribute('aria-invalid', 'true');
      if (errEl) { errEl.textContent = msg; errEl.classList.add('visible'); }
    } else {
      ctrl.removeAttribute('aria-invalid');
      if (errEl) { errEl.textContent = ''; errEl.classList.remove('visible'); }
    }
  }

  function initForms() {
    document.querySelectorAll('.js-studio-form').forEach((form) => {
      const type = form.getAttribute('data-form-type');
      const dropzone = form.querySelector('.js-dropzone');
      const fileInput = form.querySelector('.js-file-input');
      const fileListEl = form.querySelector('.js-file-list');
      const statusEl = form.querySelector('.js-form-status');
      const submitBtn = form.querySelector('.js-submit-btn');
      const files = [];

      const setFileErr = (msg) => {
        if (!dropzone) return;
        const errEl = document.getElementById(dropzone.getAttribute('aria-describedby'));
        if (errEl) {
          errEl.textContent = msg || '';
          errEl.classList.toggle('visible', Boolean(msg));
        }
      };

      const renderFileList = () => {
        if (!fileListEl) return;
        fileListEl.innerHTML = '';
        files.forEach((f, idx) => {
          const li = document.createElement('li');
          li.className = 'file-item';

          const nameWrap = document.createElement('div');
          nameWrap.className = 'file-item-name';
          nameWrap.textContent = f.name;
          const sizeSpan = document.createElement('span');
          sizeSpan.textContent = '(' + formatSize(f.size) + ')';
          nameWrap.appendChild(sizeSpan);

          const rmBtn = document.createElement('button');
          rmBtn.type = 'button';
          rmBtn.className = 'file-remove';
          rmBtn.textContent = 'Remove';
          rmBtn.setAttribute('aria-label', 'Remove ' + f.name);
          rmBtn.addEventListener('click', () => {
            files.splice(idx, 1);
            setFileErr('');
            renderFileList();
          });

          li.appendChild(nameWrap);
          li.appendChild(rmBtn);
          fileListEl.appendChild(li);
        });
      };

      const handleFiles = (incoming) => {
        const list = Array.from(incoming || []);
        if (!list.length) return;
        const errs = [];

        for (const f of list) {
          if (files.length >= window.STUDIO_API.maxTrialFiles) {
            errs.push('Maximum ' + window.STUDIO_API.maxTrialFiles + ' sample images allowed.');
            break;
          }
          const ext = (f.name.split('.').pop() || '').toLowerCase();
          if (!window.STUDIO_API.allowedExtensions.includes(ext)) {
            errs.push('Unsupported file type: ' + f.name);
            continue;
          }
          if (f.size > window.STUDIO_API.maxFileSizeBytes) {
            errs.push(f.name + ' exceeds the 250MB size limit.');
            continue;
          }
          files.push(f);
        }

        setFileErr(errs.join(' '));
        renderFileList();
        if (fileInput) fileInput.value = '';
      };

      if (dropzone && fileInput) {
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInput.click();
          }
        });
        dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
        dropzone.addEventListener('drop', (e) => {
          e.preventDefault();
          dropzone.classList.remove('drag-over');
          handleFiles(e.dataTransfer.files);
        });
        fileInput.addEventListener('change', () => handleFiles(fileInput.files));
      }

      form.querySelectorAll('.form-control').forEach((ctrl) => {
        ctrl.addEventListener('input', () => setFieldError(ctrl, ''));
        ctrl.addEventListener('change', () => setFieldError(ctrl, ''));
      });

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let firstBad = null;
        const data = {};

        form.querySelectorAll('.form-control').forEach((ctrl) => {
          const val = ctrl.value.trim();
          data[ctrl.name] = val;
          let err = '';

          if (ctrl.hasAttribute('required') && !val) err = 'This field is required.';
          else if (ctrl.type === 'email' && val && !EMAIL_RE.test(val)) err = 'Please enter a valid work email address.';
          else if (ctrl.type === 'url' && val && !validUrl(val)) err = 'Please enter a valid link starting with https://';

          setFieldError(ctrl, err);
          if (err && !firstBad) firstBad = ctrl;
        });

        if (firstBad) {
          firstBad.focus();
          statusEl.className = 'form-status form-status--error visible';
          statusEl.textContent = 'Please complete the highlighted fields above.';
          return;
        }

        const endpointMap = {
          trial: window.STUDIO_API.trialEndpoint,
          quote: window.STUDIO_API.quoteEndpoint,
          contact: window.STUDIO_API.contactEndpoint
        };
        const endpoint = endpointMap[type];

        if (!endpoint) {
          const subject = encodeURIComponent('Best Jewelry Retouching — ' + type.toUpperCase() + ' Request');
          const bodyLines = Object.entries(data).filter(([, v]) => v).map(([k, v]) => k.toUpperCase() + ': ' + v);
          if (files.length) bodyLines.push('FILES TO ATTACH: ' + files.map((f) => f.name).join(', '));
          const mailto = 'mailto:' + window.STUDIO_API.contactEmail + '?subject=' + subject + '&body=' + encodeURIComponent(bodyLines.join('\n'));

          statusEl.className = 'form-status form-status--info visible';
          statusEl.innerHTML =
            '<strong>Details validated and ready to send.</strong><br>' +
            'Connect your live backend URL in <code>window.STUDIO_API</code> or send your brief directly to our studio desk at <strong>' + window.STUDIO_API.contactEmail + '</strong>.' +
            '<div class="form-status-actions"><a href="' + mailto + '" class="btn btn-obsidian btn-sm">Email Studio Desk Directly</a></div>';
          return;
        }

        const origText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        statusEl.className = 'form-status';

        try {
          let res;
          if (type === 'trial') {
            const fd = new FormData();
            Object.entries(data).forEach(([k, v]) => fd.append(k, v));
            files.forEach((f) => fd.append('images[]', f, f.name));
            res = await fetch(endpoint, { method: 'POST', body: fd });
          } else {
            res = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify(data)
            });
          }

          if (!res.ok) throw new Error('HTTP ' + res.status);

          statusEl.className = 'form-status form-status--success visible';
          statusEl.textContent = 'Thank you. Your request has been received by Best Jewelry Retouching and our lead retoucher will follow up shortly.';
          form.reset();
          files.length = 0;
          renderFileList();
        } catch (err) {
          statusEl.className = 'form-status form-status--error visible';
          statusEl.textContent = 'Unable to reach the submission server. Please try again or email ' + window.STUDIO_API.contactEmail + '.';
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = origText;
        }
      });
    });
  }

  function initFastTrackTrial() {
    const form = document.querySelector('.js-fast-track-form');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = form.querySelector('#ft-email');
      const serviceSelect = form.querySelector('#ft-service');
      const email = emailInput ? emailInput.value.trim() : '';
      const service = serviceSelect ? serviceSelect.value : '';
      if (!email || !EMAIL_RE.test(email)) {
        if (emailInput) {
          emailInput.focus();
          emailInput.style.borderColor = '#e11d48';
          setTimeout(() => { emailInput.style.borderColor = ''; }, 3000);
        }
        return;
      }
      const targetEmail = document.querySelector('#page-trial input[name="email"]');
      if (targetEmail) targetEmail.value = email;
      if (service) {
        document.querySelectorAll('.js-trial-service').forEach((sel) => { sel.value = service; });
      }
      navigateRoute('#trial', true);
      setTimeout(() => {
        const dropzone = document.querySelector('#page-trial .js-dropzone');
        if (dropzone) dropzone.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    });
  }

  /* ----------------------------------------------------------------------
     7. GSAP 3 + SCROLLTRIGGER + LENIS SMOOTH SCROLLING
     ---------------------------------------------------------------------- */
  function initAnimationsAndScroll() {
    // Lenis Smooth Scrolling
    if (typeof window.Lenis === 'function') {
      try {
        lenis = new window.Lenis({
          duration: 1.15,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.5
        });

        if (window.gsap && window.ScrollTrigger) {
          lenis.on('scroll', window.ScrollTrigger.update);
          window.gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
          });
          window.gsap.ticker.lagSmoothing(0);
        } else {
          const raf = (time) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);
        }
      } catch (err) {
        console.warn('Lenis scroll note:', err);
        lenis = null;
      }
    }

    if (!window.gsap || !window.ScrollTrigger) {
      console.warn('GSAP or ScrollTrigger library missing');
      return;
    }

    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const yDist = isMobile ? 18 : 30;

    // Hero Staged Editorial Entrance
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTl
      .from('.js-hero-item', { y: yDist, opacity: 0, duration: 0.85, stagger: 0.1, clearProps: 'transform,opacity' })
      .from('.js-hero-media', { y: yDist, opacity: 0, scale: 0.98, duration: 0.95, clearProps: 'transform,opacity' }, '-=0.65')
      .from('.js-hero-metric', { y: 16, opacity: 0, duration: 0.65, stagger: 0.09, clearProps: 'transform,opacity' }, '-=0.55');

    // Section Reveals
    gsap.utils.toArray('.js-reveal').forEach((el) => {
      gsap.from(el, {
        y: yDist,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Four Pillars Stacking Glass Cards Deck Animation
    const serviceCards = gsap.utils.toArray('.js-service-row');
    const isDesktopStack = window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktopStack && serviceCards.length > 1) {
      serviceCards.forEach((card, i) => {
        gsap.from(card, {
          y: yDist,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: card, start: 'top 86%', once: true }
        });

        if (i < serviceCards.length - 1) {
          const nextCard = serviceCards[i + 1];
          if (nextCard) {
            ScrollTrigger.create({
              trigger: nextCard,
              start: 'top 75%',
              end: 'top 20%',
              scrub: 0.5,
              onUpdate: (self) => {
                const p = self.progress;
                const scale = 1 - (p * 0.045);
                const dim = 1 - (p * 0.06);
                gsap.set(card, {
                  scale: scale,
                  filter: `brightness(${dim})`,
                  transformOrigin: 'top center'
                });
              }
            });
          }
        }
      });
    } else {
      serviceCards.forEach((card) => {
        gsap.from(card, {
          y: 20,
          opacity: 0,
          duration: 0.75,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: card, start: 'top 88%', once: true }
        });
      });
    }

    // Full-Bleed CTA Banner Subtle Parallax
    const parallaxBg = document.querySelector('.js-parallax-bg');
    if (parallaxBg && !isMobile) {
      gsap.to(parallaxBg, {
        yPercent: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: '.cta-banner',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    // How We Work Columns
    gsap.from('.js-wwc-col', {
      y: yDist,
      opacity: 0,
      duration: 0.75,
      stagger: 0.12,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '.wwc-cols', start: 'top 86%', once: true }
    });

    // Portfolio Cards
    gsap.from('.js-pf-card', {
      y: yDist,
      opacity: 0,
      duration: 0.75,
      stagger: isMobile ? 0.06 : 0.09,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '#portfolioGrid', start: 'top 86%', once: true }
    });

    // Workflow Steps
    gsap.from('.js-step-card', {
      y: 24,
      opacity: 0,
      duration: 0.75,
      stagger: 0.1,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '.workflow-grid', start: 'top 86%', once: true }
    });

    // Why Us Pillars
    gsap.from('.js-why-item', {
      y: 22,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '.why-list', start: 'top 86%', once: true }
    });

    // Testimonials Slider Reveal
    gsap.from('.testimonials-slider-wrap', {
      y: 24,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '#testimonials', start: 'top 86%', once: true }
    });

    // Footer Reveal
    gsap.from('.js-footer', {
      opacity: 0,
      y: 16,
      duration: 0.75,
      ease: 'power2.out',
      clearProps: 'transform,opacity',
      scrollTrigger: { trigger: '.js-footer', start: 'top 95%', once: true }
    });

    ScrollTrigger.refresh();
  }

  /* ----------------------------------------------------------------------
     8. HEADER SCROLL ELEVATION & INIT
     ---------------------------------------------------------------------- */
  function initHeaderScroll() {
    const header = document.getElementById('siteHeader');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 14);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function start() {
    initSliders();
    init3DImageTilt();
    initMacroLoupe();
    initColorwayStudio();
    initPortfolioFilters();
    initTestimonialsSwiper();
    initFaq();
    initForms();
    initFastTrackTrial();
    initHeaderScroll();
    initAnimationsAndScroll();

    navigateRoute(window.location.hash || '#home', Boolean(window.location.hash && window.location.hash !== '#home'));
    window.addEventListener('hashchange', () => navigateRoute(window.location.hash || '#home', true));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.addEventListener('load', () => {
    if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
      window.ScrollTrigger.refresh();
    }
    if (lenis && typeof lenis.resize === 'function') {
      lenis.resize();
    }
    if (testimonialsSwiper && typeof testimonialsSwiper.update === 'function') {
      testimonialsSwiper.update();
    }
  });

  window.addEventListener('resize', () => {
    if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
      window.ScrollTrigger.refresh();
    }
    if (lenis && typeof lenis.resize === 'function') {
      lenis.resize();
    }
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
        window.ScrollTrigger.refresh();
      }
      if (lenis && typeof lenis.resize === 'function') {
        lenis.resize();
      }
    }, 200);
  });
})();
