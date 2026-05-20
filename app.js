/* ============================================================
   SIGPA · app.js
   Wizard Logic — State Management & Interactions
   ============================================================ */

'use strict';

// ─── Global State ─────────────────────────────────────────────
const STATE = {
  currentStep: 1,
  totalSteps:  5,

  // Paso 1
  selectedArea: null,       // 'comercial' | 'produccion' | 'servicio' | 'administrativa'
  selectedAreaLabel: null,

  // Paso 2
  selectedPeriod: null,     // 'semanal' | 'mensual' | 'trimestral'
  selectedPeriodDays: null, // 7 | 30 | 90
  selectedPeriodLabel: null,

  // Steps 3-5 (future)
  kpis: [],
  data: {},
  report: null,
};

// ─── Step metadata ─────────────────────────────────────────────
const STEPS_META = {
  1: {
    eyebrow:  'Paso 1 de 5 · Configuración',
    title:    'Seleccione el Área Evaluada',
    subtitle: 'Elija el área organizacional que desea analizar en este ciclo de evaluación.',
  },
  2: {
    eyebrow:  'Paso 2 de 5 · Horizonte Temporal',
    title:    'Defina el Periodo de Análisis',
    subtitle: 'Seleccione la frecuencia con la que se evaluarán los indicadores de desempeño.',
  },
  3: {
    eyebrow:  'Paso 3 de 5 · Indicadores',
    title:    'Definición de KPIs',
    subtitle: 'Configure los indicadores clave de rendimiento para el área y periodo seleccionados.',
  },
  4: {
    eyebrow:  'Paso 4 de 5 · Ingreso de Datos',
    title:    'Captura de Métricas',
    subtitle: 'Ingrese los valores reales del área durante el horizonte temporal configurado.',
  },
  5: {
    eyebrow:  'Paso 5 de 5 · Resultados',
    title:    'Informe Ejecutivo de Desempeño',
    subtitle: 'Análisis automático con diagnóstico inteligente y recomendaciones estratégicas.',
  },
};

// ─── DOM References ─────────────────────────────────────────────
const DOM = {
  eyebrow:      document.getElementById('step-eyebrow'),
  title:        document.getElementById('step-title'),
  subtitle:     document.getElementById('step-subtitle'),
  progressFill: document.getElementById('progress-fill'),
  btnBack:      document.getElementById('btn-back'),
  btnNext:      document.getElementById('btn-next'),
  navInfo:      document.getElementById('nav-info'),
  toast:        document.getElementById('toast'),
  toastMsg:     document.getElementById('toast-msg'),
};

// ─── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  bindAreaCards();
  bindPeriodCards();
  bindNavButtons();
  render();
});

// ─── Card binding: Paso 1 ──────────────────────────────────────
function bindAreaCards() {
  const areaLabels = {
    comercial:     'Comercial y Ventas',
    produccion:    'Producción y Operaciones',
    servicio:      'Servicio al Cliente y Soporte',
    administrativa: 'Administrativa y Talento Humano',
  };

  document.querySelectorAll('.area-card').forEach(card => {
    const area = card.dataset.area;

    const activate = () => {
      // Remove selection from all
      document.querySelectorAll('.area-card').forEach(c => c.classList.remove('selected'));
      // Select this one
      card.classList.add('selected');

      STATE.selectedArea      = area;
      STATE.selectedAreaLabel = areaLabels[area];

      showToast(`Área seleccionada: ${areaLabels[area]}`);
      updateNextButton();
    };

    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}

// ─── Card binding: Paso 2 ──────────────────────────────────────
function bindPeriodCards() {
  const periodLabels = {
    semanal:    'Evaluación Semanal (7 días)',
    mensual:    'Evaluación Mensual (30 días)',
    trimestral: 'Evaluación Trimestral (90 días)',
  };

  document.querySelectorAll('.period-card').forEach(card => {
    const period = card.dataset.period;
    const days   = parseInt(card.dataset.days, 10);

    const activate = () => {
      document.querySelectorAll('.period-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      STATE.selectedPeriod      = period;
      STATE.selectedPeriodDays  = days;
      STATE.selectedPeriodLabel = periodLabels[period];

      showToast(`Periodo seleccionado: ${periodLabels[period]}`);
      updateNextButton();
    };

    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
}

// ─── Navigation buttons ────────────────────────────────────────
function bindNavButtons() {
  DOM.btnNext.addEventListener('click', () => {
    if (!canAdvance()) return;
    if (STATE.currentStep < STATE.totalSteps) {
      goToStep(STATE.currentStep + 1);
    }
  });

  DOM.btnBack.addEventListener('click', () => {
    if (STATE.currentStep > 1) {
      goToStep(STATE.currentStep - 1);
    }
  });
}

// ─── Step navigation ───────────────────────────────────────────
function goToStep(targetStep) {
  const prevPanel = document.getElementById(`step-${STATE.currentStep}`);
  const nextPanel = document.getElementById(`step-${targetStep}`);

  if (!prevPanel || !nextPanel) return;

  // Hide current with reverse animation
  prevPanel.style.animation = 'none';
  prevPanel.classList.add('hidden');

  STATE.currentStep = targetStep;

  // Show next
  nextPanel.classList.remove('hidden');
  nextPanel.style.animation = '';

  render();
}

// ─── Render ────────────────────────────────────────────────────
function render() {
  const step = STATE.currentStep;
  const meta = STEPS_META[step];

  // Title block
  DOM.eyebrow.textContent  = meta.eyebrow;
  DOM.title.textContent    = meta.title;
  DOM.subtitle.textContent = meta.subtitle;

  // Progress bar
  const pct = (step / STATE.totalSteps) * 100;
  DOM.progressFill.style.width = `${pct}%`;

  // Step dots in progress track
  document.querySelectorAll('.progress-step').forEach(el => {
    const s = parseInt(el.dataset.step, 10);
    el.classList.remove('active', 'done');
    if (s === step)  el.classList.add('active');
    if (s < step)    el.classList.add('done');
  });

  // Nav dots
  DOM.navInfo.querySelectorAll('.nav-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i + 1 === step);
  });

  // Back button
  DOM.btnBack.disabled = step === 1;

  // Next button label
  if (step === STATE.totalSteps) {
    DOM.btnNext.innerHTML = `<span>Generar Informe</span><span class="btn-arrow">◈</span>`;
  } else {
    DOM.btnNext.innerHTML = `<span>Siguiente</span><span class="btn-arrow">→</span>`;
  }

  updateNextButton();

  // Log state (útil para debug y desarrollo)
  console.log('[SIGPA STATE]', JSON.stringify(STATE, null, 2));
}

// ─── Validation ────────────────────────────────────────────────
function canAdvance() {
  switch (STATE.currentStep) {
    case 1: return STATE.selectedArea !== null;
    case 2: return STATE.selectedPeriod !== null;
    default: return true;  // Steps 3-5 se habilitarán luego
  }
}

function updateNextButton() {
  const allowed = canAdvance();
  DOM.btnNext.disabled = !allowed;

  // Visual hint when disabled
  if (!allowed) {
    DOM.btnNext.style.opacity = '0.4';
  } else {
    DOM.btnNext.style.opacity = '1';
  }
}

// ─── Toast notification ────────────────────────────────────────
let toastTimer = null;

function showToast(message) {
  DOM.toastMsg.textContent = message;
  DOM.toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    DOM.toast.classList.remove('show');
  }, 2600);
}

// ─── Public API (accesible desde consola para debug) ───────────
window.SIGPA = {
  getState: () => ({ ...STATE }),
  goToStep,
  showToast,
};
