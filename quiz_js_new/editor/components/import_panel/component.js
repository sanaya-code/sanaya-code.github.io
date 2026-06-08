// editor/components/import_panel/component.js

class ImportPanelComponent {

  constructor(element) {
    this._el       = element;
    this._questions = [];
    this._selected  = new Set(); // indices of selected questions
  }

  // ── Public API ───────────────────────────────────────

  show(questions) {
    this._questions = questions;
    this._selected  = new Set();
    this._render();
    this._el.classList.remove('hidden');
  }

  hide() {
    this._el.classList.add('hidden');
    this._el.innerHTML = '';
    this._questions = [];
    this._selected  = new Set();
  }

  getSelectedQuestions() {
    return Array.from(this._selected).map(i => this._questions[i]);
  }

  // ── Signal bindings ──────────────────────────────────

  onConfirm(fn) {
    this._el.addEventListener('import-confirmed', fn);
  }

  onCancel(fn) {
    this._el.addEventListener('import-cancelled', fn);
  }

  // ── Render ───────────────────────────────────────────

  _render() {
    this._el.innerHTML = `
      <div class="ip-backdrop"></div>
      <div class="ip-panel">
        <div class="ip-header">
          <div class="ip-header-left">
            <span class="ip-title">Import Questions</span>
            <span class="ip-count" id="ip-count">0 selected</span>
          </div>
          <div class="ip-header-right">
            <button class="ip-btn-select-all" id="ip-btn-select-all">Select All</button>
            <button class="ip-btn-cancel" id="ip-btn-cancel">Cancel</button>
            <button class="ip-btn-add" id="ip-btn-add" disabled>Add Selected</button>
          </div>
        </div>
        <div class="ip-list" id="ip-list">
          ${this._questions.length === 0
            ? '<div class="ip-empty">No questions found in this file.</div>'
            : this._questions.map((q, i) => this._cardHTML(q, i)).join('')
          }
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _cardHTML(q, index) {
    const isSkip     = q.type === 'skip';
    const typeConf   = isSkip ? null : EditorFormRegistry.getType(q.type);
    const badgeColor = typeConf ? typeConf.color : '#7f8c8d';
    const badgeLabel = isSkip ? 'SKIP' : (typeConf ? typeConf.label : q.type);
    const rawText    = (q.question || '').replace(/<[^>]*>/g, '').trim();

    return `
      <div class="ip-card" data-index="${index}">
        <div class="ip-card-check" data-index="${index}">
          <span class="ip-checkmark">✓</span>
        </div>
        <div class="ip-card-body">
          <div class="ip-card-top">
            <span class="ip-badge" style="${isSkip ? 'background:#7f8c8d' : `background:${badgeColor}`}">
              ${badgeLabel}
            </span>
            <span class="ip-card-num">#${String(index + 1).padStart(3, '0')}</span>
          </div>
          <div class="ip-card-text ${!rawText ? 'empty' : ''}">
            ${rawText || 'Untitled question'}
          </div>
        </div>
      </div>
    `;
  }

  // ── Events ───────────────────────────────────────────

  _bindEvents() {
    // Card click — toggle selection
    this._el.querySelector('#ip-list')
      ?.addEventListener('click', (e) => {
        const card = e.target.closest('.ip-card');
        if (!card) return;
        const index = parseInt(card.dataset.index);
        if (this._selected.has(index)) {
          this._selected.delete(index);
          card.classList.remove('selected');
        } else {
          this._selected.add(index);
          card.classList.add('selected');
        }
        this._updateHeader();
      });

    // Select all / deselect all toggle
    this._el.querySelector('#ip-btn-select-all')
      ?.addEventListener('click', () => {
        if (this._selected.size === this._questions.length) {
          // Deselect all
          this._selected.clear();
          this._el.querySelectorAll('.ip-card')
            .forEach(c => c.classList.remove('selected'));
        } else {
          // Select all
          this._questions.forEach((_, i) => this._selected.add(i));
          this._el.querySelectorAll('.ip-card')
            .forEach(c => c.classList.add('selected'));
        }
        this._updateHeader();
      });

    // Cancel
    this._el.querySelector('#ip-btn-cancel')
      ?.addEventListener('click', () => {
        this._el.dispatchEvent(new CustomEvent('import-cancelled', { bubbles: true }));
      });

    // Backdrop click — cancel
    this._el.querySelector('.ip-backdrop')
      ?.addEventListener('click', () => {
        this._el.dispatchEvent(new CustomEvent('import-cancelled', { bubbles: true }));
      });

    // Add selected
    this._el.querySelector('#ip-btn-add')
      ?.addEventListener('click', () => {
        if (this._selected.size === 0) return;
        this._el.dispatchEvent(new CustomEvent('import-confirmed', {
          bubbles: true,
          detail: { questions: this.getSelectedQuestions() },
        }));
      });
  }

  _updateHeader() {
    const count   = this._selected.size;
    const total   = this._questions.length;
    const countEl = this._el.querySelector('#ip-count');
    const addBtn  = this._el.querySelector('#ip-btn-add');
    const selBtn  = this._el.querySelector('#ip-btn-select-all');

    if (countEl) countEl.textContent = `${count} selected`;
    if (addBtn)  addBtn.disabled = count === 0;
    if (selBtn)  selBtn.textContent =
      count === total && total > 0 ? 'Deselect All' : 'Select All';
  }

}