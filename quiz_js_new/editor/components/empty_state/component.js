// editor/components/empty_state/component.js

class EmptyStateComponent {

  constructor(element) {
    this._el          = element;
    this._btnLoad     = element.querySelector('#btn-es-load');
    this._btnFresh    = element.querySelector('#btn-es-fresh');
    this._btnResume   = element.querySelector('#btn-es-resume');
    this._errorEl     = element.querySelector('#es-load-error');
  }

  // ── Signals ──────────────────────────────────────────

  onLoad(fn) {
    this._btnLoad.addEventListener('click', fn);
  }

  onFresh(fn) {
    this._btnFresh.addEventListener('click', fn);
  }

  onResume(fn) {
    this._btnResume.addEventListener('click', fn);
  }

  // ── Visibility ───────────────────────────────────────

  show() {
    this._el.classList.remove('hidden');
  }

  hide() {
    this._el.classList.add('hidden');
  }

  // ── Draft button ─────────────────────────────────────

  showDraftButton() {
    this._btnResume.classList.remove('hidden');
  }

  hideDraftButton() {
    this._btnResume.classList.add('hidden');
  }

  // ── Error message ─────────────────────────────────────

  showError(msg) {
    this._errorEl.textContent = '⚠ ' + msg;
    this._errorEl.classList.remove('hidden');
  }

  hideError() {
    this._errorEl.textContent = '';
    this._errorEl.classList.add('hidden');
  }

}