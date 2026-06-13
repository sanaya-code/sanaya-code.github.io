// state/state_controller.js
// Read and write methods for application state.
// No UI logic. No DOM access. No business logic.

// monotonic counter — guarantees unique ids even within same millisecond
let _idCounter = Date.now();
const _nextId = (prefix) => `${prefix}${++_idCounter}`;

// default atoms seeded on app startup — { tag: 'mi' | 'mn', symbol: string }
const DEFAULT_ATOMS = [
  { tag: 'mi', symbol: 'x₁' },
  { tag: 'mi', symbol: 'x₂' },
  { tag: 'mi', symbol: 'x₃' },
  { tag: 'mi', symbol: 'α'  },
  { tag: 'mi', symbol: 'β'  },
  { tag: 'mi', symbol: 'π'  },
  { tag: 'mi', symbol: 'e'  },
  { tag: 'mn', symbol: '1'  },
  { tag: 'mn', symbol: '0'  },
];

const StateController = {

  // ── atoms ────────────────────────────────────────────────────────────────

  getAtoms() {
    return state.atoms;
  },

  seedDefaultAtoms() {
    DEFAULT_ATOMS.forEach(({ tag, symbol }) => {
      this.addAtom(`<math display="inline"><${tag}>${symbol}</${tag}></math>`);
    });
  },

  addAtom(mathmlNode) {
    const id   = _nextId('a');
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
    const id   = _nextId('e');
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

// ── sentence ──────────────────────────────────────────────────────────────

  getSentenceTokens() {
    return state.sentenceTokens;
  },

  appendTextToken(text) {
    state.sentenceTokens.push(new SentenceToken('text', text));
  },

  appendNodeToken(node) {
    state.sentenceTokens.push(new SentenceToken('node', node));
  },

  deleteLastToken() {
    state.sentenceTokens.pop();
  },

  clearSentence() {
    state.sentenceTokens = [];
  },

  getSentenceMathmlMode() {
    return state.sentenceMathmlMode;
  },

  setSentenceMathmlMode(active) {
    state.sentenceMathmlMode = active;
  },
};