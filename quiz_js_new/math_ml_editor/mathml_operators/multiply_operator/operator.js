// mathml_operators/multiply_operator/operator.js

class MultiplyOperator extends Operator {

  constructor() {
    super({
      name:       'Multiply',
      sym:        '×',
      arity:      2,
      group:      'Arithmetic',
      slotLabels: ['factor 1', 'factor 2'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow>${nodes[0]}<mo>×</mo>${nodes[1]}</mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow>${nodes[0]}<mo>×</mo>${nodes[1]}</mrow>`;
  }

  buildExpression(names) {
    return `(${names[0]} * ${names[1]})`;
  }

}

const multiplyOperator = new MultiplyOperator();