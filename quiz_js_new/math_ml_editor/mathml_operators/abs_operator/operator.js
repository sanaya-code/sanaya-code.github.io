// mathml_operators/abs_operator/operator.js

class AbsOperator extends Operator {

  constructor() {
    super({
      name:       'Abs',
      sym:        '|·|',
      arity:      1,
      group:      'Arithmetic',
      slotLabels: ['operand'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow><mo>|</mo>${nodes[0]}<mo>|</mo></mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow><mo>|</mo>${nodes[0]}<mo>|</mo></mrow>`;
  }

  buildExpression(names) {
    return `|${names[0]}|`;
  }

}

const absOperator = new AbsOperator();