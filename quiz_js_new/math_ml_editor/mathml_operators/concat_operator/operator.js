// mathml_operators/concat_operator/operator.js

class ConcatOperator extends Operator {

  constructor() {
    super({
      name:       'Concat',
      sym:        '⋅',
      arity:      2,
      group:      'Arithmetic',
      slotLabels: ['left', 'right'],
      keywords:   ['concatenate', 'join', 'append', 'combine'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mrow>${nodes[0]}${nodes[1]}</mrow></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mrow>${nodes[0]}${nodes[1]}</mrow>`;
  }

  buildExpression(names) {
    return `(${names[0]}${names[1]})`;
  }

}

const concatOperator = new ConcatOperator();