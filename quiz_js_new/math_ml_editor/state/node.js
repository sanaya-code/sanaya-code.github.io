// state/node.js

class Node {

  constructor(id, mathmlNode, category = null) {
    this.id         = id;
    this.mathmlNode = mathmlNode;
    this.category   = category;   // 'number' | 'variable' | 'symbol' | null
  }

  getPreview() {
    return this.mathmlNode;
  }

  toFragment() {
    return this.mathmlNode
      .replace(/^<math[^>]*>/, '')
      .replace(/<\/math>\s*$/, '')
      .trim();
  }

}