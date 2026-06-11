// mathml_operators/operator_registry.js
// Single source of truth for all operator groups.
// Add new operators here after creating their class in mathml_operators/.

const OPERATOR_GROUPS = [
  {
    group: 'Arithmetic',
    ops: [
      addOperator,
      subtractOperator,
      multiplyOperator,
      divideOperator,
      powerOperator,
      sqrtOperator,
      negateOperator,
      absOperator,
    ]
  },
  {
    group: 'Trigonometric',
    ops: [
      sinOperator,
      cosOperator
    ]
  }
];