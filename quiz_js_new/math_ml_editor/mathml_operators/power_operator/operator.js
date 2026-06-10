// mathml_operators/power_operator/operator.js

const PowerOperator = {
  name:  'Power',
  sym:   '^',
  arity: 2,
  group: 'Arithmetic',

  buildPreview(names) {
    return `<math display="inline">
      <msup>
        <mi>${names[0]}</mi>
        <mi>${names[1]}</mi>
      </msup>
    </math>`;
  },

  buildExpression(names) {
    return `(${names[0]} ^ ${names[1]})`;
  }
};