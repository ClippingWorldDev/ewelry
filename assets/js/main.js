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
  const PAGE_TITLE = 'Best Jewelry Retouching | Luxury Post-Production Studio for USA & Europe';

  let lenis = null;
  let testimonialsSwiper = null;
  let artisanManifestoSwiper = null;

  function parseHash(rawHash) {
    const clean = (rawHash || '#home').replace(/^#/, '').trim();
    if (!clean || clean === 'home') return null;
    return clean;
  }

  function refreshMotion() {
    if (lenis && typeof lenis.resize === 'function') lenis.resize();
    if (testimonialsSwiper && typeof testimonialsSwiper.update === 'function') {
      testimonialsSwiper.update();
    }
    if (artisanManifestoSwiper && typeof artisanManifestoSwiper.update === 'function') {
      artisanManifestoSwiper.update();
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
    const anchor = parseHash(hash);
    document.title = PAGE_TITLE;
    closeMobileDrawer();

    if (shouldScroll && anchor) {
      requestAnimationFrame(() => {
        scrollToAnchor(anchor);
        refreshMotion();
      });
    } else if (shouldScroll && !anchor) {
      if (lenis) lenis.scrollTo(0, { immediate: false, duration: 0.8 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
      refreshMotion();
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
  if (mobileDrawer) {
    mobileDrawer.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileDrawer();
      });
    });
  }
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
          <button type="button" class="ba-handle" role="slider" aria-label="Compare ${oldLabel} and ${newLabel} for ${altText}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">
            <span class="ba-flank-badge ba-flank-before">BEFORE</span>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M6.5 4.5L2.5 9L6.5 13.5M11.5 4.5L15.5 9L11.5 13.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="ba-flank-badge ba-flank-after">AFTER</span>
          </button>
        `;
      } else {
        const newImg = slider.querySelector('.ba-layer--new img, .ba-layer--after img');
        const oldImg = slider.querySelector('.ba-layer--old img, .ba-layer--before img');
        if (newSrc && newImg && !newImg.getAttribute('src')) newImg.src = newSrc;
        if (oldSrc && oldImg && !oldImg.getAttribute('src')) oldImg.src = oldSrc;
      }

      // Add Glare layer for luxury specular reflection
      let glare = slider.querySelector('.ba-glare');
      if (!glare) {
        glare = document.createElement('div');
        glare.className = 'ba-glare';
        slider.appendChild(glare);
      }

      const handle = slider.querySelector('.ba-handle');
      if (!handle) return;

      // Ensure handle has BEFORE and AFTER flank badges for dynamic cursor tracking
      if (!handle.querySelector('.ba-flank-before')) {
        const beforeFlank = document.createElement('span');
        beforeFlank.className = 'ba-flank-badge ba-flank-before';
        beforeFlank.textContent = 'BEFORE';
        handle.insertBefore(beforeFlank, handle.firstChild);
      }
      if (!handle.querySelector('.ba-flank-after')) {
        const afterFlank = document.createElement('span');
        afterFlank.className = 'ba-flank-badge ba-flank-after';
        afterFlank.textContent = 'AFTER';
        handle.appendChild(afterFlank);
      }

      const parentCard = slider.closest('.pf-card, [data-tilt]');
      let pct = 50;
      let isDragging = false;
      let activePointerId = null;
      let rafId = null;

      const setPos = (value) => {
        pct = Math.max(2, Math.min(98, value));
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          slider.style.setProperty('--pos', pct + '%');
          handle.setAttribute('aria-valuenow', String(Math.round(pct)));
          if (pct < 16) {
            handle.classList.add('is-near-left');
          } else {
            handle.classList.remove('is-near-left');
          }
          if (pct > 84) {
            handle.classList.add('is-near-right');
          } else {
            handle.classList.remove('is-near-right');
          }
        });
      };

      const updateFromClientX = (clientX) => {
        const rect = slider.getBoundingClientRect();
        if (!rect.width) return;
        const x = clientX - rect.left;
        setPos((x / rect.width) * 100);
      };

      const updateGlare = (clientX, clientY) => {
        if (!glare) return;
        const rect = slider.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const gx = ((clientX - rect.left) / rect.width) * 100;
        const gy = ((clientY - rect.top) / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0) 65%)`;
      };

      // 1. Desktop Hover: divider and circle smoothly track the mouse without needing click
      slider.addEventListener('pointerenter', (e) => {
        if (e.pointerType === 'mouse') {
          slider.classList.add('is-hovered');
          if (parentCard && window.gsap) {
            window.gsap.to(parentCard, { rotateX: 0, rotateY: 0, scale: 1, duration: 0.25, overwrite: 'auto' });
          }
          updateFromClientX(e.clientX);
          updateGlare(e.clientX, e.clientY);
        }
      });

      slider.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'mouse') {
          updateFromClientX(e.clientX);
          updateGlare(e.clientX, e.clientY);
        }
      });

      slider.addEventListener('pointerleave', (e) => {
        if (e.pointerType === 'mouse' && !isDragging) {
          slider.classList.remove('is-hovered');
        }
      });

      // 2. Click & Drag Support (for Touch devices & Click-and-Hold on Desktop)
      const onWindowPointerMove = (e) => {
        if (!isDragging) return;
        if (activePointerId !== null && e.pointerId !== activePointerId) return;
        updateFromClientX(e.clientX);
        updateGlare(e.clientX, e.clientY);
        if (e.cancelable) e.preventDefault();
      };

      const onWindowPointerEnd = (e) => {
        if (activePointerId !== null && e.pointerId !== activePointerId) return;
        isDragging = false;
        activePointerId = null;
        slider.classList.remove('is-dragging');
        slider.classList.remove('is-hovered');
        window.removeEventListener('pointermove', onWindowPointerMove);
        window.removeEventListener('pointerup', onWindowPointerEnd);
        window.removeEventListener('pointercancel', onWindowPointerEnd);
      };

      slider.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        isDragging = true;
        activePointerId = e.pointerId;
        slider.classList.add('is-dragging');
        updateFromClientX(e.clientX);
        updateGlare(e.clientX, e.clientY);

        window.addEventListener('pointermove', onWindowPointerMove, { passive: false });
        window.addEventListener('pointerup', onWindowPointerEnd);
        window.addEventListener('pointercancel', onWindowPointerEnd);
      });

      // Keyboard Accessibility
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

    // Apply tilt to outer cards/frames, but NOT directly to .ba-slider
    const tiltElements = document.querySelectorAll(
      '.hero-frame, .service-media, .pf-card, [data-tilt]'
    );

    tiltElements.forEach((el) => {
      // Do not tilt the slider element itself
      if (el.classList.contains('ba-slider')) return;

      let bounds = null;

      const onMouseEnter = () => {
        bounds = el.getBoundingClientRect();
      };

      const onMouseMove = (e) => {
        // When cursor is interacting inside Before/After slider or Loupe inspector,
        // keep the element perfectly planar so the divider and circle are 100% straight and razor-sharp!
        if (e.target.closest('.ba-slider') || e.target.closest('.macro-loupe-wrap')) {
          window.gsap.to(el, {
            rotateX: 0,
            rotateY: 0,
            scale: 1,
            ease: 'power2.out',
            duration: 0.35,
            overwrite: 'auto'
          });
          return;
        }

        if (el.classList.contains('is-dragging')) return;
        if (!bounds) bounds = el.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;

        const mouseX = e.clientX - bounds.left;
        const mouseY = e.clientY - bounds.top;

        const xRel = (mouseX / bounds.width) - 0.5; // -0.5 to 0.5
        const yRel = (mouseY / bounds.height) - 0.5;

        const maxTilt = 4.5; // subtle, refined luxury 3D tilt
        const rotY = xRel * maxTilt;
        const rotX = -yRel * maxTilt;

        window.gsap.to(el, {
          rotateX: rotX,
          rotateY: rotY,
          scale: 1.015,
          transformPerspective: 1200,
          ease: 'power1.out',
          duration: 0.3,
          overwrite: 'auto'
        });
      };

      const onMouseLeave = () => {
        bounds = null;
        window.gsap.to(el, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          ease: 'power2.out',
          duration: 0.5,
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
    const baseImg = wrap.querySelector('.macro-loupe-img');
    if (!lens || !baseImg) return;

    const imgSrc = baseImg.getAttribute('src') || 'assets/images/macro-loupe-base.jpg';
    lens.style.backgroundImage = `url("${imgSrc}")`;

    const zoomFactor = 3.8; // Exact 380%–400% crisp luxury optical magnification
    let touchTimeout = null;

    const updateLoupe = (clientX, clientY, isTouch = false) => {
      const rect = wrap.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const lensWidth = lens.offsetWidth || 210;
      const lensHeight = lens.offsetHeight || 210;
      const radiusX = lensWidth / 2;
      const radiusY = lensHeight / 2;

      let x = clientX - rect.left;
      let y = clientY - rect.top;

      x = Math.max(0, Math.min(rect.width, x));
      y = Math.max(0, Math.min(rect.height, y));

      let lensCenterY = y;
      if (isTouch) {
        // On mobile touch, float the lens 75px above finger so thumb does NOT block the loupe view!
        lensCenterY = Math.max(radiusY, y - 75);
      }

      // Lens physical position centered on (x, lensCenterY)
      lens.style.left = `${x - radiusX}px`;
      lens.style.top = `${lensCenterY - radiusY}px`;

      // Scale background image to exact zoomFactor * container size
      const bgW = rect.width * zoomFactor;
      const bgH = rect.height * zoomFactor;

      // Position background so that (x, y) on base image is EXACTLY centered under the crosshair
      const bgX = radiusX - (x * zoomFactor);
      const bgY = radiusY - (y * zoomFactor);

      lens.style.backgroundSize = `${bgW}px ${bgH}px`;
      lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
    };

    const showLens = (clientX, clientY, isTouch = false) => {
      if (touchTimeout) {
        clearTimeout(touchTimeout);
        touchTimeout = null;
      }
      lens.classList.add('active');
      updateLoupe(clientX, clientY, isTouch);
    };

    const hideLens = () => {
      lens.classList.remove('active');
    };

    wrap.addEventListener('mouseenter', (e) => {
      showLens(e.clientX, e.clientY, false);
    });

    wrap.addEventListener('mousemove', (e) => {
      showLens(e.clientX, e.clientY, false);
    });

    wrap.addEventListener('mouseleave', hideLens);

    // Touch support for mobile / tablets
    wrap.addEventListener('touchstart', (e) => {
      if (!e.touches.length) return;
      showLens(e.touches[0].clientX, e.touches[0].clientY, true);
    }, { passive: true });

    wrap.addEventListener('touchmove', (e) => {
      if (!e.touches.length) return;
      e.preventDefault(); // Stop page scrolling while inspecting diamond
      updateLoupe(e.touches[0].clientX, e.touches[0].clientY, true);
    }, { passive: false });

    wrap.addEventListener('touchend', () => {
      // Keep visible for 1.8s so mobile user can admire the zoom after lifting finger
      touchTimeout = setTimeout(hideLens, 1800);
    });

    // Preset focal buttons
    document.querySelectorAll('.loupe-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pctX = parseFloat(btn.getAttribute('data-loupe-x')) || 50;
        const pctY = parseFloat(btn.getAttribute('data-loupe-y')) || 50;
        const rect = wrap.getBoundingClientRect();
        const targetX = rect.left + (rect.width * (pctX / 100));
        const targetY = rect.top + (rect.height * (pctY / 100));

        showLens(targetX, targetY, false);

        // Highlight active preset button
        document.querySelectorAll('.loupe-preset-btn').forEach((b) => {
          b.classList.toggle('border-gold', b === btn);
          b.classList.toggle('text-gold', b === btn);
          b.classList.toggle('bg-stone-50', b === btn);
        });

        if (touchTimeout) clearTimeout(touchTimeout);
        touchTimeout = setTimeout(hideLens, 3500);
      });
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
      yellow: '18K Classic Yellow Gold',
      rose: '18K Blush Rose Gold',
      white: 'Platinum / White Gold',
      black: 'Gunmetal Black Rhodium'
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
          b.classList.toggle('ring-1', isCurrent);
          b.classList.toggle('ring-gold', isCurrent);
          b.classList.toggle('bg-stone-50', isCurrent);
          const statusSpan = b.querySelector('.swatch-status');
          if (statusSpan) {
            statusSpan.textContent = isCurrent ? 'Active' : 'Select';
            statusSpan.className = isCurrent
              ? 'text-[10px] sm:text-xs text-gold uppercase tracking-wider font-medium swatch-status'
              : 'text-[10px] sm:text-xs text-stone-400 uppercase tracking-wider font-medium swatch-status';
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
     4B. PORTFOLIO MACRO ANGLE VIEW SWITCHER (VIEW 01 / VIEW 02 / VIEW 03)
     ---------------------------------------------------------------------- */
  function initPortfolioViews() {
    const cards = document.querySelectorAll('.pf-card');
    cards.forEach((card) => {
      const slider = card.querySelector('[data-ba-slider]');
      if (!slider) return;
      const viewButtons = card.querySelectorAll('.pf-view-btn');
      if (!viewButtons.length) return;

      viewButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (btn.classList.contains('is-active')) return;

          // Update active pill state
          viewButtons.forEach((b) => {
            b.classList.remove('is-active');
            b.setAttribute('aria-selected', 'false');
          });
          btn.classList.add('is-active');
          btn.setAttribute('aria-selected', 'true');

          const beforeSrc = btn.getAttribute('data-before');
          const afterSrc = btn.getAttribute('data-after');
          if (!beforeSrc || !afterSrc) return;

          const beforeImg = slider.querySelector('.ba-layer--before img');
          const afterImg = slider.querySelector('.ba-layer--after img');

          if (window.gsap && beforeImg && afterImg) {
            window.gsap.to([beforeImg, afterImg], {
              opacity: 0.25,
              scale: 0.985,
              duration: 0.16,
              ease: 'power2.out',
              onComplete: () => {
                beforeImg.src = beforeSrc;
                afterImg.src = afterSrc;
                slider.setAttribute('data-before', beforeSrc);
                slider.setAttribute('data-after', afterSrc);
                slider.setAttribute('data-old-image', beforeSrc);
                slider.setAttribute('data-new-image', afterSrc);

                const restore = () => {
                  window.gsap.to([beforeImg, afterImg], {
                    opacity: 1,
                    scale: 1,
                    duration: 0.28,
                    ease: 'power2.out',
                    clearProps: 'transform,opacity'
                  });
                };

                if (beforeImg.complete && afterImg.complete) {
                  restore();
                } else {
                  let loaded = 0;
                  const onLoaded = () => {
                    loaded++;
                    if (loaded >= 2) restore();
                  };
                  beforeImg.onload = onLoaded;
                  afterImg.onload = onLoaded;
                  setTimeout(restore, 260);
                }
              }
            });
          } else {
            if (beforeImg) beforeImg.src = beforeSrc;
            if (afterImg) afterImg.src = afterSrc;
            slider.setAttribute('data-before', beforeSrc);
            slider.setAttribute('data-after', afterSrc);
            slider.setAttribute('data-old-image', beforeSrc);
            slider.setAttribute('data-new-image', afterSrc);
          }
        });
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
     HUMAN ARTISAN MANIFESTO (SWIPER VERTICAL INFINITE LOOP + GSAP R-TO-L SYNC)
     ---------------------------------------------------------------------- */
  function initArtisanManifestoSlider() {
    const swiperEl = document.getElementById('artisanSwiper');
    if (!swiperEl || typeof window.Swiper !== 'function') return;

    const manifestoContent = document.getElementById('artisanManifestoContent');
    const tagEl = document.getElementById('artisanTag');
    const headlineEl = document.getElementById('artisanHeadline');
    const quoteEl = document.getElementById('artisanQuote');
    const authorNameEl = document.getElementById('artisanAuthorName');
    const authorTitleEl = document.getElementById('artisanAuthorTitle');
    const authorMetaEl = document.getElementById('artisanAuthorMeta');
    const sealEl = document.getElementById('artisanSeal');
    const progressBar = document.getElementById('artisanProgressBar');
    const progressNum = document.getElementById('artisanProgressNum');
    const diamondSvg = document.getElementById('artisanDiamondSvg');

    const manifestoData = [
      {
        tag: 'Authenticity Protocol · Pillar 01',
        headline: 'Preserving Authentic Diamond Fire & Real GIA Facet Geometry.',
        quote: '“In an era flooded with generic AI filters that distort diamond fire, melt fine prongs, and blur hallmarks, we make one solemn promise: every facet, reflection, and culet is crafted by senior retouchers with 10+ years of high-jewelry bench experience. We enhance desire—we never fake perfection.”',
        authorName: 'Marcello Vance',
        authorTitle: 'Lead Master Jewelry Retoucher & Colorist',
        authorMeta: 'Atelier Bench Master • Member #408',
        sealText: '100%<br />HAND<br />CRAFT'
      },
      {
        tag: 'Authenticity Protocol · Pillar 02',
        headline: 'Sub-Pixel Vector Bézier Isolation at 400% Magnification.',
        quote: '“Automated background erasers and machine masks ruthlessly clip delicate claw tips and flatten intricate platinum filigree. Every single bezel opening, hollow earring cavity, and tennis link is isolated by hand with precision Bézier pen paths on 4K Wacom displays.”',
        authorName: 'Elena Rostova',
        authorTitle: 'Senior Vector Clipping & Masking Specialist',
        authorMeta: 'Atelier Bench Master • Member #214',
        sealText: '400%<br />VECTOR<br />PEN'
      },
      {
        tag: 'Authenticity Protocol · Pillar 03',
        headline: 'Uncompressed 16-Bit ProPhoto Dynamic Color Fidelity.',
        quote: '“We refuse to smash color depth into 8-bit web artifacts. Clients receive museum-ready 16-bit ProPhoto RGB master archives with separated alloy layer stacks, ensuring color warmth matches real physical 18K Yellow, Rose Gold, and Platinum casting specifications.”',
        authorName: 'Marcello Vance',
        authorTitle: 'Master Colorist & Colorways Lead',
        authorMeta: 'Certified Color Calibration Fellow • Member #408',
        sealText: '16-BIT<br />PRO<br />PHOTO'
      },
      {
        tag: 'Authenticity Protocol · Pillar 04',
        headline: 'Bilateral Confidentiality & Air-Gapped Vault Security.',
        quote: '“Your unreleased Baselworld collections, high-jewelry one-offs, and secret prototype CAD renders never touch public third-party AI cloud servers. Stored on air-gapped, encrypted on-premise local servers under strict enforceable NDAs with zero public disclosure without consent.”',
        authorName: 'Julian Sterling',
        authorTitle: 'Atelier Operations & Security Director',
        authorMeta: 'Executive Studio Officer • Member #102',
        sealText: 'VAULT<br />SECURE<br />NDA'
      },
      {
        tag: 'Authenticity Protocol · Pillar 05',
        headline: 'Tactile Curvature Sculpting Without Plastic Blur Smearing.',
        quote: '“Plastic frequency separation kills authentic metal luster. Our artists hand-paint micro specular lights along shank edges and volumetric dodge-and-burn curves, restoring genuine 3D tactile luxury presence while respecting the original metal polish.”',
        authorName: 'Marcello Vance',
        authorTitle: 'Lead Master Jewelry Retoucher',
        authorMeta: 'Atelier Bench Master • Member #408',
        sealText: '3D<br />DODGE<br />BURN'
      },
      {
        tag: 'Authenticity Protocol · Pillar 06',
        headline: 'Strict D50/D65 Proofing from OLED Screens to Luxury Lookbooks.',
        quote: '“From 5th Avenue flagship window billboards to mobile e-commerce zoom, our color outputs undergo multi-display calibration across EIZO ColorEdge hardware. What your creative director approves on screen matches the physical print lookbook exactly.”',
        authorName: 'Elena Rostova',
        authorTitle: 'Color Grading & Proofing Supervisor',
        authorMeta: 'Atelier Bench Master • Member #214',
        sealText: 'GIA<br />COLOR<br />PROOF'
      }
    ];

    let lastIndex = 0;
    let isTransitioning = false;

    function restartProgressBar() {
      if (window.gsap && progressBar) {
        window.gsap.killTweensOf(progressBar);
        window.gsap.fromTo(progressBar, { width: '0%' }, { width: '100%', duration: 3.8, ease: 'none' });
      }
    }

    function pulseDiamondSeal() {
      if (window.gsap && diamondSvg) {
        window.gsap.fromTo(
          diamondSvg,
          {
            scale: 1.22,
            filter: 'drop-shadow(0 0 24px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 35px rgba(217, 186, 130, 0.9))'
          },
          {
            scale: 1,
            filter: 'drop-shadow(0 0 8px rgba(181, 144, 84, 0.45))',
            duration: 0.75,
            ease: 'power2.out'
          }
        );
      }
    }

    function updateLeftContent(index) {
      if (index === lastIndex && isTransitioning) return;
      isTransitioning = true;
      lastIndex = index;
      const data = manifestoData[index % manifestoData.length];
      if (!data) {
        isTransitioning = false;
        return;
      }

      // Update linear progress & diamond facet gleam
      if (progressNum) {
        const currentPillar = (index % manifestoData.length) + 1;
        progressNum.textContent = `0${currentPillar} / 0${manifestoData.length}`;
      }
      restartProgressBar();
      pulseDiamondSeal();

      if (window.gsap && manifestoContent) {
        const gsap = window.gsap;
        gsap.killTweensOf(manifestoContent);

        // Slide out to left
        gsap.to(manifestoContent, {
          x: -28,
          opacity: 0,
          duration: 0.22,
          ease: 'power2.in',
          onComplete: () => {
            if (tagEl) tagEl.textContent = data.tag;
            if (headlineEl) headlineEl.innerHTML = data.headline;
            if (quoteEl) quoteEl.innerHTML = `&ldquo;${data.quote.replace(/^[“"]|[”"]$/g, '')}&rdquo;`;
            if (authorNameEl) authorNameEl.textContent = data.authorName;
            if (authorTitleEl) authorTitleEl.textContent = data.authorTitle;
            if (authorMetaEl) authorMetaEl.innerHTML = data.authorMeta;
            if (sealEl) sealEl.innerHTML = data.sealText;

            // Slide in from right to left (exact requested animation)
            gsap.fromTo(
              manifestoContent,
              { x: 36, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                duration: 0.42,
                ease: 'power3.out',
                onComplete: () => {
                  isTransitioning = false;
                }
              }
            );
          }
        });
      } else {
        if (tagEl) tagEl.textContent = data.tag;
        if (headlineEl) headlineEl.innerHTML = data.headline;
        if (quoteEl) quoteEl.innerHTML = `&ldquo;${data.quote.replace(/^[“"]|[”"]$/g, '')}&rdquo;`;
        if (authorNameEl) authorNameEl.textContent = data.authorName;
        if (authorTitleEl) authorTitleEl.textContent = data.authorTitle;
        if (authorMetaEl) authorMetaEl.innerHTML = data.authorMeta;
        if (sealEl) sealEl.innerHTML = data.sealText;
        isTransitioning = false;
      }
    }

    // Initialize Vertical Swiper (3 slides visible, middle slide active, infinite loop, bottom to top)
    try {
      artisanManifestoSwiper = new window.Swiper(swiperEl, {
        direction: 'vertical',
        slidesPerView: 3,
        spaceBetween: 12,
        centeredSlides: true,
        loop: true,
        speed: 650,
        autoplay: {
          delay: 3800,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        },
        grabCursor: true,
        mousewheel: {
          forceToAxis: true,
          releaseOnEdges: true
        },
        on: {
          init: function () {
            highlightActiveCard(this);
            restartProgressBar();
          },
          slideChangeTransitionStart: function () {
            highlightActiveCard(this);
            updateLeftContent(this.realIndex);
          },
          slideChange: function () {
            highlightActiveCard(this);
            updateLeftContent(this.realIndex);
          },
          slideChangeTransitionEnd: function () {
            highlightActiveCard(this);
          },
          click: function () {
            if (this.clickedSlide) {
              const idx = parseInt(this.clickedSlide.getAttribute('data-index') || '0', 10);
              this.slideToLoop(idx);
            }
          }
        }
      });

      function highlightActiveCard(swiperInstance) {
        if (!swiperEl) return;
        const allCards = swiperEl.querySelectorAll('.artisan-commandment');
        allCards.forEach((card) => card.classList.remove('is-active'));

        const activeSlide = swiperEl.querySelector('.swiper-slide-active');
        let cardToActivate = activeSlide ? activeSlide.querySelector('.artisan-commandment') : null;

        if (!cardToActivate && swiperInstance && typeof swiperInstance.realIndex === 'number') {
          const fallbackSlide = swiperEl.querySelector(`.swiper-slide[data-index="${swiperInstance.realIndex}"]:not(.swiper-slide-duplicate)`);
          if (fallbackSlide) cardToActivate = fallbackSlide.querySelector('.artisan-commandment');
        }

        if (cardToActivate) {
          cardToActivate.classList.add('is-active');
        }
      }

    } catch (e) {
      console.warn('Artisan manifesto swiper init skipped:', e);
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
      const service = serviceSelect ? serviceSelect.value : 'High-End Jewelry Retouching';
      if (!email || !EMAIL_RE.test(email)) {
        if (emailInput) {
          emailInput.focus();
          emailInput.style.borderColor = '#e11d48';
          setTimeout(() => { emailInput.style.borderColor = ''; }, 3000);
        }
        return;
      }

      const card = form.closest('.fast-track-card');
      if (card) {
        card.innerHTML = `
          <div class="py-8 text-center animate-fade-in">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/10 border border-gold text-gold flex items-center justify-center text-2xl font-serif">✓</div>
            <span class="eyebrow" style="margin-bottom: 0.5rem; color: #b59054;">Atelier Priority Slot Confirmed</span>
            <h3 class="font-serif text-2xl sm:text-3xl text-ink-primary mb-3">Your Free Trial Has Been Reserved</h3>
            <p class="text-ink-secondary text-base max-w-lg mx-auto mb-6 leading-relaxed">
              Thank you! Our lead master retoucher will email you at <strong class="text-ink-primary font-semibold">${email}</strong> within 15 minutes with secure direct upload instructions for your 2 free test images (<strong>${service}</strong>).
            </p>
            <div class="inline-flex items-center gap-2 text-xs text-gold-deep font-semibold uppercase tracking-wider bg-gold/10 px-5 py-2.5 rounded-full border border-gold/30">
              ✦ 12–24h Overnight Delivery Guarantee &bull; Automatic NDA Protection
            </div>
          </div>
        `;
      }
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
    window.triggerHeroEntrance = function () {
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      heroTl
        .from('.js-hero-item', { y: yDist, opacity: 0, duration: 0.85, stagger: 0.1, clearProps: 'transform,opacity' })
        .from('.js-hero-media', { y: yDist, opacity: 0, scale: 0.98, duration: 0.95, clearProps: 'transform,opacity' }, '-=0.65')
        .from('.js-hero-metric', { y: 16, opacity: 0, duration: 0.65, stagger: 0.09, clearProps: 'transform,opacity' }, '-=0.55');
    };

    // If preloader is absent, trigger hero entrance immediately
    if (!document.getElementById('bjrPreloader')) {
      window.triggerHeroEntrance();
    }

    // Section Reveals
    gsap.utils.toArray('.js-reveal').forEach((el) => {
      gsap.fromTo(
        el,
        { y: yDist, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true, immediateRender: false }
        }
      );
    });

    // Four Pillars Stacking Glass Cards Deck Animation
    const serviceCards = gsap.utils.toArray('.js-service-row');
    const isDesktopStack = window.matchMedia('(min-width: 1024px)').matches;
    if (isDesktopStack && serviceCards.length > 1) {
      serviceCards.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: yDist, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: card, start: 'top 86%', once: true, immediateRender: false }
          }
        );

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
        gsap.fromTo(
          card,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: card, start: 'top 88%', once: true, immediateRender: false }
          }
        );
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
    gsap.fromTo(
      '.js-wwc-col',
      { y: yDist, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.75,
        stagger: 0.12,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.wwc-cols', start: 'top 86%', once: true, immediateRender: false }
      }
    );

    // Portfolio Cards
    gsap.fromTo(
      '.js-pf-card',
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: isMobile ? 0.03 : 0.06,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '#portfolioGrid', start: 'top 90%', once: true, immediateRender: false }
      }
    );

    // Workflow Steps (if present)
    if (document.querySelector('.workflow-grid')) {
      gsap.fromTo(
        '.js-step-card',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: '.workflow-grid', start: 'top 86%', once: true, immediateRender: false }
        }
      );
    }

    // Why Us Pillars
    gsap.fromTo(
      '.js-why-item',
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.65,
        stagger: 0.06,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.why-list', start: 'top 86%', once: true, immediateRender: false }
      }
    );

    // Testimonials Slider Reveal
    gsap.fromTo(
      '.testimonials-slider-wrap',
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.75,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '#testimonials', start: 'top 86%', once: true, immediateRender: false }
      }
    );

    // Footer Reveal
    gsap.fromTo(
      '.js-footer',
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.js-footer', start: 'top 95%', once: true, immediateRender: false }
      }
    );

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

  function initHeroShowcase() {
    const heroSection = document.querySelector('.hero-section') || document.querySelector('.hero-showcase');
    if (!heroSection) return;

    const bgSlides = Array.from(heroSection.querySelectorAll('.hero-bg-slide'));
    const textSlides = Array.from(heroSection.querySelectorAll('.hero-text-slide'));
    const cards = Array.from(heroSection.querySelectorAll('.hero-v-card, .hero-category'));
    const vTrack = heroSection.querySelector('.hero-v-track');
    const prevBtn = heroSection.querySelector('.hero-v-arrow--up, .hero-arrow--up');
    const nextBtn = heroSection.querySelector('.hero-v-arrow--down, .hero-arrow--down');

    const total = Math.max(bgSlides.length, textSlides.length, cards.length);
    if (total === 0) return;

    // Detect initial active index from DOM (defaults to 1 for the Rings statement piece)
    const initialActiveCard = cards.findIndex((c) => c.classList.contains('is-active'));
    let current = initialActiveCard >= 0 ? initialActiveCard : 1;
    let timer = null;

    function updateTrackPosition() {
      if (!vTrack) return;
      const firstCard = cards[0];
      if (!firstCard) return;

      const width = window.innerWidth;
      if (width < 640) {
        // Mobile phone: horizontal carousel showing 3 cards
        const cardWidth = firstCard.offsetWidth || 72;
        const computedGap = parseFloat(window.getComputedStyle(vTrack).columnGap) || 10;
        const step = cardWidth + computedGap;
        const maxOffset = Math.max(0, (cards.length - 3) * step);
        const targetOffset = Math.min(Math.max(0, (current - 1) * step), maxOffset);
        vTrack.style.transform = `translateX(-${targetOffset}px)`;
      } else if (width < 1024) {
        // Tablet (640px - 1023px): all 4 cards displayed together cleanly
        vTrack.style.transform = 'translateX(0px)';
      } else {
        // Desktop (1024px+): vertical slider showing 3 cards
        const cardHeight = firstCard.offsetHeight || 98;
        const computedGap = parseFloat(window.getComputedStyle(vTrack).rowGap) || 12;
        const step = cardHeight + computedGap;
        const maxOffset = Math.max(0, (cards.length - 3) * step);
        const targetOffset = Math.min(Math.max(0, (current - 1) * step), maxOffset);
        vTrack.style.transform = `translateY(-${targetOffset}px)`;
      }
    }

    function showSlide(index) {
      current = (index + total) % total;

      bgSlides.forEach((slide, i) => {
        const isActive = i === current;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      textSlides.forEach((slide, i) => {
        const isActive = i === current;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      cards.forEach((card, i) => {
        const isActive = i === current;
        card.classList.toggle('is-active', isActive);
        card.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      updateTrackPosition();
    }

    function restartTimer() {
      if (timer) window.clearInterval(timer);
      timer = window.setInterval(() => showSlide(current + 1), 4500);
    }

    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        showSlide(index);
        restartTimer();
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          showSlide(index);
          restartTimer();
        }
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        showSlide(current - 1);
        restartTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        showSlide(current + 1);
        restartTimer();
      });
    }

    heroSection.addEventListener('mouseenter', () => {
      if (timer) window.clearInterval(timer);
    });

    heroSection.addEventListener('mouseleave', restartTimer);

    // Initial setup
    showSlide(current);
    restartTimer();

    window.addEventListener('resize', updateTrackPosition, { passive: true });
  }

  /* ----------------------------------------------------------------------
     HERO VIDEO MODAL POPUP
     ---------------------------------------------------------------------- */
  function initHeroVideoModal() {
    const modal = document.getElementById('heroVideoModal');
    const iframe = document.getElementById('heroVideoIframe');
    const closeBtn = document.getElementById('heroVideoModalClose');
    const backdrop = document.getElementById('heroVideoModalBackdrop');
    const triggers = document.querySelectorAll('.js-hero-video-trigger');

    if (!modal || !iframe) return;

    function openModal() {
      const videoSrc = iframe.getAttribute('data-src') || 'https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&rel=0&modestbranding=1&playsinline=1';
      iframe.setAttribute('src', videoSrc);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      if (lenis && typeof lenis.stop === 'function') lenis.stop();
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      iframe.setAttribute('src', '');
      if (lenis && typeof lenis.start === 'function') lenis.start();
      document.body.style.overflow = '';
    }

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeModal);
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });
  }

  /* ----------------------------------------------------------------------
     LUXURY ATELIER JEWELRY SVG PRELOADER (GSAP DIAMOND FIRE & PERCENTAGE)
     ---------------------------------------------------------------------- */
  function initLuxuryPreloader() {
    const preloader = document.getElementById('bjrPreloader');
    if (!preloader) {
      if (typeof window.triggerHeroEntrance === 'function') {
        window.triggerHeroEntrance();
      }
      return;
    }

    // Respect reduced-motion preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      preloader.classList.add('is-done');
      preloader.style.display = 'none';
      if (typeof window.triggerHeroEntrance === 'function') {
        window.triggerHeroEntrance();
      }
      return;
    }

    const paths = preloader.querySelectorAll('.preloader-path');
    const aura = preloader.querySelector('.preloader-diamond-aura');
    const anamorphic = preloader.querySelector('.preloader-anamorphic');
    const sparkles = preloader.querySelectorAll('.preloader-sparkle');
    const facets = preloader.querySelectorAll('.preloader-diamond-facet');
    const table = preloader.querySelector('.preloader-diamond-table');
    const percentDisplay = preloader.querySelector('.preloader-percent-display');
    const bigCount = document.getElementById('preloaderBigCount');
    const statusText = document.getElementById('preloaderStatusText');
    const progressBar = document.getElementById('preloaderBar');

    // Prevent scrolling while preloading
    if (lenis && typeof lenis.stop === 'function') lenis.stop();
    document.body.style.overflow = 'hidden';

    // Prepare SVG stroke-dasharray and stroke-dashoffset for path drawing
    paths.forEach((p) => {
      try {
        const len = p.getTotalLength() || 220;
        p.style.strokeDasharray = len;
        p.style.strokeDashoffset = len;
      } catch (e) {
        p.style.strokeDasharray = 220;
        p.style.strokeDashoffset = 220;
      }
    });

    if (window.gsap) {
      const gsap = window.gsap;
      gsap.set(aura, { scale: 0, opacity: 0, transformOrigin: 'center center' });
      if (anamorphic) gsap.set(anamorphic, { scaleX: 0, opacity: 0, transformOrigin: 'center center' });
      gsap.set(sparkles, { scale: 0, opacity: 0, transformOrigin: 'center center' });
      gsap.set(facets, { opacity: 0 });
      if (table) gsap.set(table, { opacity: 0, scale: 0.85, transformOrigin: 'center center' });
      if (percentDisplay) gsap.set(percentDisplay, { opacity: 1, y: 0 });
      if (statusText) gsap.set(statusText, { opacity: 1, y: 0 });
      if (bigCount) bigCount.textContent = '00';
      if (progressBar) progressBar.style.width = '0%';

      const drawTl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

      // 1. Draw SVG stroke lines (18K Gold Band, Platinum Prongs & Diamond Facets)
      drawTl
        .to(paths, {
          strokeDashoffset: 0,
          duration: 1.25,
          stagger: 0.024,
          ease: 'power2.out'
        })
        // 2. Diamond facet crystallization & table mirror flash
        .to(facets, { opacity: 1, duration: 0.45, stagger: 0.02 }, 0.4)
        .to(table, { opacity: 0.95, scale: 1, duration: 0.35 }, 0.6)
        .to(aura, { scale: 1, opacity: 1, duration: 0.65, ease: 'back.out(1.5)' }, 0.5)
        // 3. Horizontal Anamorphic diamond flare sweep
        .to(anamorphic, { scaleX: 1.4, opacity: 1, duration: 0.45, ease: 'power3.out' }, 0.8)
        .to(anamorphic, { scaleX: 0.8, opacity: 0.55, duration: 0.35 }, 1.25)
        // 4. Diamond optical scintillation sparkles twinkle
        .to(sparkles, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'back.out(2.5)' }, 0.9)
        .to('.preloader-sparkle--main', { scale: 1.4, duration: 0.32, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 1.22);

      // Animated 00% to 100% Progress Counter & Dynamic Bench Protocol Status
      const counter = { val: 0 };
      let lastStatus = '';
      let hasExited = false;

      gsap.to(counter, {
        val: 100,
        duration: 1.75,
        ease: 'power1.inOut',
        onUpdate: () => {
          const current = Math.round(counter.val);
          if (bigCount) {
            bigCount.textContent = current < 10 ? '0' + current : current;
          }
          if (progressBar) {
            progressBar.style.width = current + '%';
          }

          let nextStatus = 'Initializing Optical Calibration...';
          if (current >= 25 && current < 55) {
            nextStatus = 'Calibrating Diamond Facet Fire...';
          } else if (current >= 55 && current < 85) {
            nextStatus = 'Polishing 18K Gold Metallic Gradient...';
          } else if (current >= 85) {
            nextStatus = 'Haute Joaillerie Masterpiece Ready.';
          }

          if (statusText && nextStatus !== lastStatus) {
            lastStatus = nextStatus;
            statusText.textContent = nextStatus;
          }
        },
        onComplete: () => {
          if (bigCount) bigCount.textContent = '100';
          if (progressBar) progressBar.style.width = '100%';
          exitPreloader();
        }
      });

      function exitPreloader() {
        if (hasExited) return;
        hasExited = true;

        const exitTl = gsap.timeline({
          onComplete: () => {
            preloader.classList.add('is-done');
            preloader.style.display = 'none';
            document.body.style.overflow = '';
            if (lenis && typeof lenis.start === 'function') lenis.start();

            // Trigger hero editorial entrance animation
            if (typeof window.triggerHeroEntrance === 'function') {
              window.triggerHeroEntrance();
            }
          }
        });

        exitTl
          // Final brilliant scintillation flare flash
          .to('.preloader-sparkle--main', {
            scale: 2.2,
            opacity: 1,
            duration: 0.22,
            ease: 'power2.out'
          })
          .to(preloader.querySelector('.preloader-content'), {
            y: -24,
            opacity: 0,
            scale: 0.96,
            duration: 0.45,
            ease: 'power3.in'
          }, '-=0.08')
          .to(preloader, {
            opacity: 0,
            duration: 0.55,
            ease: 'power3.inOut'
          }, '-=0.22');
      }

      // Safety timeout so user is never stuck if window loading is delayed
      setTimeout(() => {
        if (!hasExited) exitPreloader();
      }, 3500);

    } else {
      // Fallback if GSAP is unavailable
      setTimeout(() => {
        preloader.classList.add('is-done');
        preloader.style.display = 'none';
        document.body.style.overflow = '';
        if (typeof window.triggerHeroEntrance === 'function') {
          window.triggerHeroEntrance();
        }
      }, 800);
    }
  }

  function start() {
    initLuxuryPreloader();
    initHeroShowcase();
    initHeroVideoModal();
    initSliders();
    init3DImageTilt();
    initMacroLoupe();
    initColorwayStudio();
    initPortfolioFilters();
    initPortfolioViews();
    initTestimonialsSwiper();
    initArtisanManifestoSlider();
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
    if (artisanManifestoSwiper && typeof artisanManifestoSwiper.update === 'function') {
      artisanManifestoSwiper.update();
    }
  });

  window.addEventListener('resize', () => {
    if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
      window.ScrollTrigger.refresh();
    }
    if (lenis && typeof lenis.resize === 'function') {
      lenis.resize();
    }
    if (artisanManifestoSwiper && typeof artisanManifestoSwiper.update === 'function') {
      artisanManifestoSwiper.update();
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
