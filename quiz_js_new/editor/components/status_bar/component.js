// editor/components/status_bar/component.js

class StatusBarComponent {

  constructor(element) {
    this._el        = element;
    this._timeoutId = null;
  }

  // ── Show ─────────────────────────────────────────────

  show(message, type = 'success', duration = 1800) {
    const icons = {
      success: '✓',
      info:    'ℹ',
      warning: '⚠',
      error:   '✕',
    };
    const icon = icons[type] || icons.info;

    this._el.innerHTML = `<span class="sb-icon">${icon}</span><span class="sb-message">${message}</span>`;

    this._el.classList.remove(
      'hidden', 'visible',
      'sb-success', 'sb-info', 'sb-warning', 'sb-error'
    );
    this._el.classList.add('sb-' + type);

    // Force reflow so the transition reliably triggers
    requestAnimationFrame(() => this._el.classList.add('visible'));

    if (this._timeoutId) clearTimeout(this._timeoutId);
    this._timeoutId = setTimeout(() => {
      this._el.classList.remove('visible');
      setTimeout(() => this._el.classList.add('hidden'), 250);
    }, duration);
  }

}