// mathml_operators/log_operator/operator.js

class LogOperator extends Operator {

  constructor() {
    super({
      name:       'log₁₀',
      sym:        'log',
      arity:      1,
      group:      'Logarithmic',
      slotLabels: ['argument'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow><msub><mo>log</mo><mn>10</mn></msub><mo>(</mo>${nodes[0]}<mo>)</mo></mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow><msub><mo>log</mo><mn>10</mn></msub><mo>(</mo>${nodes[0]}<mo>)</mo></mrow>`;
  }

  buildExpression(names) {
    return `log10(${names[0]})`;
  }

}

const logOperator = new LogOperator();