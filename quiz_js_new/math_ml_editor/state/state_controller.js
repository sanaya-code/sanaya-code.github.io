// state/state_controller.js
// Read and write methods for application state.
// No UI logic. No DOM access. No business logic.

const StateController = {

  // ── atoms ────────────────────────────────────────────────────────────────

  getAtoms() {
    return state.atoms;
  },

  addAtom(mathmlNode) {
    const id   = 'a' + Date.now();
    const node = new Node(id, mathmlNode);
    state.atoms.push(node);
    return id;
  },

  getAtomById(id) {
    return state.atoms.find(a => a.id === id) || null;
  },

  // ── expressions ──────────────────────────────────────────────────────────

  getExpressions() {
    return state.expressions;
  },

  addExpression(mathmlNode) {
    const id   = 'e' + Date.now();
    const node = new Node(id, mathmlNode);
    state.expressions.push(node);
    return id;
  },

  getExpressionById(id) {
    return state.expressions.find(e => e.id === id) || null;
  },

  removeExpression(id) {
    state.expressions = state.expressions.filter(e => e.id !== id);
  },

  // ── selection ────────────────────────────────────────────────────────────

  getSelectedAtomId() {
    return state.selectedAtomId;
  },

  setSelectedAtomId(id) {
    state.selectedAtomId = id;
    state.selectedExprId = null;   // single selection across both lists
  },

  getSelectedExprId() {
    return state.selectedExprId;
  },

  setSelectedExprId(id) {
    state.selectedExprId = id;
    state.selectedAtomId = null;   // single selection across both lists
  },

  clearSelection() {
    state.selectedAtomId = null;
    state.selectedExprId = null;
  },

  // ── operator ─────────────────────────────────────────────────────────────

  getSelectedOperator() {
    return state.selectedOperator;
  },

  setSelectedOperator(op) {
    state.selectedOperator = op;
    state.slots = Array(op.arity).fill(null);
    state.activeSlotIndex = 0;
  },

  // ── slots ─────────────────────────────────────────────────────────────────

  getSlots() {
    return state.slots;
  },

  setSlot(index, node) {
    state.slots[index] = node;
  },

  clearSlot(index) {
    state.slots[index] = null;
  },

  getActiveSlotIndex() {
    return state.activeSlotIndex;
  },

  setActiveSlotIndex(index) {
    state.activeSlotIndex = index;
  },

  clearSlots() {
    state.slots = [];
    state.activeSlotIndex = null;
  },

};