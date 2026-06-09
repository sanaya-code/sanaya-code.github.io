// state/state.js
// Holds all application data.
// No logic here — just the data shape.

const state = {

  atoms: [
    { id: 'a1', name: 'x₁', type: 'var' },
    { id: 'a2', name: 'x₂', type: 'var' },
    { id: 'a3', name: 'x₃', type: 'var' },
    { id: 'a4', name: 'α',  type: 'sym' },
    { id: 'a5', name: 'β',  type: 'sym' },
    { id: 'a6', name: 'π',  type: 'sym' },
    { id: 'a7', name: 'e',  type: 'const' },
    { id: 'a8', name: '1',  type: 'const' },
    { id: 'a9', name: '0',  type: 'const' },
  ],

  expressions: [],   // List B — built expressions

  selectedAtomId:      null,   // currently selected atom pill
  selectedExprId:      null,   // currently selected expression pill
  selectedOperator:    null,   // currently selected operator object
  activeSlotIndex:     null,   // which operand slot is active in the form
  slots:               [],     // filled operand slots for current operator

};