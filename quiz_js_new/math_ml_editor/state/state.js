// state/state.js
// Holds all application data.
// No logic here — just the data shape.
// All atoms and expressions are Node instances.

const state = {

  atoms: [],   // seeded at startup by StateController.seedDefaultAtoms()

  expressions: [],   // List B — built expressions, also Node instances

  selectedAtomId:   null,   // currently selected atom pill
  selectedExprId:   null,   // currently selected expression pill
  selectedOperator: null,   // currently selected operator object
  activeSlotIndex:  null,   // which operand slot is active in the form
  slots:               [],     // filled operand slots for current operator

  sentenceTokens:      [],     // array of SentenceToken instances
  sentenceMathmlMode:  false,  // true when + MathML button is active

};