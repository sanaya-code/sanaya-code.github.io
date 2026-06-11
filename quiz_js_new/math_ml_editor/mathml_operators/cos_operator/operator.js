// mathml_operators/cos_operator/operator.js

class CosOperator extends Operator {

  constructor() {
    super({
      name:       'cos',
      sym:        'cos',
      arity:      1,
      group:      'Trigonometric',
      slotLabels: ['angle'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow><mo>cos</mo><mo>(</mo>${nodes[0]}<mo>)</mo></mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow><mo>cos</mo><mo>(</mo>${nodes[0]}<mo>)</mo></mrow>`;
  }

  buildExpression(names) {
    return `cos(${names[0]})`;
  }

}

const cosOperator = new CosOperator();