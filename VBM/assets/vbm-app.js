/* ═══════════════════════════════════════════════════════
   VBM KAIZEN — Application JS
   Vale Base Metals Design System v1.0
═══════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ── Sidebar Toggle ── */
  function initSidebar() {
    const toggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });
    if (overlay) {
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('show');
      });
    }
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
      }
    });
  }

  /* ── Active Nav Link ── */
  function initActiveNav() {
    const links = document.querySelectorAll('.sidebar-link');
    const current = window.location.pathname.split('/').pop() || 'index.html';
    links.forEach(function(link) {
      const href = link.getAttribute('href');
      if (href && (href === current || href.includes(current.split('.')[0]))) {
        link.classList.add('active');
      }
    });
  }

  /* ── Animated Stats Counter ── */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target || el.textContent) || 0;
    const duration = 1400;
    const start = performance.now();
    const isDecimal = String(target).includes('.');

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = isDecimal ? current.toFixed(1) : Math.round(current).toLocaleString('pt-BR');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function initCounters() {
    const els = document.querySelectorAll('[data-counter]');
    if (!els.length) return;
    const obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          animateCounter(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    els.forEach(function(el) { obs.observe(el); });
  }

  /* ── Reveal on Scroll ── */
  function initReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-scale');
    if (!els.length) return;
    const obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          // stagger siblings
          const siblings = e.target.parentElement ? e.target.parentElement.querySelectorAll('.reveal, .reveal-left, .reveal-scale') : [];
          let delay = 0;
          siblings.forEach(function(s, i) { if (s === e.target) delay = i * 60; });
          setTimeout(function() { e.target.classList.add('visible'); }, delay);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    els.forEach(function(el) { obs.observe(el); });
  }

  /* ── Modals ── */
  function initModals() {
    // Open triggers
    document.querySelectorAll('[data-modal-open]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const id = btn.dataset.modalOpen;
        openModal(id);
      });
    });
    // Close triggers
    document.querySelectorAll('[data-modal-close], .modal-close').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const backdrop = btn.closest('.modal-backdrop');
        if (backdrop) closeModal(backdrop.id);
      });
    });
    // Click outside
    document.querySelectorAll('.modal-backdrop').forEach(function(bd) {
      bd.addEventListener('click', function(e) {
        if (e.target === bd) closeModal(bd.id);
      });
    });
    // Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(function(m) {
          closeModal(m.id);
        });
      }
    });
  }

  window.openModal = function(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
  };
  window.closeModal = function(id) {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
  };

  /* ── Tabs ── */
  function initTabs() {
    document.querySelectorAll('[data-tab-group]').forEach(function(group) {
      const tabs = group.querySelectorAll('.app-tab');
      const panels = group.querySelectorAll('.tab-content');
      tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          const target = tab.dataset.tab;
          tabs.forEach(function(t) { t.classList.remove('active'); });
          panels.forEach(function(p) { p.classList.remove('active'); });
          tab.classList.add('active');
          const panel = group.querySelector('[data-tab-panel="' + target + '"]');
          if (panel) panel.classList.add('active');
        });
      });
    });
  }

  /* ── Wizard / Multi-step ── */
  function initWizard() {
    const wizards = document.querySelectorAll('[data-wizard]');
    wizards.forEach(function(wizard) {
      let currentStep = 0;
      const steps = wizard.querySelectorAll('.wizard-step-item');
      const panels = wizard.querySelectorAll('.wizard-panel');
      const prevBtns = wizard.querySelectorAll('[data-wizard-prev]');
      const nextBtns = wizard.querySelectorAll('[data-wizard-next]');
      const submitBtn = wizard.querySelector('[data-wizard-submit]');
      const progressBar = wizard.querySelector('.wizard-progress-fill');

      function goTo(n) {
        if (n < 0 || n >= panels.length) return;
        panels[currentStep].classList.remove('active');
        steps[currentStep].classList.remove('active');
        if (n > currentStep) steps[currentStep].classList.add('completed');
        else steps[n].classList.remove('completed');
        currentStep = n;
        panels[currentStep].classList.add('active');
        steps[currentStep].classList.add('active');
        updateProgress();
        wizard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      function updateProgress() {
        if (progressBar) {
          const pct = ((currentStep) / (panels.length - 1)) * 100;
          progressBar.style.width = pct + '%';
        }
        // Show/hide prev/next/submit
        prevBtns.forEach(function(b) { b.style.display = currentStep === 0 ? 'none' : ''; });
        if (submitBtn) submitBtn.style.display = currentStep === panels.length - 1 ? '' : 'none';
        nextBtns.forEach(function(b) { b.style.display = currentStep === panels.length - 1 ? 'none' : ''; });
      }

      prevBtns.forEach(function(b) {
        b.addEventListener('click', function() { goTo(currentStep - 1); });
      });
      nextBtns.forEach(function(b) {
        b.addEventListener('click', function() { goTo(currentStep + 1); });
      });
      if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
          e.preventDefault();
          showToast('success', 'Kaizen Salvo!', 'Seu Kaizen foi enviado para aprovação com sucesso.');
          setTimeout(function() { window.location.href = 'meus-projetos.html'; }, 1800);
        });
      }

      // Step click navigation
      steps.forEach(function(step, i) {
        step.addEventListener('click', function() {
          if (i < currentStep || steps[i].classList.contains('completed')) goTo(i);
        });
      });

      goTo(0);
    });
  }

  /* ── PNR28 Type Selector ── */
  function initPNR() {
    document.querySelectorAll('.pnr-item').forEach(function(item) {
      item.addEventListener('click', function() {
        const group = item.closest('.pnr-grid');
        if (group) group.querySelectorAll('.pnr-item').forEach(function(i) { i.classList.remove('selected'); });
        item.classList.add('selected');
        const input = item.closest('[data-pnr-group]');
        if (input) {
          const hidden = input.querySelector('input[type=hidden]');
          if (hidden) hidden.value = item.dataset.value || item.querySelector('.pnr-label').textContent;
        }
      });
    });
  }

  /* ── Photo Preview ── */
  function initPhotoUpload() {
    document.querySelectorAll('.photo-upload-zone').forEach(function(zone) {
      const input = zone.querySelector('input[type=file]');
      const preview = zone.nextElementSibling;
      if (!input) return;
      input.addEventListener('change', function() {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
          if (preview && preview.classList.contains('photo-preview-img')) {
            preview.src = e.target.result;
            preview.style.display = 'block';
            zone.style.display = 'none';
          }
        };
        reader.readAsDataURL(file);
      });
    });
  }

  /* ── Filter / Search ── */
  function initFilters() {
    const filterInputs = document.querySelectorAll('[data-filter-input]');
    filterInputs.forEach(function(input) {
      const targetId = input.dataset.filterInput;
      const target = document.getElementById(targetId);
      if (!target) return;
      input.addEventListener('input', function() {
        const q = input.value.toLowerCase().trim();
        target.querySelectorAll('[data-filter-item]').forEach(function(item) {
          const text = item.textContent.toLowerCase();
          item.style.display = q && !text.includes(q) ? 'none' : '';
        });
      });
    });

    const filterSelects = document.querySelectorAll('[data-filter-select]');
    filterSelects.forEach(function(sel) {
      const targetId = sel.dataset.filterSelect;
      const field = sel.dataset.filterField || 'status';
      const target = document.getElementById(targetId);
      if (!target) return;
      sel.addEventListener('change', function() {
        const val = sel.value;
        target.querySelectorAll('[data-filter-item]').forEach(function(item) {
          if (!val) { item.style.display = ''; return; }
          item.style.display = item.dataset[field] === val ? '' : 'none';
        });
      });
    });
  }

  /* ── View Toggle (grid/list) ── */
  function initViewToggle() {
    document.querySelectorAll('[data-view-toggle]').forEach(function(btn) {
      btn.addEventListener('click', function() {
        const group = btn.dataset.viewToggle;
        const view = btn.dataset.view;
        document.querySelectorAll('[data-view-toggle="' + group + '"]').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
        document.querySelectorAll('[data-view="' + group + '"]').forEach(function(el) {
          el.style.display = el.dataset.viewMode === view ? '' : 'none';
        });
      });
    });
  }

  /* ── Toggle Switch ── */
  function initToggles() {
    document.querySelectorAll('.toggle').forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        toggle.classList.toggle('on');
      });
    });
  }

  /* ── Toast Notifications ── */
  window.showToast = function(type, title, msg, duration) {
    duration = duration || 4000;
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    const colors = { success: '#16a34a', error: '#dc2626', warning: '#c2770e', info: '#3cb5e5' };
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.innerHTML = '<i class="fa-solid ' + (icons[type] || 'fa-circle-info') + ' toast-icon" style="color:' + (colors[type] || '#3cb5e5') + '"></i><div class="toast-body"><div class="toast-title">' + title + '</div><div class="toast-msg">' + msg + '</div></div><button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#aaa;font-size:0.9rem;padding:0;line-height:1;flex-shrink:0;align-self:flex-start;"><i class="fa-solid fa-xmark"></i></button>';
    container.appendChild(toast);
    setTimeout(function() { if (toast.parentElement) toast.remove(); }, duration);
  };

  /* ── Print A4 Kaizen ── */
  window.printKaizen = function(id) {
    const el = document.getElementById(id || 'printArea');
    if (!el) { window.print(); return; }
    const clone = el.cloneNode(true);
    const win = window.open('', '_blank');
    win.document.write('<html><head><title>Kaizen VBM</title><link rel="stylesheet" href="assets/vbm-app.css"/></head><body style="background:#fff;padding:20px;">' + clone.outerHTML + '</body></html>');
    win.document.close();
    win.focus();
    setTimeout(function() { win.print(); }, 600);
  };

  /* ── Approval workflow ── */
  function initApproval() {
    document.querySelectorAll('.approval-item').forEach(function(item) {
      item.addEventListener('click', function() {
        document.querySelectorAll('.approval-item').forEach(function(i) { i.classList.remove('selected'); });
        item.classList.add('selected');
        const detailPanel = document.getElementById('approvalDetail');
        if (detailPanel) {
          detailPanel.style.display = 'block';
          detailPanel.classList.add('visible');
        }
      });
    });
  }

  /* ── Admin CRUD helpers ── */
  window.deleteAdminItem = function(btn, confirmMsg) {
    if (!confirm(confirmMsg || 'Confirma a exclusão?')) return;
    const row = btn.closest('.admin-item');
    if (row) row.remove();
    showToast('success', 'Removido', 'Item excluído com sucesso.');
  };

  /* ── Init AOS if available ── */
  function initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({ duration: 500, easing: 'ease', once: true, offset: 50 });
    }
  }

  /* ── DOM Ready ── */
  document.addEventListener('DOMContentLoaded', function() {
    initSidebar();
    initActiveNav();
    initCounters();
    initReveal();
    initModals();
    initTabs();
    initWizard();
    initPNR();
    initPhotoUpload();
    initFilters();
    initViewToggle();
    initToggles();
    initApproval();
    initAOS();
  });

})();
