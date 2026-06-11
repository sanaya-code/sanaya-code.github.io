// event_handlers/add_item_popup/event_handler.js

class AddItemPopupEventHandler {

  constructor(stateController, atomsPanelController, addItemPopupController) {
    this._state      = stateController;
    this._atomsPanel = atomsPanelController;
    this._popup      = addItemPopupController;

    this.onSubmit = this.onSubmit.bind(this);
    this.onCancel = this.onCancel.bind(this);
  }

  onSubmit(name) {
    // wrap the entered symbol in MathML — use <mn> for digits, <mi> for everything else
    const tag        = /^\d+(\.\d+)?$/.test(name) ? 'mn' : 'mi';
    const mathmlNode = `<math display="inline"><${tag}>${name}</${tag}></math>`;
    const id         = this._state.addAtom(mathmlNode);
    this._atomsPanel.load(this._state.getAtoms());
    this._atomsPanel.activateItem(id);
    this._popup.hide();
  }

  onCancel() {
    this._popup.hide();
  }

}