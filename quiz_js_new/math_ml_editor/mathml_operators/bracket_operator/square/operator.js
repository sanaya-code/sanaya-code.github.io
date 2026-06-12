// mathml_operators/bracket_operator/square/operator.js

class SquareBracketOperator extends Operator {

  constructor() {
    super({
      name:       'Brackets []',
      sym:        '[]',
      arity:      1,
      group:      'Arithmetic',
      slotLabels: ['inner'],
      keywords:   ['square brackets', 'group'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow><mo>[</mo>${nodes[0]}<mo>]</mo></mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow><mo>[</mo>${nodes[0]}<mo>]</mo></mrow>`;
  }

  buildExpression(names) {
    return `[${names[0]}]`;
  }

}

const squareBracketOperator = new SquareBracketOperator();