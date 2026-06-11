// components/operator_form/component.js

class OperatorFormComponent {

  constructor() {
    this.el          = null;
    this._slotsEl    = null;
    this._previewEl  = null;
    this._applyBtn   = null;
    this._feedbackEl = null;
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
    this.el.innerHTML  = '';
    this._emptyEl      = this._buildEmptyState();
    this._formBodyEl   = this._buildFormBody();
    this.el.appendChild(this._emptyEl);
    this.el.appendChild(this._formBodyEl);
  }

  // ── private builders ──────────────────────────────────────────────────────

  _buildEmptyState() {
    const el = document.createElement('div');
    el.className = 'op-form__empty';
    el.innerHTML = `
      <span class="op-form__empty-icon">←</span>
      <span>Select an operator<br>from the Operators tab</span>
    `;
    return el;
  }

  _buildFormBody() {
    const el = document.createElement('div');
    el.className    = 'op-form__body';
    el.style.display = 'none';
    el.innerHTML = `
      <div class="op-form__op-header">
        <div class="op-form__op-sym"  id="op-form-sym"></div>
        <div>
          <div class="op-form__op-name" id="op-form-name"></div>
          <div class="op-form__op-sub"  id="op-form-sub"></div>
        </div>
      </div>
      <div class="op-form__section-label">Operand slots</div>
      <div class="op-form__hint">Click a slot, then click a pill from Atoms or Working Set</div>
      <div class="op-form__slots"   id="op-form-slots"></div>
      <div class="op-form__section-label">Preview</div>
      <div class="op-form__preview" id="op-form-preview">—</div>
      <div class="op-form__section-label">Save to Working Set</div>
    `;

    this._slotsEl   = el.querySelector('#op-form-slots');
    this._previewEl = el.querySelector('#op-form-preview');

    const applyRow      = this._buildApplyRow();
    this._applyBtn      = applyRow.querySelector('.op-form__apply-btn');
    this._feedbackEl    = applyRow.querySelector('.op-form__feedback');
    el.appendChild(applyRow);

    return el;
  }

  _buildApplyRow() {
    const row = document.createElement('div');
    row.className = 'op-form__save-row';
    row.innerHTML = `
      <button class="op-form__apply-btn" id="op-form-apply-btn">Apply</button>
      <div class="op-form__feedback"></div>
    `;
    row.querySelector('.op-form__apply-btn')
      .addEventListener('click', () => this.emitApply());
    return row;
  }

  _buildSlotEl(slot, index, slotLabels) {
    const el = document.createElement('div');
    el.className = 'op-form__slot'
      + (slot.active ? ' op-form__slot--active' : '')
      + (slot.value  ? ' op-form__slot--filled'  : '');

    const numEl = document.createElement('span');
    numEl.className   = 'op-form__slot-num';
    numEl.textContent = index + 1;

    const labelEl = document.createElement('span');
    labelEl.className = 'op-form__slot-label';
    labelEl.textContent = slotLabels[index] ;

    const valEl = document.createElement('span');
    valEl.className = 'op-form__slot-val';
    if (slot.value) {
      valEl.innerHTML = slot.value.getPreview();
    } else {
      valEl.textContent = '';
    }

    const hintEl = document.createElement('span');
    hintEl.className   = 'op-form__slot-hint';
    hintEl.textContent = slot.value ? 'filled' : 'click to activate';

    el.appendChild(numEl);
    el.appendChild(labelEl);
    el.appendChild(valEl);
    el.appendChild(hintEl);

    if (slot.value) {
      const clearBtn = document.createElement('span');
      clearBtn.className   = 'op-form__slot-clear';
      clearBtn.textContent = '✕';
      clearBtn.addEventListener('click', () => this.emitSlotClear(index));
      el.appendChild(clearBtn);
    }

    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('op-form__slot-clear')) return;
      this.emitSlotClick(index);
    });

    return el;
  }

  // ── public API ────────────────────────────────────────────────────────────

  showEmpty() {
    this._emptyEl.style.display    = 'flex';
    this._formBodyEl.style.display = 'none';
  }

  renderSlots(slots, slotLabels = []) {
    this._emptyEl.style.display    = 'none';
    this._formBodyEl.style.display = 'flex';
    this._slotsEl.innerHTML        = '';
    slots.forEach((slot, i) => {
      this._slotsEl.appendChild(this._buildSlotEl(slot, i, slotLabels));
    });
  }

  setSlotActive(index) {
    this._slotsEl.querySelectorAll('.op-form__slot').forEach((s, i) => {
      s.classList.toggle('op-form__slot--active', i === index);
    });
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

  showFeedback(msg) {
    this._feedbackEl.textContent = msg;
    setTimeout(() => { this._feedbackEl.textContent = ''; }, 2200);
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