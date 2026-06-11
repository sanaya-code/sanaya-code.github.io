// mathml_operators/add_operator/operator.js

class AddOperator extends Operator {

  constructor() {
    super({
      name:       'Add',
      sym:        '+',
      arity:      2,
      group:      'Arithmetic',
      slotLabels: ['term 1', 'term 2'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow>${nodes[0]}<mo>+</mo>${nodes[1]}</mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow>${nodes[0]}<mo>+</mo>${nodes[1]}</mrow>`;
  }

  buildExpression(names) {
    return `(${names[0]} + ${names[1]})`;
  }

}

const addOperator = new AddOperator();