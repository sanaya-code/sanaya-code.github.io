// mathml_operators/power_operator/operator.js

class PowerOperator extends Operator {

  constructor() {
    super({
      name:       'Power',
      sym:        '^',
      arity:      2,
      group:      'Arithmetic',
      slotLabels: ['base', 'exponent'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><msup>${nodes[0]}${nodes[1]}</msup></math>`;
  }

  buildMathmlNode(nodes) {
    return `<msup>${nodes[0]}${nodes[1]}</msup>`;
  }

  buildExpression(names) {
    return `(${names[0]} ^ ${names[1]})`;
  }

}

const powerOperator = new PowerOperator();