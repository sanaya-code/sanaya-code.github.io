// event_handlers/operator_form/event_handler.js

class OperatorFormEventHandler {

  constructor(stateController, operatorFormController) {
    this._state  = stateController;
    this._form   = operatorFormController;

    this.onSlotClick = this.onSlotClick.bind(this);
    this.onSlotClear = this.onSlotClear.bind(this);
    this.onApply     = this.onApply.bind(this);
  }

  onSlotClick(index) {
    const current = this._form.getActiveSlot();
    const newActive = current === index ? null : index;
    this._state.setActiveSlotIndex(newActive);
    this._form.setActiveSlot(newActive);
  }

  onSlotClear(index) {
    this._state.clearSlot(index);
    this._form.clearSlot(index);
    this._form.updatePreview(this._form.getSlots());
  }

  onApply() {
    const slots = this._form.getSlots();
    if (slots.some(s => !s.value)) return;

    const op    = this._state.getSelectedOperator();
    const names = slots.map(s => s.value.name);
    const expr  = op.buildExpression
      ? op.buildExpression(names)
      : `${op.sym}(${names.join(', ')})`;

    const saveName = this._form.getSaveName() ||
                     `expr${this._state.getExpressions().length + 1}`;

    this._state.addExpression(saveName, expr, slots.map(s => s.value));
    this._form.showFeedback(`✓ "${saveName}" saved`);
    this._form.reset(op);
  }

}