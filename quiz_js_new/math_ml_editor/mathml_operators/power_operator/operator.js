// mathml_operators/power_operator/operator.js

const PowerOperator = {
  name:  'Power',
  sym:   '^',
  arity: 2,
  group: 'Arithmetic',

  buildPreview(nodes) {
    return `<math display="inline"><msup>${nodes[0]}${nodes[1]}</msup></math>`;
  },

  buildMathmlNode(nodes) {
    return `<msup>${nodes[0]}${nodes[1]}</msup>`;
  },

  buildExpression(names) {
    return `(${names[0]} ^ ${names[1]})`;
  }
};