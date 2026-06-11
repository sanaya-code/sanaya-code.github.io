// event_handlers/add_item_popup/event_handler.js

class AddItemPopupEventHandler {

  constructor(stateController, atomsPanelController, addItemPopupController) {
    this._state      = stateController;
    this._atomsPanel = atomsPanelController;
    this._popup      = addItemPopupController;

    this.onSubmit    = this.onSubmit.bind(this);
    this.onSubmitAll = this.onSubmitAll.bind(this);
    this.onCancel    = this.onCancel.bind(this);
  }

  _typeToTag(type) {
    return type === 'const' ? 'mn' : 'mi';
  }

  onSubmit(name, type) {
    const tag        = this._typeToTag(type);
    const mathmlNode = `<math display="inline"><${tag}>${name}</${tag}></math>`;
    const id         = this._state.addAtom(mathmlNode);
    this._atomsPanel.load(this._state.getAtoms());
    this._atomsPanel.activateItem(id);
    this._popup.hide();
  }

  onSubmitAll(raw, type) {
    const names = raw.split(',')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (!names.length) return;

    const tag = this._typeToTag(type);
    names.forEach(name => {
      const mathmlNode = `<math display="inline"><${tag}>${name}</${tag}></math>`;
      this._state.addAtom(mathmlNode);
    });

    this._atomsPanel.load(this._state.getAtoms());
    this._popup.hide();
  }

  onCancel() {
    this._popup.hide();
  }

}