// mathml_operators/divide_operator/operator.js

class DivideOperator extends Operator {

  constructor() {
    super({
      name:       'Divide',
      sym:        '÷',
      arity:      2,
      group:      'Arithmetic',
      slotLabels: ['numerator', 'denominator'],
      keywords:   ['divide', 'div'],
    });
  }

  buildPreview(nodes) {
    return `<math display="inline"><mfrac>${nodes[0]}${nodes[1]}</mfrac></math>`;
  }

  buildMathmlNode(nodes) {
    return `<mfrac>${nodes[0]}${nodes[1]}</mfrac>`;
  }

  buildExpression(names) {
    return `(${names[0]} / ${names[1]})`;
  }

}

const divideOperator = new DivideOperator();