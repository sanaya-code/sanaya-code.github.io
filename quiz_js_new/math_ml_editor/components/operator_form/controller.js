// components/operator_form/controller.js

class OperatorFormController {

  constructor(mountEl) {
    this.component    = new OperatorFormComponent();
    this.mountEl      = mountEl;
    this._operator    = null;
    this._slots       = [];
    this._activeSlot  = null;
  }

  // ── setup ─────────────────────────────────────────────────────────────────

  mount() {
    this.component.createElement();
    this.component.buildLayout();
    this.mountEl.appendChild(this.component.el);
    this.component.showEmpty();
  }

  // ── event binding ─────────────────────────────────────────────────────────

  bindEvents(onSlotClick, onSlotClear, onApply) {
    this.component.el.addEventListener('op-form:slot-click', (e) => onSlotClick(e.detail.index));
    this.component.el.addEventListener('op-form:slot-clear', (e) => onSlotClear(e.detail.index));
    this.component.el.addEventListener('op-form:apply',      ()  => onApply());
  }

  // ── called by app / event handlers ───────────────────────────────────────

  reset(operator) {
    this._operator   = operator;
    this._slots      = Array(operator.arity).fill(null).map(() => ({ value: null, src: null, active: false }));
    this._activeSlot = null;
    this.component.setOperatorHeader(operator.sym, operator.name, operator.arity);
    this.component.renderSlots(this._slots);
    this.component.setApplyEnabled(false);
    this.component.clearSaveName();
  }

  fillSlot(index, item) {
    if (!this._slots[index]) return;
    this._slots[index].value  = item;
    this._slots[index].src    = item.src;
    this._slots[index].active = false;

    // auto-advance to next empty slot
    const next = this._slots.findIndex((s, i) => i > index && !s.value);
    this._activeSlot = next >= 0 ? next : null;

    this._rerenderSlots();
    this.component.setApplyEnabled(this._allFilled());
  }

  clearSlot(index) {
    if (!this._slots[index]) return;
    this._slots[index].value  = null;
    this._slots[index].src    = null;
    this._slots[index].active = true;
    this._activeSlot = index;
    this._rerenderSlots();
    this.component.setApplyEnabled(false);
  }

  setActiveSlot(index) {
    this._activeSlot = index;
    this._slots.forEach((s, i) => s.active = i === index);
    this.component.setSlotActive(index);
  }

  updatePreview(slots) {
    if (!this._operator) return;
    const names = slots.map(s => s && s.value ? s.value.name : '?');
    let html;
    if (this._operator.buildPreview) {
      html = this._operator.buildPreview(names);
    } else {
      // generic fallback
      if (this._operator.arity === 1) {
        html = `<span>${this._operator.sym}( ${names[0]} )</span>`;
      } else if (this._operator.arity === 2) {
        html = `<span>${names[0]}  ${this._operator.sym}  ${names[1]}</span>`;
      } else {
        html = `<span>${this._operator.sym}( ${names.join(',  ')} )</span>`;
      }
    }
    this.component.updatePreview(html);
  }

  getSlots()      { return this._slots; }
  getActiveSlot() { return this._activeSlot; }

  showFeedback(msg) { this.component.showFeedback(msg); }
  getSaveName()     { return this.component.getSaveName(); }
  clearSaveName()   { this.component.clearSaveName(); }

  // ── private ───────────────────────────────────────────────────────────────

  _rerenderSlots() {
    this._slots.forEach((s, i) => s.active = i === this._activeSlot);
    this.component.renderSlots(this._slots);
    this.updatePreview(this._slots);
  }

  _allFilled() {
    return this._slots.every(s => s.value !== null);
  }

}