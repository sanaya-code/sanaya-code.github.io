// editor/event_handler/editor_panel/handler.js

class EditorPanelHandler {

  constructor(panelComponent, state, listHandler) {
    this._panel       = panelComponent;
    this._state       = state;
    this._listHandler = listHandler;
    this._bindEvents();
  }

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question) {
    this._panel.loadQuestion(index, question);
  }

  loadNewQuestion(type, index) {
    const q = this._state.getQuestion(index);
    if (q) this._panel.loadQuestion(index, q);
  }

  clearPanel() {
    this._panel.clear();
  }

  // Silently update index — no re-render, preserves unsaved form input
  updateCurrentIndex(newIndex) {
    this._panel.updateCurrentIndex(newIndex);
  }

  // ── Events ──────────────────────────────────────────

  _bindEvents() {
    // question-saved bubbles up from any form through editor-panel
    this._panel.addEventListener('question-saved', (e) => {
      this._handleQuestionSaved(e.detail.index, e.detail.question);
    });
  }

  // ── Save flow ────────────────────────────────────────

  _handleQuestionSaved(index, questionData) {
    // 1. Write to state — state owns the data from here
    this._state.saveQuestion(index, questionData);

    // 2. Refresh list — reads fresh from state
    this._listHandler.refresh(this._state.getActiveIndex());

    // 3. Show preview — reads fresh from state
    const saved = this._state.getQuestion(index);
    if (saved) this._panel.showPreviewTab(saved);

    // 4. Persist draft
    this._saveDraft();
  }

  // ── Draft ────────────────────────────────────────────

  _saveDraft() {
    try {
      localStorage.setItem(
        EditorConfig.STORAGE_KEY,
        JSON.stringify({
          questions: this._state.exportQuestions(),
          savedAt:   new Date().toISOString(),
        })
      );
    } catch (e) {
      console.warn('[EditorPanelHandler] Draft save failed:', e);
    }
  }

}