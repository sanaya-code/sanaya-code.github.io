// editor/components/editor_panel/controller.js

class EditorPanelController {

  constructor(component) {
    this._component = component;
    this._bindInternalEvents();
  }

  // ── Called by event handlers ─────────────────────────

  loadQuestion(index, question, isNew = false) {
    this._component.loadQuestion(index, question, isNew);
  }

  loadNewQuestion(index) {
    const q = StateController.getQuestion(index);
    if (q) this._component.loadQuestion(index, q, true);
  }

  showPreview(index) {
    const q = StateController.getQuestion(index);
    if (q) this._component.showPreviewTab(q);
  }

  showTypeSelector() {
    this._component.showTypeSelector();
  }

  clear() {
    this._component.clear();
  }

  // ── Internal — tab switching logic ───────────────────
  // Component emits tab-switched; controller resolves the
  // question from state and tells the component what to render.

  _bindInternalEvents() {
    this._component.addEventListener('tab-switched', (e) => {
      const { tab, index } = e.detail;
      const q = StateController.getQuestion(index);
      if (!q) return;
      if (tab === 'preview') {
        this._component.showPreviewTab(q);
      } else {
        this._component.loadQuestion(index, q,
          StateController.isNew());
      }
    });
  }

}