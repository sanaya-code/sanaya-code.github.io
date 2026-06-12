// mathml_operators/bracket_operator/round/operator.js

class RoundBracketOperator extends Operator {

  constructor() {
    super({
      name:       'Brackets ()',
      sym:        '()',
      arity:      1,
      group:      'Arithmetic',
      slotLabels: ['inner'],
      keywords:   ['parentheses', 'round brackets', 'group'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow><mo>(</mo>${nodes[0]}<mo>)</mo></mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow><mo>(</mo>${nodes[0]}<mo>)</mo></mrow>`;
  }

  buildExpression(names) {
    return `(${names[0]})`;
  }

}

const roundBracketOperator = new RoundBracketOperator();