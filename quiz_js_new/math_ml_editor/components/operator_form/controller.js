// components/operator_form/controller.js

class OperatorFormController {

  constructor(mountEl) {
    this.component   = new OperatorFormComponent();
    this.mountEl     = mountEl;
    this._operator   = null;
    this._slots      = [];
    this._activeSlot = null;
  }

  mount() {
    this.component.createElement();
    this.component.buildLayout();
    this.mountEl.appendChild(this.component.el);
    this.component.showEmpty();
  }

  bindEvents(onSlotClick, onSlotClear, onApply) {
    this.component.el.addEventListener('op-form:slot-click', (e) => onSlotClick(e.detail.index));
    this.component.el.addEventListener('op-form:slot-clear', (e) => onSlotClear(e.detail.index));
    this.component.el.addEventListener('op-form:apply',      ()  => onApply());
  }

  reset(operator) {
    this._operator   = operator;
    this._slots      = Array(operator.arity).fill(null).map(() => ({ value: null, active: false }));
    this._activeSlot = null;
    this.component.setOperatorHeader(operator.sym, operator.name, operator.arity);
    this.component.renderSlots(this._slots);
    this.component.setApplyEnabled(false);
  }

  fillSlot(index, node) {
    if (!this._slots[index]) return;
    this._slots[index].value  = node;
    this._slots[index].active = false;

    const next = this._slots.findIndex((s, i) => i > index && !s.value);
    this._activeSlot = next >= 0 ? next : null;

    this._rerenderSlots();
    this.component.setApplyEnabled(this._allFilled());
  }

  clearSlot(index) {
    if (!this._slots[index]) return;
    this._slots[index].value  = null;
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

    const fragments = slots.map(s => {
      if (!s || !s.value) return '<mi>?</mi>';
      return s.value.toFragment();
    });

    let html;
    if (this._operator.buildPreview) {
      html = this._operator.buildPreview(fragments);
    } else {
      if (this._operator.arity === 1) {
        html = `<math display="inline"><mrow><mo>${this._operator.sym}</mo>${fragments[0]}</mrow></math>`;
      } else if (this._operator.arity === 2) {
        html = `<math display="inline"><mrow>${fragments[0]}<mo>${this._operator.sym}</mo>${fragments[1]}</mrow></math>`;
      } else {
        html = `<math display="inline"><mrow><mo>${this._operator.sym}</mo><mo>(</mo>${fragments.join('<mo>,</mo>')}<mo>)</mo></mrow></math>`;
      }
    }
    this.component.updatePreview(html);
  }

  getSlots()      { return this._slots; }
  getActiveSlot() { return this._activeSlot; }

  showFeedback(msg) { this.component.showFeedback(msg); }

  _rerenderSlots() {
    this._slots.forEach((s, i) => s.active = i === this._activeSlot);
    this.component.renderSlots(this._slots);
    this.updatePreview(this._slots);
  }

  _allFilled() {
    return this._slots.every(s => s.value !== null);
  }

}