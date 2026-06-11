// mathml_operators/negate_operator/operator.js

class NegateOperator extends Operator {

  constructor() {
    super({
      name:       'Negate',
      sym:        '−',
      arity:      1,
      group:      'Arithmetic',
      slotLabels: ['operand'],
      keywords:   ['negation', 'sign'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow><mo>−</mo>${nodes[0]}</mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow><mo>−</mo>${nodes[0]}</mrow>`;
  }

  buildExpression(names) {
    return `(-${names[0]})`;
  }

}

const negateOperator = new NegateOperator();