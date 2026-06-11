// state/state.js
// Holds all application data.
// No logic here — just the data shape.
// All atoms and expressions are Node instances.

const state = {

  atoms: [
    new Node('a1', '<math display="inline"><mi>x&#x2081;</mi></math>'),
    new Node('a2', '<math display="inline"><mi>x&#x2082;</mi></math>'),
    new Node('a3', '<math display="inline"><mi>x&#x2083;</mi></math>'),
    new Node('a4', '<math display="inline"><mi>&#x03B1;</mi></math>'),
    new Node('a5', '<math display="inline"><mi>&#x03B2;</mi></math>'),
    new Node('a6', '<math display="inline"><mi>&#x03C0;</mi></math>'),
    new Node('a7', '<math display="inline"><mi>e</mi></math>'),
    new Node('a8', '<math display="inline"><mn>1</mn></math>'),
    new Node('a9', '<math display="inline"><mn>0</mn></math>'),
  ],

  expressions: [],   // List B — built expressions, also Node instances

  selectedAtomId:   null,   // currently selected atom pill
  selectedExprId:   null,   // currently selected expression pill
  selectedOperator: null,   // currently selected operator object
  activeSlotIndex:  null,   // which operand slot is active in the form
  slots:            [],     // filled operand slots for current operator

};