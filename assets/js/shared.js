/* ═══════════════════════════════════════════════════════════════════
 * Kive Apps — Shared interactive utilities
 * - Scroll-reveal observer
 * - Nav scroll behavior
 * - Mobile menu
 * - Reusable success modal
 * - Confetti burst
 * - Copy-to-clipboard with ripple animation
 * ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────────────
  // Scroll-reveal animations
  // ─────────────────────────────────────────────────────────────────
  function initReveal() {
    const targets = document.querySelectorAll('.rv,.rv-left,.rv-right,.rv-scale,.fi');
    if (!targets.length) return;
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('show'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('show');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -60px 0px' }
    );
    targets.forEach((el) => io.observe(el));
  }

  // ─────────────────────────────────────────────────────────────────
  // Nav scroll state (adds .scrolled when user scrolls > 8px)
  // ─────────────────────────────────────────────────────────────────
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ─────────────────────────────────────────────────────────────────
  // Mobile menu toggle
  // ─────────────────────────────────────────────────────────────────
  function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (menu.classList.contains('open') && !menu.contains(e.target) && e.target !== toggle) {
        menu.classList.remove('open');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // Confetti burst (canvas-free, pure DOM, lightweight)
  // ─────────────────────────────────────────────────────────────────
  function confettiBurst(opts) {
    opts = opts || {};
    const count = opts.count || 60;
    const colors = opts.colors || ['#4DB6AC', '#F5C842', '#D4843A', '#ffffff', '#38A09A'];
    const container = document.createElement('div');
    container.className = 'kk-confetti';
    document.body.appendChild(container);
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'kk-confetto';
      const size = 6 + Math.random() * 8;
      p.style.background = colors[i % colors.length];
      p.style.width = size + 'px';
      p.style.height = size * 0.4 + 'px';
      p.style.left = 50 + (Math.random() - 0.5) * 30 + 'vw';
      p.style.top = '40vh';
      const angle = (Math.random() - 0.5) * Math.PI * 1.4;
      const velocity = 280 + Math.random() * 280;
      const tx = Math.sin(angle) * velocity;
      const ty = -Math.abs(Math.cos(angle)) * velocity * 0.7;
      const rot = (Math.random() - 0.5) * 720;
      p.style.setProperty('--tx', tx + 'px');
      p.style.setProperty('--ty', ty + 'px');
      p.style.setProperty('--rot', rot + 'deg');
      p.style.animationDelay = Math.random() * 0.15 + 's';
      p.style.animationDuration = 1.4 + Math.random() * 0.7 + 's';
      container.appendChild(p);
    }
    setTimeout(() => container.remove(), 2400);
  }

  // ─────────────────────────────────────────────────────────────────
  // Success modal
  //   showSuccessModal({title, message, ctaText, ctaHref, onClose, confetti})
  // ─────────────────────────────────────────────────────────────────
  function showSuccessModal(o) {
    o = o || {};
    const overlay = document.createElement('div');
    overlay.className = 'kk-modal-overlay';
    overlay.innerHTML = `
      <div class="kk-modal" role="dialog" aria-modal="true" aria-labelledby="kk-modal-title">
        <button class="kk-modal-close" aria-label="Close">&times;</button>
        <div class="kk-modal-check">
          <svg viewBox="0 0 52 52" aria-hidden="true">
            <circle class="kk-check-circle" cx="26" cy="26" r="24" fill="none"/>
            <path class="kk-check-tick" fill="none" d="M14 27 l8 8 l16 -16"/>
          </svg>
        </div>
        <h3 class="kk-modal-title" id="kk-modal-title">${o.title || 'Done!'}</h3>
        <p class="kk-modal-msg">${o.message || ''}</p>
        ${
          o.ctaText
            ? `<a class="btn btn-primary kk-modal-cta" ${
                o.ctaHref ? `href="${o.ctaHref}"` : 'href="#"'
              }>${o.ctaText}</a>`
            : ''
        }
      </div>
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const close = () => {
      overlay.classList.remove('show');
      setTimeout(() => {
        overlay.remove();
        if (typeof o.onClose === 'function') o.onClose();
      }, 300);
    };
    overlay.querySelector('.kk-modal-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener(
      'keydown',
      function esc(ev) {
        if (ev.key === 'Escape') {
          close();
          document.removeEventListener('keydown', esc);
        }
      }
    );
    if (o.confetti) setTimeout(() => confettiBurst(), 220);
    return close;
  }

  // ─────────────────────────────────────────────────────────────────
  // Copy-to-clipboard helper (with ripple on the trigger button)
  // ─────────────────────────────────────────────────────────────────
  function copyToClipboard(text, btn, opts) {
    opts = opts || {};
    const original = btn ? btn.textContent : null;
    const done = () => {
      if (btn) {
        btn.classList.add('ok');
        btn.textContent = opts.successLabel || 'Copied!';
        rippleAt(btn);
        setTimeout(() => {
          btn.classList.remove('ok');
          btn.textContent = original;
        }, opts.resetMs || 2200);
      }
      if (typeof opts.onSuccess === 'function') opts.onSuccess();
    };
    const fail = () => {
      if (btn) btn.textContent = 'Copy failed';
      if (typeof opts.onError === 'function') opts.onError();
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fail);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          done();
        } catch (e) {
          fail();
        }
        document.body.removeChild(ta);
      }
    } catch (e) {
      fail();
    }
  }

  function rippleAt(btn) {
    const r = document.createElement('span');
    r.className = 'kk-ripple';
    btn.appendChild(r);
    setTimeout(() => r.remove(), 700);
  }

  // ─────────────────────────────────────────────────────────────────
  // Anti-tamper: lightweight devtools detection (informational only)
  // Not security; just discourages casual snooping.
  // ─────────────────────────────────────────────────────────────────
  function initDevtoolsBeacon() {
    // No-op for now. Real security is encryption + path obfuscation.
  }

  // ─────────────────────────────────────────────────────────────────
  // Boot
  // ─────────────────────────────────────────────────────────────────
  function boot() {
    initNav();
    initMobileMenu();
    initReveal();
    initDevtoolsBeacon();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // Expose on global for inline page scripts
  window.KK = {
    showSuccessModal: showSuccessModal,
    confettiBurst: confettiBurst,
    copyToClipboard: copyToClipboard,
  };
})();
