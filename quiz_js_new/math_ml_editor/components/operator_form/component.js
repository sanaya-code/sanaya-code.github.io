// components/operator_form/component.js

class OperatorFormComponent {

  constructor() {
    this.el          = null;
    this._slotsEl    = null;
    this._previewEl  = null;
    this._saveInput  = null;
    this._applyBtn   = null;
    this._emptyEl    = null;
    this._formBodyEl = null;
  }

  // ── build ─────────────────────────────────────────────────────────────────

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'op-form';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML = '';

    // empty state
    this._emptyEl = document.createElement('div');
    this._emptyEl.className = 'op-form__empty';
    this._emptyEl.innerHTML = `
      <span class="op-form__empty-icon">←</span>
      <span>Select an operator<br>from the Operators tab</span>
    `;

    // form body
    this._formBodyEl = document.createElement('div');
    this._formBodyEl.className = 'op-form__body';
    this._formBodyEl.style.display = 'none';
    this._formBodyEl.innerHTML = `
      <div class="op-form__op-header">
        <div class="op-form__op-sym" id="op-form-sym"></div>
        <div>
          <div class="op-form__op-name" id="op-form-name"></div>
          <div class="op-form__op-sub"  id="op-form-sub"></div>
        </div>
      </div>

      <div class="op-form__section-label">Operand slots</div>
      <div class="op-form__hint">Click a slot, then click a pill from List A or B</div>
      <div class="op-form__slots" id="op-form-slots"></div>

      <div class="op-form__section-label">Preview</div>
      <div class="op-form__preview" id="op-form-preview">—</div>

      <div class="op-form__section-label">Save to Working Set</div>
      <div class="op-form__save-row">
        <input class="op-form__save-input" id="op-form-save-input"
               type="text" placeholder="Name this expression…" />
        <button class="op-form__apply-btn" id="op-form-apply-btn">Apply</button>
      </div>
      <div class="op-form__feedback" id="op-form-feedback"></div>
    `;

    this._slotsEl   = this._formBodyEl.querySelector('#op-form-slots');
    this._previewEl = this._formBodyEl.querySelector('#op-form-preview');
    this._saveInput = this._formBodyEl.querySelector('#op-form-save-input');
    this._applyBtn  = this._formBodyEl.querySelector('#op-form-apply-btn');

    this._applyBtn.addEventListener('click', () => this.emitApply());
    this._saveInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.emitApply();
    });

    this.el.appendChild(this._emptyEl);
    this.el.appendChild(this._formBodyEl);
  }

  // ── public API ────────────────────────────────────────────────────────────

  showEmpty() {
    this._emptyEl.style.display    = 'flex';
    this._formBodyEl.style.display = 'none';
  }

  renderSlots(slots) {
    this._emptyEl.style.display    = 'none';
    this._formBodyEl.style.display = 'flex';

    this._slotsEl.innerHTML = '';
    slots.forEach((slot, i) => {
      const el = document.createElement('div');
      el.className = 'op-form__slot'
        + (slot.active  ? ' op-form__slot--active'   : '')
        + (slot.value && slot.src === 'a' ? ' op-form__slot--filled-a' : '')
        + (slot.value && slot.src === 'b' ? ' op-form__slot--filled-b' : '');

      el.innerHTML = `
        <span class="op-form__slot-num">${i + 1}</span>
        <span class="op-form__slot-val">${slot.value ? slot.value.name : 'empty'}</span>
        <span class="op-form__slot-hint">${slot.value ? 'List ' + (slot.src === 'a' ? 'A' : 'B') : 'click to activate'}</span>
        ${slot.value ? `<span class="op-form__slot-clear" data-index="${i}">✕</span>` : ''}
      `;

      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('op-form__slot-clear')) return;
        this.emitSlotClick(i);
      });

      const clearBtn = el.querySelector('.op-form__slot-clear');
      if (clearBtn) {
        clearBtn.addEventListener('click', () => this.emitSlotClear(i));
      }

      this._slotsEl.appendChild(el);
    });
  }

  setSlotFilled(index, item, src) {
    const slots = this._slotsEl.querySelectorAll('.op-form__slot');
    if (!slots[index]) return;
    const s = slots[index];
    s.className = 'op-form__slot ' + (src === 'a' ? 'op-form__slot--filled-a' : 'op-form__slot--filled-b');
    s.querySelector('.op-form__slot-val').textContent  = item.name;
    s.querySelector('.op-form__slot-hint').textContent = 'List ' + (src === 'a' ? 'A' : 'B');
  }

  setSlotActive(index) {
    this._slotsEl.querySelectorAll('.op-form__slot').forEach((s, i) => {
      s.classList.toggle('op-form__slot--active', i === index);
    });
  }

  setSlotEmpty(index) {
    const slots = this._slotsEl.querySelectorAll('.op-form__slot');
    if (!slots[index]) return;
    const s = slots[index];
    s.className = 'op-form__slot';
    s.querySelector('.op-form__slot-val').textContent  = 'empty';
    s.querySelector('.op-form__slot-hint').textContent = 'click to activate';
  }

  updatePreview(exprHtml) {
    this._previewEl.innerHTML = exprHtml;
  }

  setOperatorHeader(sym, name, arity) {
    this._formBodyEl.querySelector('#op-form-sym').textContent  = sym;
    this._formBodyEl.querySelector('#op-form-name').textContent = name;
    this._formBodyEl.querySelector('#op-form-sub').textContent  =
      `${arity} operand${arity > 1 ? 's' : ''}`;
  }

  setApplyEnabled(enabled) {
    this._applyBtn.disabled = !enabled;
  }

  getSaveName() {
    return this._saveInput.value.trim();
  }

  clearSaveName() {
    this._saveInput.value = '';
  }

  showFeedback(msg) {
    const fb = this._formBodyEl.querySelector('#op-form-feedback');
    fb.textContent = msg;
    setTimeout(() => { fb.textContent = ''; }, 2200);
  }

  // ── emit ──────────────────────────────────────────────────────────────────

  emitSlotClick(index) {
    this.el.dispatchEvent(new CustomEvent('op-form:slot-click', {
      bubbles: true, detail: { index }
    }));
  }

  emitSlotClear(index) {
    this.el.dispatchEvent(new CustomEvent('op-form:slot-clear', {
      bubbles: true, detail: { index }
    }));
  }

  emitApply() {
    this.el.dispatchEvent(new CustomEvent('op-form:apply', { bubbles: true }));
  }

}