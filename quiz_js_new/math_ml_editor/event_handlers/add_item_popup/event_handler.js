// event_handlers/add_item_popup/event_handler.js

class AddItemPopupEventHandler {

  constructor(stateController, atomsPanelController, addItemPopupController) {
    this._state      = stateController;
    this._atomsPanel = atomsPanelController;
    this._popup      = addItemPopupController;

    this.onSubmitAll = this.onSubmitAll.bind(this);
    this.onCancel    = this.onCancel.bind(this);
  }

  onSubmitAll(raw) {
    const names = raw.split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (!names.length) return;

    names.forEach(name => {
      const category   = this._state.detectCategory(name);
      const tag         = category === 'number' ? 'mn' : 'mi';
      const mathmlNode  = `<math display="inline"><${tag}>${name}</${tag}></math>`;
      this._state.addAtom(mathmlNode, category);
    });

    this._atomsPanel.load(this._state.getAtoms());
    this._popup.hide();
  }

  onCancel() {
    this._popup.hide();
  }

}