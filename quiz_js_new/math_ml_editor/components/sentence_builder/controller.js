// components/sentence_builder/controller.js

class SentenceBuilderController {

  constructor(mountEl) {
    this.component = new SentenceBuilderComponent();
    this.mountEl   = mountEl;
  }

  // ── setup ─────────────────────────────────────────────────────────────────

  mount() {
    this.component.createElement();
    this.component.buildLayout();
    this.mountEl.appendChild(this.component.el);
    this.component.renderTokens([]);
  }

  // ── event binding ─────────────────────────────────────────────────────────

  bindEvents(onAddText, onAddSpace, onDeleteLast, onMathmlModeToggle, onCopy) {
    this.component.el.addEventListener('sentence:add-text',    (e) => onAddText(e.detail.text));
    this.component.el.addEventListener('sentence:add-space',   ()  => onAddSpace());
    this.component.el.addEventListener('sentence:delete-last', ()  => onDeleteLast());
    this.component.el.addEventListener('sentence:mathml-toggle', () => onMathmlModeToggle());
    this.component.el.addEventListener('sentence:copy',        ()  => onCopy());
  }

  // ── called by event handlers ──────────────────────────────────────────────

  load(tokens) {
    this.component.renderTokens(tokens);
    this.component.updatePreview(tokens);
  }

  showCopyFeedback() {
    this.component.showCopyFeedback();
  }

  setMathmlMode(active) {
    this.component.setMathmlMode(active);
  }

}