// mathml_operators/sqrt_operator/operator.js

class SqrtOperator extends Operator {

  constructor() {
    super({
      name:       'Sqrt',
      sym:        '√',
      arity:      1,
      group:      'Arithmetic',
      slotLabels: ['radicand'],
      keywords:   ['sq', 'square', 'root'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><msqrt>${nodes[0]}</msqrt></math>`;
  }

  buildMathmlNode(nodes) {
    return `<msqrt>${nodes[0]}</msqrt>`;
  }

  buildExpression(names) {
    return `sqrt(${names[0]})`;
  }

}

const sqrtOperator = new SqrtOperator();