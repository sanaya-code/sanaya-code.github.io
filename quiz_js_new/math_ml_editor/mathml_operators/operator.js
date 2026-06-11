// mathml_operators/operator.js
// Base class for all operators.
// Subclasses must override: name, sym, arity, slotLabels, buildPreview(), buildMathmlNode()
// Subclasses may override: buildExpression()
// keywords: optional array of search terms beyond name and sym

class Operator {

  constructor({ name, sym, arity, group, slotLabels, keywords }) {
    this.name       = name;
    this.sym        = sym;
    this.arity      = arity;
    this.group      = group;
    this.slotLabels = slotLabels || Array(arity).fill(null).map((_, i) => `operand ${i + 1}`);
    this.keywords   = keywords   || [];
  }

  // Override in subclass — receives MathML fragment strings, returns full <math> doc
  buildPreview(fragments) {
    if (this.arity === 1) {
      return `<math display="inline"><mrow><mo>${this.sym}</mo>${fragments[0]}</mrow></math>`;
    } else if (this.arity === 2) {
      return `<math display="inline"><mrow>${fragments[0]}<mo>${this.sym}</mo>${fragments[1]}</mrow></math>`;
    }
    return `<math display="inline"><mrow><mo>${this.sym}</mo><mo>(</mo>${fragments.join('<mo>,</mo>')}<mo>)</mo></mrow></math>`;
  }

  // Override in subclass — receives MathML fragment strings, returns inner fragment only (no <math> wrapper)
  buildMathmlNode(fragments) {
    if (this.arity === 1) {
      return `<mrow><mo>${this.sym}</mo>${fragments[0]}</mrow>`;
    } else if (this.arity === 2) {
      return `<mrow>${fragments[0]}<mo>${this.sym}</mo>${fragments[1]}</mrow>`;
    }
    return `<mrow><mo>${this.sym}</mo><mo>(</mo>${fragments.join('<mo>,</mo>')}<mo>)</mo></mrow>`;
  }

  // Override in subclass — receives plain name strings, returns text expression
  buildExpression(names) {
    return `${this.sym}(${names.join(', ')})`;
  }

  // Used by search — matches query against name, sym, and keywords
  matches(query) {
    const q = query.toLowerCase();
    return this.name.toLowerCase().includes(q)
        || this.sym.toLowerCase().includes(q)
        || this.keywords.some(k => k.toLowerCase().includes(q));
  }

}