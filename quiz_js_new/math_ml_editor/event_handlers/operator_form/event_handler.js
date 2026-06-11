// event_handlers/operator_form/event_handler.js

class OperatorFormEventHandler {

  constructor(stateController, operatorFormController, workingSetPanelController) {
    this._state      = stateController;
    this._form       = operatorFormController;
    this._workingSet = workingSetPanelController;

    this.onSlotClick = this.onSlotClick.bind(this);
    this.onSlotClear = this.onSlotClear.bind(this);
    this.onApply     = this.onApply.bind(this);
  }

  onSlotClick(index) {
    const current   = this._form.getActiveSlot();
    const newActive = current === index ? null : index;
    this._state.setActiveSlotIndex(newActive);
    this._form.setActiveSlot(newActive);
  }

  onSlotClear(index) {
    this._state.clearSlot(index);
    this._form.clearSlot(index);
  }

  onApply() {
    const slots = this._form.getSlots();
    if (slots.some(s => !s.value)) return;

    const op        = this._state.getSelectedOperator();
    const fragments = slots.map(s => s.value.toFragment());

    // use buildMathmlNode (inner fragment only) if available, else buildPreview
    const innerNode = op.buildMathmlNode
      ? op.buildMathmlNode(fragments)
      : `<mrow>${fragments.join(`<mo>${op.sym}</mo>`)}</mrow>`;

    // store as a full <math> document so toFragment() can cleanly strip it
    const mathmlNode = `<math display="inline">${innerNode}</math>`;

    const id = this._state.addExpression(mathmlNode);
    this._workingSet.load(this._state.getExpressions());
    this._form.showFeedback('✓ saved to working set');
    this._form.reset(op);
  }

}