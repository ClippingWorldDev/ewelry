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
        'how-we-work', 'portfolio', 'workflow', 'why-us', 'testimonials',
        'free-trial-home', 'faq'
      ]);

      let lenis = null;

      function parseHash(rawHash) {
        const clean = (rawHash || '#home').replace(/^#/, '').trim();
        if (!clean || clean === 'home') return { page: 'home', anchor: null };
        if (PAGE_TITLES[clean]) return { page: clean, anchor: null };
        if (HOME_ANCHORS.has(clean)) return { page: 'home', anchor: clean };
        return { page: 'home', anchor: null };
      }

      function refreshMotion() {
        if (lenis && typeof lenis.resize === 'function') lenis.resize();
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
          window.ScrollTrigger.refresh();
        }
      }

      function scrollToAnchor(anchorId) {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

        if (lenis && !reduced) {
          lenis.scrollTo(el, { offset: -offset, duration: 1.0 });
        } else {
          const y = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: Math.max(0, y), behavior: reduced ? 'auto' : 'smooth' });
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
        mobileOpenBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        if (mobileCloseBtn) mobileCloseBtn.focus();
      }

      function closeMobileDrawer() {
        if (!mobileDrawer || !mobileDrawer.classList.contains('open')) return;
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        mobileOpenBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }

      if (mobileOpenBtn) mobileOpenBtn.addEventListener('click', openMobileDrawer);
      if (mobileCloseBtn) mobileCloseBtn.addEventListener('click', () => {
        closeMobileDrawer();
        mobileOpenBtn.focus();
      });
      if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileDrawer);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileDrawer();
      });

      /* Service Pre-Selection Helpers */
      document.addEventListener('click', (e) => {
        const quoteLink = e.target.closest('[data-preselect-quote]');
        if (quoteLink) {
          const val = quoteLink.getAttribute('data-preselect-quote');
          document.querySelectorAll('.js-quote-service').forEach((sel) => { sel.value = val; });
        }
        const trialLink = e.target.closest('[data-preselect-trial]');
        if (trialLink) {
          const val = trialLink.getAttribute('data-preselect-trial');
          document.querySelectorAll('.js-trial-service').forEach((sel) => { sel.value = val; });
        }
      });

      /* ----------------------------------------------------------------------
         3. ACCESSIBLE BEFORE / AFTER SLIDERS (CLIP-PATH + WINDOW POINTER TRACKING)
         ---------------------------------------------------------------------- */
      function initSliders() {
        document.querySelectorAll('[data-ba-slider]').forEach((slider) => {
          const handle = slider.querySelector('.ba-handle');
          if (!handle) return;

          let pct = 50;

          const setPos = (value) => {
            pct = Math.max(0, Math.min(100, value));
            slider.style.setProperty('--pos', pct + '%');
            handle.setAttribute('aria-valuenow', String(Math.round(pct)));
          };

          const updateFromX = (clientX) => {
            const rect = slider.getBoundingClientRect();
            if (!rect.width) return;
            setPos(((clientX - rect.left) / rect.width) * 100);
          };

          const startDrag = (e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            slider.classList.add('is-dragging');
            try {
              slider.setPointerCapture(e.pointerId);
            } catch (_) {}
            updateFromX(e.clientX);

            const onMove = (moveEvt) => {
              updateFromX(moveEvt.clientX);
            };

            const onEnd = () => {
              slider.classList.remove('is-dragging');
              try {
                slider.releasePointerCapture(e.pointerId);
              } catch (_) {}
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onEnd);
              window.removeEventListener('pointercancel', onEnd);
            };

            window.addEventListener('pointermove', onMove, { passive: true });
            window.addEventListener('pointerup', onEnd);
            window.addEventListener('pointercancel', onEnd);
            e.preventDefault();
          };

          slider.addEventListener('pointerdown', startDrag);

          handle.addEventListener('keydown', (e) => {
            const step = e.shiftKey ? 10 : 2;
            if (e.key === 'ArrowLeft') { e.preventDefault(); setPos(pct - step); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); setPos(pct + step); }
            else if (e.key === 'Home') { e.preventDefault(); setPos(0); }
            else if (e.key === 'End') { e.preventDefault(); setPos(100); }
          });

          setPos(50);
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

            if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
         5. ACCESSIBLE FAQ ACCORDION
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

      /* ----------------------------------------------------------------------
         7. GSAP 3 + SCROLLTRIGGER + LENIS SMOOTH SCROLLING
         ---------------------------------------------------------------------- */
      function initAnimationsAndScroll() {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduced) return;

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
          } catch (_) {
            lenis = null;
          }
        }

        if (!window.gsap || !window.ScrollTrigger) return;
        const gsap = window.gsap;
        const ScrollTrigger = window.ScrollTrigger;
        gsap.registerPlugin(ScrollTrigger);

        const mm = gsap.matchMedia();
        mm.add('(prefers-reduced-motion: no-preference)', () => {
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
          if (!isMobile && serviceCards.length > 1) {
            serviceCards.forEach((card, i) => {
              gsap.from(card, {
                y: yDist,
                opacity: 0,
                duration: 0.85,
                ease: 'power3.out',
                scrollTrigger: { trigger: card, start: 'top 86%', once: true }
              });

              if (i < serviceCards.length - 1) {
                const nextCard = serviceCards[i + 1];
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
            });
          } else {
            serviceCards.forEach((card) => {
              gsap.from(card, {
                y: yDist,
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

          // Testimonials
          gsap.from('.js-testimonial-card', {
            y: 24,
            opacity: 0,
            duration: 0.75,
            stagger: 0.12,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: '.testimonials-grid', start: 'top 86%', once: true }
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
        });
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

      window.addEventListener('DOMContentLoaded', () => {
        initSliders();
        initPortfolioFilters();
        initFaq();
        initForms();
        initHeaderScroll();

        navigateRoute(window.location.hash || '#home', Boolean(window.location.hash && window.location.hash !== '#home'));
        window.addEventListener('hashchange', () => navigateRoute(window.location.hash || '#home', true));
      });

      window.addEventListener('load', () => {
        initAnimationsAndScroll();
      });
    })();