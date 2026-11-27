/**
 * ============================================================================
 * LUXURY EDITORIAL "THE SIX STEPS OF JEWELRY RETOUCHING" (SWIPER + GSAP)
 * ============================================================================
 * WordPress Enqueue Guide (add to functions.php):
 *   wp_enqueue_script('swiper', 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', array(), '11.0.0', true);
 *   wp_enqueue_script('gsap', 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js', array(), '3.12.5', true);
 *   wp_enqueue_script('gsap-scrolltrigger', 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js', array('gsap'), '3.12.5', true);
 *   wp_enqueue_script('jrw-workflow-js', get_template_directory_uri() . '/assets/js/jrw-workflow.js', array('swiper', 'gsap', 'gsap-scrolltrigger'), '2.0.0', true);
 * ============================================================================
 */

(() => {
  'use strict';

  const root = document.getElementById('jrw-workflow');
  if (!root) return;

  const hasGsap = typeof gsap !== 'undefined';
  if (hasGsap && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const swiperEl = root.querySelector('#jrwSwiper') || root.querySelector('.jrw-swiper');
  const slideCards = Array.from(root.querySelectorAll('.jrw-slide-card'));
  const stagePanels = Array.from(root.querySelectorAll('.jrw-stage'));
  const stepCount = slideCards.length;

  if (!swiperEl || !stepCount) return;

  const EDGE_SETTLE_MS = 380;
  let activeStep = 0;
  let swiper = null;
  let edgeCooldownActive = false;
  let edgeCooldownTimer = null;
  const stageControllers = [];

  function setActiveStep(index) {
    const nextIdx = Math.max(0, Math.min(stepCount - 1, index));
    activeStep = nextIdx;

    stagePanels.forEach((stage, i) => {
      stage.classList.toggle('is-active', i === nextIdx);
    });

    // Play/restart active stage animation and pause inactive stages
    stageControllers.forEach((ctrl, i) => {
      if (!ctrl) return;
      if (i === nextIdx) {
        if (typeof ctrl.restart === 'function') ctrl.restart();
        else if (typeof ctrl.play === 'function') ctrl.play();
      } else if (typeof ctrl.pause === 'function') {
        ctrl.pause();
      }
    });
  }

  function clearEdgeCooldownTimer() {
    if (edgeCooldownTimer) {
      window.clearTimeout(edgeCooldownTimer);
      edgeCooldownTimer = null;
    }
  }

  function releaseEdgeCooldown(instance) {
    clearEdgeCooldownTimer();
    edgeCooldownActive = false;
    if (instance && instance.params && instance.params.mousewheel) {
      instance.params.mousewheel.releaseOnEdges = true;
    }
  }

  function handleEdgeCooldownOnSlideChange(instance) {
    if (!instance) return;
    clearEdgeCooldownTimer();

    if (instance.isBeginning || instance.isEnd) {
      edgeCooldownActive = true;
      if (instance.params && instance.params.mousewheel) {
        instance.params.mousewheel.releaseOnEdges = false;
      }
      const speedMs = Number(instance.params && instance.params.speed) || 0;
      edgeCooldownTimer = window.setTimeout(() => {
        releaseEdgeCooldown(instance);
      }, speedMs + EDGE_SETTLE_MS + 60);
    } else {
      edgeCooldownActive = false;
      if (instance.params && instance.params.mousewheel) {
        instance.params.mousewheel.releaseOnEdges = true;
      }
    }
  }

  function scheduleEdgeCooldownRelease(instance) {
    if (!instance || !edgeCooldownActive) return;
    clearEdgeCooldownTimer();
    edgeCooldownTimer = window.setTimeout(() => {
      releaseEdgeCooldown(instance);
    }, EDGE_SETTLE_MS);
  }

  function isCardFramedForWheel(e) {
    const rect = swiperEl.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const isFullyVisible = rect.top >= 70 && rect.bottom <= vh + 24;
    if (isFullyVisible) return true;

    // Scrolling DOWN: allow page scroll until the card is either fully visible or centered cleanly
    if (e.deltaY > 0 && rect.bottom > vh + 24 && rect.top > vh * 0.35) {
      return false;
    }
    // Scrolling UP: allow page scroll until the card top clears header or occupies most of viewport
    if (e.deltaY < 0 && rect.top < 72 && rect.bottom < vh * 0.65) {
      return false;
    }
    return true;
  }

  // Lifecycle & Entrance Reveals (GSAP Context)
  const ctx = hasGsap
    ? gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add('(prefers-reduced-motion: no-preference)', () => {
          const header = root.querySelector('.jrw-header');
          const headerItems = root.querySelectorAll('.jrw-eyebrow, .jrw-title, .jrw-subtitle');

          if (header && headerItems.length) {
            gsap.from(headerItems, {
              y: 20,
              opacity: 0,
              duration: 0.9,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: header,
                start: 'top 85%',
                once: true
              }
            });
          }

          gsap.from(swiperEl, {
            y: 30,
            opacity: 0,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: swiperEl,
              start: 'top 88%',
              once: true
            }
          });
        });
      }, root)
    : null;

  // Viewport Observer helper (plays active stage in view, pauses off-screen)
  function createViewportTimeline(stage, build) {
    let timeline = null;
    if (hasGsap && !reduceMotion) timeline = build();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!timeline) return;
        const isCurrent = stage.classList.contains('is-active');
        if (entry.isIntersecting && isCurrent) {
          timeline.play();
        } else {
          timeline.pause();
        }
      });
    }, { threshold: 0.05, rootMargin: '120px 0px' });

    observer.observe(swiperEl);
    return timeline;
  }

  // ==========================================================================
  // STAGE 01: BACKGROUND REMOVAL (PRECISION CLIPPING PATH)
  // ==========================================================================
  function stage1(card) {
    if (!hasGsap) return null;
    const stage = card.querySelector('.jrw-stage-1');
    if (!stage) return null;
    const reveal = stage.querySelector('.jrw-s1-reveal');
    const wipe = stage.querySelector('.jrw-s1-wipe');
    const paths = stage.querySelectorAll('.jrw-s1-pen-path');
    const status = card.querySelector('#jrw-status-01');

    if (reduceMotion) {
      gsap.set(reveal, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' });
      gsap.set(wipe, { opacity: 0 });
      gsap.set(paths, { opacity: 0 });
      return null;
    }

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true });

    timeline
      .set(reveal, { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' })
      .set(wipe, { left: '0%', opacity: 1 })
      .set(paths, { strokeDashoffset: 2300, opacity: 0.9 })
      .call(() => { if (status) status.textContent = 'Tracing Vector Paths'; })
      // 1. Vector pen-tool draws precision outline around the jewelry silhouette
      .to(paths, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut' })
      .call(() => { if (status) status.textContent = 'Peeling Raw Background'; }, null, '+=0.2')
      // 2. Slanted hairline wipe sweeps across, smoothly peeling away the raw background
      // and revealing the pristine, isolated studio canvas while the ring stays 100% solid!
      .to(reveal, {
        clipPath: 'polygon(0 0, 108% 0, 100% 100%, 0 100%)',
        duration: 2.6,
        ease: 'power2.inOut'
      }, '+=0.1')
      .to(wipe, {
        left: '100%',
        duration: 2.6,
        ease: 'power2.inOut'
      }, '<')
      .to(wipe, { opacity: 0, duration: 0.4 }, '-=0.2')
      .to(paths, { opacity: 0, duration: 0.5 }, '<')
      .call(() => { if (status) status.textContent = 'Vector Path Cutout'; })
      // 3. Hold pristine isolated view for 2.4s so the viewer can admire the flawless result
      .to({}, { duration: 2.4 });

    return createViewportTimeline(stage, () => timeline);
  }

  // ==========================================================================
  // STAGE 02: BASIC RETOUCHING (400% CLEANUP)
  // ==========================================================================
  function stage2(card) {
    if (!hasGsap) return null;
    const stage = card.querySelector('.jrw-stage-2');
    if (!stage) return null;
    const after = stage.querySelector('.jrw-s2-after');
    const line = stage.querySelector('.jrw-s2-line');
    const loupe = stage.querySelector('.jrw-s2-loupe');

    if (reduceMotion) {
      gsap.set(after, { clipPath: 'inset(0 0% 0 0)' });
      gsap.set([line, loupe], { left: '94%' });
      return null;
    }

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });

    timeline
      .set(after, { clipPath: 'inset(0 94% 0 0)' })
      .set([line, loupe], { left: '6%' })
      // Scan line and 400% Loupe move in lockstep across the surface
      .to(after, {
        clipPath: 'inset(0 6% 0 0)',
        duration: 4.8,
        ease: 'power2.inOut'
      })
      .to([line, loupe], {
        left: '94%',
        duration: 4.8,
        ease: 'power2.inOut'
      }, 0)
      // Subtle optical pulse on loupe
      .fromTo(loupe,
        { scale: 0.97 },
        { scale: 1.03, duration: 0.8, repeat: 5, yoyo: true, ease: 'power1.inOut' },
        0
      )
      // Hold clean state
      .to({}, { duration: 2.5 });

    return createViewportTimeline(stage, () => timeline);
  }

  // ==========================================================================
  // STAGE 03: HAND RETOUCHING (MANUAL DODGE & BURN)
  // ==========================================================================
  function stage3(card) {
    if (!hasGsap) return null;
    const stage = card.querySelector('.jrw-stage-3');
    if (!stage) return null;
    const sculpted = stage.querySelector('.jrw-s3-sculpted');
    const brush = stage.querySelector('.jrw-s3-brush');
    const sheen = stage.querySelector('.jrw-s3-sheen');

    if (reduceMotion) {
      gsap.set(sculpted, { clipPath: 'circle(120% at 52% 48%)' });
      gsap.set(sheen, { opacity: 0 });
      gsap.set(brush, { opacity: 0 });
      return null;
    }

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.8, paused: true });

    timeline
      .set(sculpted, { clipPath: 'circle(0% at 52% 48%)' })
      .set(brush, { left: '32%', top: '48%', opacity: 1 })
      // Brush glides organically along jewelry contours as circle expands to 120%
      .to(sculpted, {
        clipPath: 'circle(120% at 52% 48%)',
        duration: 4.6,
        ease: 'power2.inOut'
      })
      .to(brush, { left: '56%', top: '34%', duration: 1.6, ease: 'power2.inOut' }, 0.3)
      .to(brush, { left: '68%', top: '56%', duration: 1.6, ease: 'power2.inOut' }, 1.9)
      .to(brush, { left: '46%', top: '64%', duration: 1.4, ease: 'power2.inOut' }, 3.5)
      .to(brush, { opacity: 0, duration: 0.5 }, 4.6)
      // Subtle satin highlight sheen sweeps across the stage
      .fromTo(sheen,
        { left: '-30%', opacity: 0 },
        { left: '110%', opacity: 0.85, duration: 2.2, ease: 'power1.inOut' },
        4.8
      )
      .to(sheen, { opacity: 0, duration: 0.5 }, 6.8)
      // Hold sculpted luster
      .to({}, { duration: 1.6 });

    return createViewportTimeline(stage, () => timeline);
  }

  // ==========================================================================
  // STAGE 04: GRID & ALIGNMENT (PERSPECTIVE & GEOMETRIC SYMMETRY)
  // Dual-Image Transformation: Raw Casting Offset (+5.2deg) -> 0.0deg Symmetrical Master
  // ==========================================================================
  function stage4(card) {
    if (!hasGsap) return null;
    const stage = card.querySelector('.jrw-stage-4');
    if (!stage) return null;
    const subject = stage.querySelector('.jrw-s4-subject');
    const alignedWrap = stage.querySelector('.jrw-s4-aligned-wrap');
    const grid = stage.querySelector('.jrw-s4-grid');
    const guideSvg = stage.querySelector('.jrw-s4-guide-svg');
    const angle = stage.querySelector('#jrw-angle-pill');
    const status = card.querySelector('#jrw-status-04');

    if (reduceMotion) {
      gsap.set(subject, { rotation: 0, x: 0, y: 0 });
      if (alignedWrap) gsap.set(alignedWrap, { opacity: 1 });
      gsap.set([grid, guideSvg], { opacity: 1 });
      if (angle) {
        angle.textContent = '0.0° ALIGNED';
        angle.style.borderColor = '#B08D57';
        angle.style.color = '#8E6E3B';
      }
      if (status) status.textContent = '0.0° Symmetry Locked';
      return null;
    }

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1.2, paused: true });

    timeline
      // 1. Initial State: Raw uncentered casting tilted at +5.2deg
      .set(subject, { rotation: 5.2, x: 12, y: -6 })
      .set(alignedWrap, { opacity: 0 })
      .set([grid, guideSvg], { opacity: 0 })
      .set(angle, { borderColor: '#E5DDD0', color: '#1C1B19' })
      .call(() => {
        if (status) status.textContent = 'Scanning Raw Tilt (+5.2°)';
        if (angle) angle.textContent = '+5.2° OFFSET';
      })
      // 2. Precision architectural grid & SVG laser crosshairs power up
      .to([grid, guideSvg], { opacity: 1, duration: 1.1, ease: 'power2.out' })
      // 3. Subject smoothly rotates and levels to 0.0deg perfect vertical alignment
      .to(subject, { rotation: 0, x: 0, y: 0, duration: 2.2, ease: 'power3.out' })
      // 4. Counter counts down smoothly from +5.2deg to 0.0deg
      .call(() => {
        const obj = { val: 5.2 };
        gsap.to(obj, {
          val: 0,
          duration: 2.2,
          ease: 'power3.out',
          onUpdate: () => {
            if (angle) {
              angle.textContent = obj.val <= 0.05 ? '0.0° ALIGNED' : `+${obj.val.toFixed(1)}° OFFSET`;
            }
          }
        });
      }, null, '-=2.2')
      // 5. Cross-fade seamlessly into pristine aligned master image with a golden gleam
      .to(alignedWrap, { opacity: 1, duration: 0.85, ease: 'power2.out' }, '-=0.6')
      // 6. Lock state styling & status update
      .to(angle, { borderColor: '#B08D57', color: '#8E6E3B', duration: 0.4 }, '-=0.3')
      .call(() => {
        if (status) status.textContent = '0.0° Symmetry Locked';
      })
      // 7. Hold aligned master state cleanly so viewer appreciates the result
      .to({}, { duration: 2.8 });

    return createViewportTimeline(stage, () => timeline);
  }

  // ==========================================================================
  // STAGE 05: METAL PLATING & COLOR (DIGITAL GILDING & TONE)
  // ==========================================================================
  function stage5(card) {
    const stage = card.querySelector('.jrw-stage-5');
    if (!stage) return null;
    const layers = Array.from(stage.querySelectorAll('.jrw-s5-layer'));
    const buttons = Array.from(stage.querySelectorAll('.jrw-s5-swatches button'));
    const status = card.querySelector('#jrw-status-05');
    let active = 0;
    let timer = null;
    let pausedUntil = 0;
    let isSwiperVisible = false;
    const labels = ['18K Yellow Gold', 'Rose Gold', 'Platinum'];

    function selectFinish(index, manual = false) {
      if (index === active && !manual) return;
      const incoming = layers[index];
      const outgoing = layers[active];
      active = index;

      if (hasGsap && !reduceMotion) {
        gsap.set(outgoing, { zIndex: 4 });
        gsap.set(incoming, { zIndex: 6, opacity: 1, clipPath: 'polygon(0 0, 0 0, -14% 100%, 0 100%)' });

        // Diagonal wave wipe
        gsap.to(incoming, {
          clipPath: 'polygon(0 0, 118% 0, 104% 100%, 0 100%)',
          duration: 1.4,
          ease: 'power2.inOut',
          onComplete: () => {
            layers.forEach((layer, layerIndex) => {
              layer.classList.toggle('is-active', layerIndex === index);
              gsap.set(layer, { zIndex: layerIndex === index ? 3 : 2 });
            });
            gsap.set(incoming, { clipPath: 'none' });
          }
        });
      } else {
        layers.forEach((layer, layerIndex) => {
          layer.classList.toggle('is-active', layerIndex === index);
          if (hasGsap) {
            gsap.set(layer, { zIndex: layerIndex === index ? 3 : 2, opacity: layerIndex === index ? 1 : 0, clipPath: 'none' });
          } else {
            layer.style.zIndex = layerIndex === index ? '3' : '2';
            layer.style.opacity = layerIndex === index ? '1' : '0';
            layer.style.clipPath = 'none';
          }
        });
      }

      // Update swatch active state & ARIA
      buttons.forEach((button, buttonIndex) => {
        button.classList.toggle('is-active', buttonIndex === index);
        button.setAttribute('aria-selected', buttonIndex === index ? 'true' : 'false');
      });

      if (status) status.textContent = labels[index];
      if (manual) pausedUntil = Date.now() + 7500;
    }

    buttons.forEach((button, index) => {
      button.addEventListener('click', () => selectFinish(index, true));
    });

    function startCycle() {
      if (reduceMotion || timer) return;
      timer = window.setInterval(() => {
        if (!reduceMotion && Date.now() > pausedUntil && stage.classList.contains('is-active')) {
          selectFinish((active + 1) % layers.length);
        }
      }, 3600);
    }

    function stopCycle() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    // Auto-cycle finishes every 3.6s when visible and active
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isSwiperVisible = entry.isIntersecting;
        if (entry.isIntersecting && stage.classList.contains('is-active')) {
          startCycle();
        } else {
          stopCycle();
        }
      });
    }, { threshold: 0.05, rootMargin: '120px 0px' });

    observer.observe(swiperEl);

    return {
      restart: () => {
        if (isSwiperVisible) startCycle();
      },
      play: () => {
        if (isSwiperVisible) startCycle();
      },
      pause: stopCycle
    };
  }

  // ==========================================================================
  // STAGE 06: FINAL IMAGE (BEFORE & AFTER MASTERPIECE SLIDER)
  // ==========================================================================
  function stage6(card) {
    const stage = card.querySelector('.jrw-stage-6');
    if (!stage) return null;
    const hint = stage.querySelector('.jrw-s6-hint');
    const status = card.querySelector('#jrw-status-06');
    let pos = 50;
    let autoTween = null;
    let interacting = false;
    let isSwiperVisible = false;

    const setPos = (value) => {
      pos = Math.max(5, Math.min(95, value));
      stage.style.setProperty('--jrw-pos', `${pos}%`);
      stage.setAttribute('aria-valuenow', String(Math.round(pos)));
    };

    function startAuto() {
      if (!hasGsap || reduceMotion || !stage.classList.contains('is-active')) return;
      if (autoTween) autoTween.kill();
      if (status) status.textContent = 'Auto-Compare Active';
      const proxy = { value: pos };
      autoTween = gsap.timeline({ repeat: -1, yoyo: true })
        .to(proxy, {
          value: 78,
          duration: 2.8,
          ease: 'power1.inOut',
          onUpdate: () => setPos(proxy.value)
        })
        .to(proxy, {
          value: 22,
          duration: 2.8,
          ease: 'power1.inOut',
          onUpdate: () => setPos(proxy.value)
        });
    }

    const updateFromPointer = (event) => {
      const rect = stage.getBoundingClientRect();
      const x = event.clientX - rect.left;
      setPos((x / rect.width) * 100);
    };

    // Pointer Dragging (Mouse & Touch)
    stage.addEventListener('pointerdown', (event) => {
      interacting = true;
      if (autoTween) autoTween.pause();
      stage.setPointerCapture(event.pointerId);
      if (hint) {
        if (hasGsap) gsap.to(hint, { opacity: 0, y: 5, duration: 0.35 });
        else hint.style.opacity = '0';
      }
      if (status) status.textContent = 'Comparing Raw & Final';
      updateFromPointer(event);
    });

    stage.addEventListener('pointermove', (event) => {
      if (interacting) updateFromPointer(event);
    });

    stage.addEventListener('pointerup', (event) => {
      interacting = false;
      if (stage.hasPointerCapture(event.pointerId)) {
        stage.releasePointerCapture(event.pointerId);
      }
      if (hasGsap && !reduceMotion) {
        gsap.delayedCall(1.4, startAuto);
      }
    });

    // Keyboard Accessibility (Left/Right Arrows)
    stage.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (autoTween) autoTween.pause();
        if (hint) {
          if (hasGsap) gsap.to(hint, { opacity: 0, duration: 0.25 });
          else hint.style.opacity = '0';
        }
        setPos(pos + (event.key === 'ArrowRight' ? 5 : -5));
        if (status) status.textContent = 'Comparing Raw & Final';
      }
    });

    // Viewport visibility check
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isSwiperVisible = entry.isIntersecting;
        if (entry.isIntersecting && stage.classList.contains('is-active')) {
          startAuto();
        } else if (autoTween) {
          autoTween.pause();
        }
      });
    }, { threshold: 0.05, rootMargin: '120px 0px' });

    observer.observe(swiperEl);
    setPos(50);

    return {
      restart: () => {
        if (autoTween) autoTween.kill();
        setPos(50);
        if (hint) {
          if (hasGsap) gsap.set(hint, { opacity: 1, y: 0 });
          else hint.style.opacity = '1';
        }
        if (isSwiperVisible) startAuto();
      },
      play: () => {
        if (isSwiperVisible) startAuto();
      },
      pause: () => {
        if (autoTween) autoTween.pause();
      }
    };
  }

  // ==========================================================================
  // BESPOKE LUXURY WORKFLOW INTERACTIVE CURSOR FOLLOWER
  // ==========================================================================
  function initWorkflowCursor() {
    if (!hasGsap) return;
    const cursor = root.querySelector('#jrw-cursor');
    if (!cursor || window.matchMedia('(hover: none), (pointer: coarse)').matches) return;

    const cursorText = cursor.querySelector('.jrw-cursor-text');
    let isInside = false;

    // High performance smooth tracking using GSAP quickTo (120fps fluid lag-free)
    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power2.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power2.out' });

    window.addEventListener('pointermove', (e) => {
      const rect = root.getBoundingClientRect();
      const inSection = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );

      if (inSection) {
        if (!isInside) {
          isInside = true;
          cursor.classList.add('is-active');
        }
        xTo(e.clientX);
        yTo(e.clientY);

        const targetEl = e.target && typeof e.target.closest === 'function' ? e.target : null;
        const stage = targetEl ? targetEl.closest('.jrw-stage') : null;
        const card = targetEl ? targetEl.closest('.jrw-slide-card') : null;

        if (stage) {
          cursor.classList.add('is-hovering-stage');
          const customText = stage.getAttribute('data-cursor');
          if (customText && cursorText) {
            cursorText.textContent = customText;
          }
        } else {
          cursor.classList.remove('is-hovering-stage');
          if (card) {
            const rawStep = card.getAttribute('data-step') || String(activeStep + 1);
            const stepNum = rawStep.padStart(2, '0');
            if (cursorText) cursorText.textContent = `STEP ${stepNum} PROTOCOL`;
          } else if (cursorText) {
            cursorText.textContent = 'CRAFTSMANSHIP PROTOCOL';
          }
        }
      } else if (isInside) {
        isInside = false;
        cursor.classList.remove('is-active');
      }
    });

    // Grab state on stage 6 slider
    const stage6El = root.querySelector('.jrw-stage-6');
    if (stage6El) {
      stage6El.addEventListener('pointerdown', () => cursor.classList.add('is-grabbing'));
      window.addEventListener('pointerup', () => cursor.classList.remove('is-grabbing'));
      window.addEventListener('pointercancel', () => cursor.classList.remove('is-grabbing'));
    }
  }

  // Initialize all 6 stage controllers scoped to each slide card
  const getCardForStep = (idx) => slideCards[idx] || root;
  stageControllers[0] = stage1(getCardForStep(0));
  stageControllers[1] = stage2(getCardForStep(1));
  stageControllers[2] = stage3(getCardForStep(2));
  stageControllers[3] = stage4(getCardForStep(3));
  stageControllers[4] = stage5(getCardForStep(4));
  stageControllers[5] = stage6(getCardForStep(5));

  // Capture-phase Viewport Framing Guard on #jrw-workflow:
  // Allows Lenis to vertically frame the carousel before horizontal wheel sliding engages
  root.addEventListener('wheel', (e) => {
    if (!swiper || !swiper.mousewheel || e.ctrlKey) return;

    if (!isCardFramedForWheel(e)) {
      if (swiper.mousewheel.enabled) {
        swiper.mousewheel.disable();
      }
      return;
    }

    if (!swiper.mousewheel.enabled) {
      swiper.mousewheel.enable();
    }
  }, { capture: true, passive: false });

  // Initialize Horizontal Swiper Carousel (guarded cleanly)
  if (typeof Swiper !== 'undefined') {
    swiper = new Swiper(swiperEl, {
      slidesPerView: 1,
      spaceBetween: 28,
      speed: reduceMotion ? 0 : 700,
      grabCursor: true,
      noSwiping: true,
      noSwipingClass: 'swiper-no-swiping',
      nested: true,
      mousewheel: {
        enabled: true,
        releaseOnEdges: true,
        forceToAxis: false,
        sensitivity: 1,
        thresholdDelta: 6,
        thresholdTime: 180,
        eventsTarget: '#jrw-workflow'
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      on: {
        init(instance) {
          setActiveStep(instance.activeIndex || 0);
        },
        slideChange(instance) {
          setActiveStep(instance.activeIndex || 0);
          handleEdgeCooldownOnSlideChange(instance);
        },
        slideChangeTransitionEnd(instance) {
          scheduleEdgeCooldownRelease(instance);
        }
      }
    });

    // Bubble-phase Edge Inertia Cooldown propagation guard:
    // Blocks Lenis vertical scroll during slide transition and 380ms edge settle window
    root.addEventListener('wheel', (e) => {
      if (!swiper || e.ctrlKey) return;
      if (!isCardFramedForWheel(e)) return;

      if (edgeCooldownActive || swiper.animating) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, { passive: false });
  } else {
    setActiveStep(0);
  }

  // Initialize interactive workflow cursor
  initWorkflowCursor();

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    clearEdgeCooldownTimer();
    if (ctx) ctx.revert();
    if (swiper && typeof swiper.destroy === 'function') {
      swiper.destroy(true, true);
    }
  });
})();
