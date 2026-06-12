// mathml_operators/bracket_operator/curly/operator.js

class CurlyBracketOperator extends Operator {

  constructor() {
    super({
      name:       'Brackets {}',
      sym:        '{}',
      arity:      1,
      group:      'Arithmetic',
      slotLabels: ['inner'],
      keywords:   ['curly brackets', 'braces', 'set', 'group'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow><mo>{</mo>${nodes[0]}<mo>}</mo></mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow><mo>{</mo>${nodes[0]}<mo>}</mo></mrow>`;
  }

  buildExpression(names) {
    return `{${names[0]}}`;
  }

}

const curlyBracketOperator = new CurlyBracketOperator();