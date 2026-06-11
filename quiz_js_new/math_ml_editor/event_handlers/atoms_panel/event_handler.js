// event_handlers/atoms_panel/event_handler.js

class AtomsPanelEventHandler {

  constructor(stateController, atomsPanelController, addItemPopupController, operatorFormController, sentenceBuilderEventHandler) {
    this._state      = stateController;
    this._atomsPanel = atomsPanelController;
    this._popup      = addItemPopupController;
    this._form       = operatorFormController;
    this._sentence   = sentenceBuilderEventHandler;

    this.onPillClick = this.onPillClick.bind(this);
    this.onAddClick  = this.onAddClick.bind(this);
  }

  onPillClick(id) {
    // sentence mathml mode takes priority
    if (this._state.getSentenceMathmlMode()) {
      const node = this._state.getAtomById(id);
      if (!node) return;
      this._sentence.onNodeSelected(node);
      return;
    }

    const activeSlot = this._form.getActiveSlot();

    if (activeSlot !== null) {
      const node = this._state.getAtomById(id);
      if (!node) return;
      this._state.setSlot(activeSlot, node);
      this._form.fillSlot(activeSlot, node);
      this._atomsPanel.activateItem(id);
    } else {
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