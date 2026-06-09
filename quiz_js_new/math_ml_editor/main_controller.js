// main_controller.js
// Creates and wires all controllers, registers event handlers, mounts UI.
// Contains no business logic.

console.log('[main] app starting');

// ── mount points ─────────────────────────────────────────────────────────────
const mounts = {
  atomsPanel:      document.getElementById('atoms-panel-mount'),
  workingSetPanel: document.getElementById('working-set-panel-mount'),
  addItemPopup:    document.getElementById('add-item-popup-mount'),
  rightPanel:      document.getElementById('right-panel-mount'),
};

Object.entries(mounts).forEach(([name, el]) => {
  if (!el) console.error(`[main] missing mount point: #${name}`);
});

// ── step 2 verification ───────────────────────────────────────────────────────
console.log('[state] atoms loaded:', StateController.getAtoms());
console.log('[state] expressions:', StateController.getExpressions());
console.log('[state] selected atom:', StateController.getSelectedAtomId());

// quick smoke test
const testId = StateController.addAtom('testVar', 'var');
console.log('[state] added test atom, id:', testId);
console.log('[state] atoms after add:', StateController.getAtoms());

// ── controllers will be imported here in later steps ─────────────────────────
// const atomsPanelCtrl = new AtomsPanelController(mounts.atomsPanel);

// ── event handlers will be registered here in later steps ────────────────────
// atomsPanelHandlers.register(atomsPanelCtrl, StateController);

console.log('[main] step 2 complete');