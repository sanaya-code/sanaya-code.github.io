// event_handlers/sentence_builder/event_handler.js

class SentenceBuilderEventHandler {

  constructor(stateController, sentenceBuilderController) {
    this._state    = stateController;
    this._sentence = sentenceBuilderController;

    this.onAddText          = this.onAddText.bind(this);
    this.onAddSpace         = this.onAddSpace.bind(this);
    this.onDeleteLast       = this.onDeleteLast.bind(this);
    this.onMathmlModeToggle = this.onMathmlModeToggle.bind(this);
    this.onCopy             = this.onCopy.bind(this);
  }

  onAddText(text) {
    this._state.appendTextToken(text);
    this._sentence.load(this._state.getSentenceTokens());
  }

  onAddSpace() {
    this._state.appendTextToken(' ');   // non-breaking space as text token
    this._sentence.load(this._state.getSentenceTokens());
  }

  onDeleteLast() {
    this._state.deleteLastToken();
    this._sentence.load(this._state.getSentenceTokens());
  }

  onMathmlModeToggle() {
    const current = this._state.getSentenceMathmlMode();
    this._state.setSentenceMathmlMode(!current);
    this._sentence.setMathmlMode(!current);
  }

  onCopy() {
    const tokens  = this._state.getSentenceTokens();
    if (!tokens.length) return;
    const mathml  = `<math display="block">${tokens.map(t => t.toMathml()).join('')}</math>`;
    navigator.clipboard.writeText(mathml).then(() => {
      this._sentence.showCopyFeedback();
    });
  }

  // called by atoms_panel and working_set_panel event handlers
  // when sentenceMathmlMode is active
  onNodeSelected(node) {
    this._state.appendNodeToken(node);
    this._state.setSentenceMathmlMode(false);
    this._sentence.setMathmlMode(false);
    this._sentence.load(this._state.getSentenceTokens());
  }

}