/**
 * ============================================================================
 * LUXURY EDITORIAL "THE SIX STEPS OF JEWELRY RETOUCHING" (GSAP SCRIPT)
 * ============================================================================
 * WordPress Enqueue Guide (add to functions.php):
 *   wp_enqueue_script('gsap', 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js', array(), '3.12.5', true);
 *   wp_enqueue_script('gsap-scrolltrigger', 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js', array('gsap'), '3.12.5', true);
 *   wp_enqueue_script('jrw-workflow-js', get_template_directory_uri() . '/assets/js/jrw-workflow.js', array('gsap', 'gsap-scrolltrigger'), '1.0.0', true);
 * ============================================================================
 */

(() => {
  'use strict';

  const root = document.getElementById('jrw-workflow');
  if (!root) return;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const runway = root.querySelector('#jrwRunway');
  const fixedCard = root.querySelector('#jrwFixedCard');
  const copySlides = Array.from(root.querySelectorAll('.jrw-copy-slide'));
  const stagePanels = Array.from(root.querySelectorAll('.jrw-stage'));
  const progressBar = root.querySelector('.jrw-progress');
  const progressCurrent = root.querySelector('#jrwProgressCurrent');
  const progressSegments = Array.from(root.querySelectorAll('.jrw-progress-segment'));
  const stepCount = copySlides.length;
  let activeStep = 0;
  let pulseTimer = null;
  const stageControllers = [];

  if (!fixedCard) return;

  function setActiveStep(index) {
    const nextIdx = Math.max(0, Math.min(stepCount - 1, index));
    if (nextIdx === activeStep && copySlides[nextIdx]?.classList.contains('is-active')) return;
    const isDown = nextIdx >= activeStep;
    activeStep = nextIdx;

    fixedCard.setAttribute('data-dir', isDown ? 'down' : 'up');
    fixedCard.classList.remove('is-switching');
    void fixedCard.offsetWidth;
    fixedCard.classList.add('is-switching');
    if (pulseTimer) window.clearTimeout(pulseTimer);
    pulseTimer = window.setTimeout(() => {
      fixedCard.classList.remove('is-switching');
    }, 660);

    copySlides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === nextIdx);
    });
    stagePanels.forEach((stage, i) => {
      stage.classList.toggle('is-active', i === nextIdx);
    });
    if (progressBar) {
      progressBar.setAttribute('aria-valuenow', String(nextIdx + 1));
      progressBar.setAttribute('aria-valuetext', `Step ${nextIdx + 1} of ${stepCount}`);
    }
    if (progressCurrent) {
      progressCurrent.textContent = String(nextIdx + 1).padStart(2, '0');
    }
    progressSegments.forEach((segment, i) => {
      segment.classList.toggle('is-complete', i <= nextIdx);
      segment.classList.toggle('is-current', i === nextIdx);
    });

    // Play/restart active stage animation and pause hidden stages
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

  if (typeof gsap === 'undefined') return;

  // Lifecycle & Context Management
  const ctx = gsap.context(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Header entrance reveal
      gsap.from(root.querySelectorAll('.jrw-eyebrow, .jrw-title, .jrw-subtitle'), {
        y: 20,
        opacity: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: root.querySelector('.jrw-header'),
          start: 'top 85%',
          once: true
        }
      });

      // Fixed Card entrance reveal
      gsap.from(fixedCard, {
        y: 30,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: fixedCard,
          start: 'top 88%',
          once: true
        }
      });
    });

    // Scroll-Driven Instant Live Swap on Fixed Card (Desktop, Tablet & Mobile)
    if (runway && stepCount > 1) {
      const lastStep = stepCount - 1;
      const getStickyTop = () => (window.innerWidth >= 1024 ? 96 : 78);

      const workflowTrigger = ScrollTrigger.create({
        trigger: runway,
        start: () => `top ${getStickyTop()}px`,
        end: () => {
          const cardH = fixedCard.offsetHeight || 520;
          const scrollable = Math.max(400, runway.offsetHeight - cardH - getStickyTop());
          return `+=${scrollable}`;
        },
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const nextStep = Math.max(0, Math.min(lastStep, Math.floor(self.progress * stepCount)));
          setActiveStep(nextStep);
        },
        onRefresh: (self) => {
          const nextStep = Math.max(0, Math.min(lastStep, Math.floor(self.progress * stepCount)));
          setActiveStep(nextStep);
        }
      });

      // Allow clicking any progress bar segment to jump directly to that step
      progressSegments.forEach((segment, idx) => {
        segment.setAttribute('role', 'button');
        segment.setAttribute('tabindex', '0');
        segment.setAttribute('aria-label', `Jump to Step ${idx + 1}`);
        const jumpToStep = () => {
          const startY = workflowTrigger.start;
          const endY = workflowTrigger.end;
          const targetProgress = (idx + 0.15) / stepCount;
          const targetY = startY + (endY - startY) * targetProgress;
          window.scrollTo({ top: targetY, behavior: 'smooth' });
          setActiveStep(idx);
        };
        segment.addEventListener('click', jumpToStep);
        segment.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            jumpToStep();
          }
        });
      });
    }
  }, root);

  // Viewport Observer helper (plays active stage in view, pauses off-screen)
  function createViewportTimeline(stage, build) {
    let timeline = null;
    if (!reduceMotion) timeline = build();

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

    observer.observe(fixedCard);
    return timeline;
  }

  const replayTimelines = {};

  // ==========================================================================
  // STAGE 01: BACKGROUND REMOVAL (PRECISION CLIPPING PATH)
  // ==========================================================================
  function stage1(card) {
    const stage = card.querySelector('.jrw-stage-1');
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

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });

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
    const stage = card.querySelector('.jrw-stage-2');
    const after = stage.querySelector('.jrw-s2-after');
    const line = stage.querySelector('.jrw-s2-line');
    const loupe = stage.querySelector('.jrw-s2-loupe');

    if (reduceMotion) {
      gsap.set(after, { clipPath: 'inset(0 0% 0 0)' });
      gsap.set([line, loupe], { left: '94%' });
      return null;
    }

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

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
    const stage = card.querySelector('.jrw-stage-3');
    const sculpted = stage.querySelector('.jrw-s3-sculpted');
    const brush = stage.querySelector('.jrw-s3-brush');
    const sheen = stage.querySelector('.jrw-s3-sheen');

    if (reduceMotion) {
      gsap.set(sculpted, { clipPath: 'circle(120% at 52% 48%)' });
      gsap.set(sheen, { opacity: 0 });
      gsap.set(brush, { opacity: 0 });
      return null;
    }

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 0.8 });

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
  // Dual-Image Transformation: Raw Casting Offset (+5.2°) -> 0.0° Symmetrical Master
  // ==========================================================================
  function stage4(card) {
    const stage = card.querySelector('.jrw-stage-4');
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

    const timeline = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });

    timeline
      // 1. Initial State: Raw uncentered casting tilted at +5.2°
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
      // 3. Subject smoothly rotates and levels to 0.0° perfect vertical alignment
      .to(subject, { rotation: 0, x: 0, y: 0, duration: 2.2, ease: 'power3.out' })
      // 4. Counter counts down smoothly from +5.2° to 0.0°
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
    const layers = Array.from(stage.querySelectorAll('.jrw-s5-layer'));
    const buttons = Array.from(stage.querySelectorAll('.jrw-s5-swatches button'));
    const status = card.querySelector('#jrw-status-05');
    let active = 0;
    let timer = null;
    let pausedUntil = 0;
    const labels = ['18K Yellow Gold', 'Rose Gold', 'Platinum'];

    function selectFinish(index, manual = false) {
      if (index === active && !manual) return;
      const incoming = layers[index];
      const outgoing = layers[active];
      active = index;

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

    let isStageVisible = false;

    // Auto-cycle finishes every 3.6s when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        isStageVisible = entry.isIntersecting;
        if (entry.isIntersecting && stage.classList.contains('is-active')) {
          if (!timer) {
            timer = window.setInterval(() => {
              if (!reduceMotion && Date.now() > pausedUntil && stage.classList.contains('is-active')) {
                selectFinish((active + 1) % layers.length);
              }
            }, 3600);
          }
        } else if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      });
    }, { threshold: 0.05, rootMargin: '120px 0px' });

    observer.observe(stage);

    return {
      restart: () => {
        if (!timer && isStageVisible) {
          timer = window.setInterval(() => {
            if (!reduceMotion && Date.now() > pausedUntil && stage.classList.contains('is-active')) {
              selectFinish((active + 1) % layers.length);
            }
          }, 3600);
        }
      },
      pause: () => {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }
    };
  }

  // ==========================================================================
  // STAGE 06: FINAL IMAGE (BEFORE & AFTER MASTERPIECE SLIDER)
  // ==========================================================================
  function stage6(card) {
    const stage = card.querySelector('.jrw-stage-6');
    const hint = stage.querySelector('.jrw-s6-hint');
    const status = card.querySelector('#jrw-status-06');
    let pos = 50;
    let autoTween = null;
    let interacting = false;

    const setPos = (value) => {
      pos = Math.max(5, Math.min(95, value));
      stage.style.setProperty('--jrw-pos', `${pos}%`);
      stage.setAttribute('aria-valuenow', String(Math.round(pos)));
    };

    function startAuto() {
      if (reduceMotion) return;
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
      if (hint) gsap.to(hint, { opacity: 0, y: 5, duration: 0.35 });
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
      gsap.delayedCall(1.4, startAuto);
    });

    // Keyboard Accessibility (Left/Right Arrows)
    stage.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        if (autoTween) autoTween.pause();
        if (hint) gsap.to(hint, { opacity: 0, duration: 0.25 });
        setPos(pos + (event.key === 'ArrowRight' ? 5 : -5));
        if (status) status.textContent = 'Comparing Raw & Final';
      }
    });

    // Viewport visibility check
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startAuto();
        } else if (autoTween) {
          autoTween.pause();
        }
      });
    }, { threshold: 0.05, rootMargin: '120px 0px' });

    observer.observe(stage);
    setPos(50);

    return {
      restart: () => {
        if (autoTween) autoTween.kill();
        setPos(50);
        if (hint) gsap.set(hint, { opacity: 1, y: 0 });
        startAuto();
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

        const stage = e.target.closest('.jrw-stage');
        const card = e.target.closest('.jrw-fixed-card');

        if (stage) {
          cursor.classList.add('is-hovering-stage');
          const customText = stage.getAttribute('data-cursor');
          if (customText && cursorText) {
            cursorText.textContent = customText;
          }
        } else {
          cursor.classList.remove('is-hovering-stage');
          if (card) {
            const activeCopy = card.querySelector('.jrw-copy-slide.is-active');
            const stepNum = activeCopy ? activeCopy.getAttribute('data-step') : String(activeStep + 1);
            if (cursorText) cursorText.textContent = `STEP 0${stepNum} PROTOCOL`;
          } else {
            if (cursorText) cursorText.textContent = 'CRAFTSMANSHIP PROTOCOL';
          }
        }
      } else if (isInside) {
        isInside = false;
        cursor.classList.remove('is-active');
      }
    });

    // Grab state on stage 6 slider
    const stage6 = root.querySelector('.jrw-stage-6');
    if (stage6) {
      stage6.addEventListener('pointerdown', () => cursor.classList.add('is-grabbing'));
      window.addEventListener('pointerup', () => cursor.classList.remove('is-grabbing'));
    }
  }

  // Initialize all 6 stages inside the Fixed Card and track controllers
  stageControllers[0] = stage1(fixedCard);
  stageControllers[1] = stage2(fixedCard);
  stageControllers[2] = stage3(fixedCard);
  stageControllers[3] = stage4(fixedCard);
  stageControllers[4] = stage5(fixedCard);
  stageControllers[5] = stage6(fixedCard);
  setActiveStep(0);

  // Initialize interactive workflow cursor
  initWorkflowCursor();

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    ctx.revert();
  });
})();
