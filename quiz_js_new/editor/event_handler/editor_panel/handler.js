// editor/event_handler/editor_panel/handler.js

class EditorPanelHandler {

  constructor(panelComponent, listHandler) {
    this._panel       = panelComponent;
    this._listHandler = listHandler;
    this._bindEvents();
  }

  // ── Public API ───────────────────────────────────────

  loadQuestion(index, question) {
    this._panel.loadQuestion(index, question);
  }

  loadNewQuestion(type, index) {
    const q = StateController.getQuestion(index);
    if (q) this._panel.loadQuestion(index, q);
  }

  clearPanel() {
    this._panel.clear();
  }

  // ── Events ──────────────────────────────────────────

  _bindEvents() {

    // question-saved bubbles from any form
    this._panel.addEventListener('question-saved', (e) => {
      this._handleSave(e.detail.index, e.detail.question);
    });

    // question-closed from Close button
    this._panel.addEventListener('question-closed', (e) => {
      this._handleClose(e.detail.isNew, e.detail.index);
    });

  }

  // ── Save ─────────────────────────────────────────────

  _handleSave(index, questionData) {
    // Write to state — draft auto-saved inside StateController.saveQuestion
    StateController.saveQuestion(index, questionData);

    // Return to view mode
    StateController.returnToView();

    // Refresh list
    this._listHandler.refresh();

    // Show preview with fresh data
    // const saved = StateController.getQuestion(index);
    // if (saved) this._panel.showPreviewTab(saved);
  }

  // ── Close ─────────────────────────────────────────────

  _handleClose(isNew, index) {
    if (isNew) {
      // New question — remove it entirely
      StateController.deleteQuestion(index);
    }
    // Existing question — discard edits, state unchanged

    StateController.returnToView();
    // this._listHandler.refresh();
    this._panel.clear();
  }

}