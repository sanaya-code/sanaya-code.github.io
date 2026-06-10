// mathml_operators/add_operator/operator.js

const AddOperator = {
  name:  'Add',
  sym:   '+',
  arity: 2,
  group: 'Arithmetic',

  buildPreview(names) {
    return `<math display="inline">
      <mrow>
        <mi>${names[0]}</mi>
        <mo>+</mo>
        <mi>${names[1]}</mi>
      </mrow>
    </math>`;
  },

  buildExpression(names) {
    return `(${names[0]} + ${names[1]})`;
  }
};