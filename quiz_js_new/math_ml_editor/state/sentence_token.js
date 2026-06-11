// state/sentence_token.js

class SentenceToken {

  constructor(type, value) {
    this.type  = type;   // 'text' | 'node'
    this.value = value;  // string (text) | Node instance (node)
  }

  // returns display label for the pill
  getLabel() {
    if (this.type === 'text') return this.value;
    return this.value.getPreview();
  }

  // returns MathML fragment for preview assembly
  toMathml() {
    if (this.type === 'text') return `<mtext>${this.value} </mtext>`;
    return this.value.toFragment();
  }

}