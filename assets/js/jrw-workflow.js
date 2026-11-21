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
  const progressItems = Array.from(root.querySelectorAll('.jrw-progress-item'));
  const cards = Array.from(root.querySelectorAll('.jrw-card'));
  const anchors = Array.from(root.querySelectorAll('.jrw-anchor'));

  // Active step sync for desktop progress rail
  function setActive(index) {
    progressItems.forEach((item, itemIndex) => {
      item.classList.toggle('is-active', itemIndex === index);
    });
  }

  // Progress rail click smooth scroll
  progressItems.forEach((item) => {
    item.addEventListener('click', () => {
      const target = root.querySelector(`#${item.dataset.target}`);
      if (target) {
        target.scrollIntoView({
          behavior: reduceMotion ? 'auto' : 'smooth',
          block: 'start'
        });
      }
    });
  });

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

      // Sticky Stacking Depth Compression & Scrim Overlay
      cards.forEach((card, index) => {
        const shell = card.querySelector('.jrw-card-shell');
        const scrim = card.querySelector('.jrw-card-scrim');
        const nextAnchor = anchors[index + 1];

        // Scale down card slightly as the next card stacks over it
        if (nextAnchor && index < cards.length - 1) {
          gsap.timeline({
            scrollTrigger: {
              trigger: nextAnchor,
              start: 'top 90%',
              end: 'top 130px',
              scrub: 0.45
            }
          })
            .to(shell, {
              scale: 0.955,
              transformOrigin: 'center top',
              force3D: true,
              ease: 'none'
            }, 0)
            .to(scrim, {
              opacity: 0.075,
              ease: 'none'
            }, 0);
        }

        // Card entrance
        gsap.from(card, {
          y: 35,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true
          }
        });
      });
    });

    // Sync progress rail accurately on scroll (both directions)
    anchors.forEach((anchor, index) => {
      ScrollTrigger.create({
        trigger: anchor,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => setActive(index),
        onEnterBack: () => setActive(index)
      });
    });

    // Desktop Progress Rail Visibility: strictly visible only while in #jrw-workflow
    const progressRail = root.querySelector('.jrw-progress');
    if (progressRail) {
      const railTrigger = ScrollTrigger.create({
        trigger: root,
        start: 'top 60%',
        end: 'bottom 40%',
        onToggle: (self) => {
          progressRail.classList.toggle('is-visible', self.isActive);
        }
      });
      if (railTrigger.isActive) {
        progressRail.classList.add('is-visible');
      }
    }
  }, root);

  // Viewport Observer helper (plays animation in view, pauses off-screen)
  function createViewportTimeline(stage, build) {
    let timeline = null;
    if (!reduceMotion) timeline = build();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!timeline) return;
        if (entry.isIntersecting) {
          timeline.play();
        } else {
          timeline.pause();
        }
      });
    }, { threshold: 0.05, rootMargin: '120px 0px' });

    observer.observe(stage);
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
  // ==========================================================================
  function stage4(card) {
    const stage = card.querySelector('.jrw-stage-4');
    const subject = stage.querySelector('.jrw-s4-subject');
    const grid = stage.querySelector('.jrw-s4-grid');
    const guideSvg = stage.querySelector('.jrw-s4-guide-svg');
    const angle = stage.querySelector('#jrw-angle-pill');
    const status = card.querySelector('#jrw-status-04');

    if (reduceMotion) {
      gsap.set(subject, { rotation: 0, x: 0 });
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
      .set(subject, { rotation: 5.2, x: 10 })
      .set([grid, guideSvg], { opacity: 0 })
      .set(angle, { borderColor: '#E5DDD0', color: '#1C1B19' })
      .call(() => {
        if (status) status.textContent = 'Drawing Symmetry Grid';
        if (angle) angle.textContent = '+5.2° OFFSET';
      })
      // Fade in architectural grid & precision SVG axes/brackets
      .to([grid, guideSvg], { opacity: 1, duration: 1.2, ease: 'power2.out' })
      // Tween subject to perfect upright alignment
      .to(subject, { rotation: 0, x: 0, duration: 2.2, ease: 'power3.out' })
      // Smoothly count down degree readout from +5.2° to 0.0°
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
      // Lock state styling
      .to(angle, { borderColor: '#B08D57', color: '#8E6E3B', duration: 0.4 }, '-=0.2')
      .call(() => {
        if (status) status.textContent = '0.0° Symmetry Locked';
      })
      // Hold aligned state cleanly
      .to({}, { duration: 2.6 });

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

    // Auto-cycle finishes every 3.6s when visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!timer) {
            timer = window.setInterval(() => {
              if (!reduceMotion && Date.now() > pausedUntil) {
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
      restart: () => selectFinish(0, true)
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
      }
    };
  }

  // Initialize all 6 stages (infinite automated motion)
  cards.forEach((card) => {
    const id = Number(card.dataset.step);
    if (id === 1) stage1(card);
    else if (id === 2) stage2(card);
    else if (id === 3) stage3(card);
    else if (id === 4) stage4(card);
    else if (id === 5) stage5(card);
    else if (id === 6) stage6(card);
  });

  // Cleanup on unload
  window.addEventListener('beforeunload', () => {
    ctx.revert();
  });
})();
