// mathml_operators/subtract_operator/operator.js

class SubtractOperator extends Operator {

  constructor() {
    super({
      name:       'Subtract',
      sym:        '−',
      arity:      2,
      group:      'Arithmetic',
      slotLabels: ['minuend', 'subtrahend'],
      keywords:   ['substract', 'minus'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow>${nodes[0]}<mo>−</mo>${nodes[1]}</mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow>${nodes[0]}<mo>−</mo>${nodes[1]}</mrow>`;
  }

  buildExpression(names) {
    return `(${names[0]} - ${names[1]})`;
  }

}

const subtractOperator = new SubtractOperator();