// event_handlers/working_set_panel/event_handler.js

class WorkingSetPanelEventHandler {

  constructor(stateController, workingSetPanelController, operatorFormController) {
    this._state      = stateController;
    this._workingSet = workingSetPanelController;
    this._form       = operatorFormController;

    this.onPillClick   = this.onPillClick.bind(this);
    this.onDeleteClick = this.onDeleteClick.bind(this);
  }

  onPillClick(id) {
    const activeSlot = this._form.getActiveSlot();

    if (activeSlot !== null) {
      const node = this._state.getExpressionById(id);
      if (!node) return;
      this._state.setSlot(activeSlot, node);
      this._form.fillSlot(activeSlot, node);
      this._workingSet.activateItem(id);
    } else {
      const alreadySelected = this._state.getSelectedExprId() === id;
      if (alreadySelected) {
        this._state.clearSelection();
        this._workingSet.clearSelection();
      } else {
        this._state.setSelectedExprId(id);
        this._workingSet.activateItem(id);
      }
    }
  }

  onDeleteClick(id) {
    this._state.removeExpression(id);
    this._workingSet.load(this._state.getExpressions());
    this._state.clearSelection();
  }

}