// editor/components/topbar/component.js

class TopbarComponent {

  constructor(element) {
    this._el             = element;
    this._btnAddQuestion = element.querySelector('#btn-add-question');
    this._btnLoadJson    = element.querySelector('#btn-load-json');
    this._btnExportJson  = element.querySelector('#btn-export-json');
    this._fileInput      = document.getElementById('file-input');
  }

  // ── Signals ──────────────────────────────────────────

  onAddQuestion(fn) {
    this._btnAddQuestion.addEventListener('click', fn);
  }

  onLoadJson(fn) {
    this._btnLoadJson.addEventListener('click', fn);
  }

  onExportJson(fn) {
    this._btnExportJson.addEventListener('click', fn);
  }

  onFileSelected(fn) {
    this._fileInput.addEventListener('change', fn, { once: true });
  }

  // ── UI state ─────────────────────────────────────────

  disableAddQuestion() {
    this._btnAddQuestion.disabled = true;
  }

  enableAddQuestion() {
    this._btnAddQuestion.disabled = false;
  }

  // ── File picker ──────────────────────────────────────

  openFilePicker() {
    this._fileInput.value = '';
    this._fileInput.click();
  }

  getSelectedFile() {
    return this._fileInput.files[0] || null;
  }

}