// event_handlers/atoms_panel/event_handler.js

class AtomsPanelEventHandler {

  constructor(stateController, atomsPanelController, addItemPopupController, operatorFormController) {
    this._state      = stateController;
    this._atomsPanel = atomsPanelController;
    this._popup      = addItemPopupController;
    this._form       = operatorFormController;

    this.onPillClick = this.onPillClick.bind(this);
    this.onAddClick  = this.onAddClick.bind(this);
  }

  onPillClick(id) {
    const activeSlot = this._form.getActiveSlot();

    if (activeSlot !== null) {
      // a slot is waiting — fill it
      const atom = this._state.getAtoms().find(a => a.id === id);
      if (!atom) return;
      const item = { ...atom, src: 'a' };
      this._state.setSlot(activeSlot, item);
      this._form.fillSlot(activeSlot, item);
      this._atomsPanel.activateItem(id);
    } else {
      // no active slot — just select/deselect the pill
      const alreadySelected = this._state.getSelectedAtomId() === id;
      if (alreadySelected) {
        this._state.clearSelection();
        this._atomsPanel.clearSelection();
      } else {
        this._state.setSelectedAtomId(id);
        this._atomsPanel.activateItem(id);
      }
    }
  }

  onAddClick() {
    this._popup.show();
  }

}