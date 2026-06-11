// mathml_operators/add_operator/operator.js

const AddOperator = {
  name:  'Add',
  sym:   '+',
  arity: 2,
  group: 'Arithmetic',

  buildPreview(nodes) {
    return `<math display="inline"><mrow>${nodes[0]}<mo>+</mo>${nodes[1]}</mrow></math>`;
  },

  buildMathmlNode(nodes) {
    return `<mrow>${nodes[0]}<mo>+</mo>${nodes[1]}</mrow>`;
  },

  buildExpression(names) {
    return `(${names[0]} + ${names[1]})`;
  }
};