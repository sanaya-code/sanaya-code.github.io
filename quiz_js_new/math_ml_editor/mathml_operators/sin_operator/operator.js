// mathml_operators/sin_operator/operator.js

class SinOperator extends Operator {

  constructor() {
    super({
      name:       'sin',
      sym:        'sin',
      arity:      1,
      group:      'Trigonometric',
      slotLabels: ['angle'],
      keywords:   ['sin']
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow><mo>sin</mo><mo>(</mo>${nodes[0]}<mo>)</mo></mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow><mo>sin</mo><mo>(</mo>${nodes[0]}<mo>)</mo></mrow>`;
  }

  buildExpression(names) {
    return `sin(${names[0]})`;
  }

}

const sinOperator = new SinOperator();