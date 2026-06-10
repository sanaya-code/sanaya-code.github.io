// event_handlers/add_item_popup/event_handler.js

class AddItemPopupEventHandler {

  constructor(stateController, atomsPanelController, addItemPopupController) {
    this._state      = stateController;
    this._atomsPanel = atomsPanelController;
    this._popup      = addItemPopupController;

    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onSubmit(name, type) {
    const id = this._state.addAtom(name, type);
    this._atomsPanel.load(this._state.getAtoms());
    this._atomsPanel.activateItem(id);
    this._popup.hide();
  }

  onCancel() {
    this._popup.hide();
  }

}