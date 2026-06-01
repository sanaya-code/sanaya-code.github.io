// editor/event_handler/editor_panel/handler.js

class EditorPanelHandler {

  /**
   * @param {EditorPanelComponent} panelComponent
   * @param {EditorState}          state
   * @param {QuestionListHandler}  listHandler
   */
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
    const template = Object.assign(
      {},
      EditorConfig.DEFAULTS[type] || { type, question: '' },
      { _unsaved: true }
    );
    this._panel.loadQuestion(index, template);
  }

  // ── Events ──────────────────────────────────────────

  _bindEvents() {
    // question-saved bubbles up from <mcq-form> through <editor-panel>
    this._panel.addEventListener('question-saved', (e) => {
      this._handleQuestionSaved(e.detail.index, e.detail.question);
    });
  }

  // ── Save flow ────────────────────────────────────────

  _handleQuestionSaved(index, questionData) {
    // 1. Persist to state — also reassigns all IDs
    this._state.saveQuestion(index, questionData);

    // 2. Refresh question list keeping saved card active
    this._listHandler.refresh(index);

    // 3. Switch to Preview tab — passes saved question to panel
    const saved = this._state.getQuestion(index);
    this._panel.showPreviewTab(saved);

    // 4. Persist draft to localStorage
    this._saveDraft();

    console.log('[EditorPanelHandler] Saved index', index, saved);
  }

  // ── Draft persistence ────────────────────────────────

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