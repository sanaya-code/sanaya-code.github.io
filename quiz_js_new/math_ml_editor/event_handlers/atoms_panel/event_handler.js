// event_handlers/atoms_panel/event_handler.js
// Plain handler functions passed into AtomsPanelController.bindEvents().
// Reads/writes state. Calls controller methods. No DOM access.

const AtomsPanelEventHandler = {

  onPillClick(id) {
    const alreadySelected = StateController.getSelectedAtomId() === id;
    if (alreadySelected) {
      StateController.clearSelection();
      atomsPanelCtrl.clearSelection();
    } else {
      StateController.setSelectedAtomId(id);
      atomsPanelCtrl.highlightSelected(id);
    }
    console.log('[atoms] selected atom id:', StateController.getSelectedAtomId());
  },

  onAddClick() {
    console.log('[atoms] add-click — popup will open in step 4');
  }

};