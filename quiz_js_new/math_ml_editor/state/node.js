// state/node.js

class Node {

  constructor(id, mathmlNode) {
    this.id         = id;
    this.mathmlNode = mathmlNode;
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