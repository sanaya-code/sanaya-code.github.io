// event_handlers/atoms_panel/event_handler.js

class AtomsPanelEventHandler {

  constructor(stateController, atomsPanelController) {
    this._stateController = stateController;
    this._atomsPanelController = atomsPanelController;

    this.onPillClick = this.onPillClick.bind(this);
    this.onAddClick = this.onAddClick.bind(this);
  }

  onPillClick(id) {
    const alreadySelected =
      this._stateController.getSelectedAtomId() === id;

    if (alreadySelected) {
      this._stateController.clearSelection();
      this._atomsPanelController.clearSelection();
    } else {
      this._stateController.setSelectedAtomId(id);
      this._atomsPanelController.highlightSelected(id);
    }

    console.log(
      '[atoms] selected atom id:',
      this._stateController.getSelectedAtomId()
    );
  }

  onAddClick() {
    console.log('[atoms] add-click — popup will open in step 4');
  }

}