// event_handlers/atoms_panel/event_handler.js

class AtomsPanelEventHandler {

  constructor(stateController, atomsPanelController, addItemPopupController) {
    this._state      = stateController;
    this._atomsPanel = atomsPanelController;
    this._popup      = addItemPopupController;

    this.onPillClick = this.onPillClick.bind(this);
    this.onAddClick  = this.onAddClick.bind(this);
  }

  onPillClick(id) {
    const alreadySelected = this._state.getSelectedAtomId() === id;

    if (alreadySelected) {
      this._state.clearSelection();
      this._atomsPanel.clearSelection();
    } else {
      this._state.setSelectedAtomId(id);
      this._atomsPanel.highlightSelected(id);
    }
  }

  onAddClick() {
    this._popup.show();
  }

}