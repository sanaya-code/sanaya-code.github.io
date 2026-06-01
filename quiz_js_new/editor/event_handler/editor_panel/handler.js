// editor/event_handler/editor_panel/handler.js

class EditorPanelHandler {

  /**
   * @param {EditorPanelComponent}  panelComponent
   * @param {PreviewPanelComponent} previewComponent
   * @param {EditorState}           state
   * @param {QuestionListHandler}   listHandler
   */
  constructor(panelComponent, previewComponent, state, listHandler) {
    this._panel       = panelComponent;
    this._preview     = previewComponent;
    this._state       = state;
    this._listHandler = listHandler;
    this._bindEvents();
  }

  // ── Public API ───────────────────────────────────────

  // Called by QuestionListHandler or EditorController
  loadQuestion(index, question) {
    this._panel.loadQuestion(index, question);
    // Clear preview when switching questions — restored on save
    this._preview.clear();
  }

  // Called by EditorController when a new type is selected
  loadNewQuestion(type, index) {
    const template = Object.assign(
      {},
      EditorConfig.DEFAULTS[type] || { type, question: '' },
      { _unsaved: true }
    );
    this._panel.loadQuestion(index, template);
    this._preview.clear();
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
    // 1. Persist to state (also reassigns all IDs)
    this._state.saveQuestion(index, questionData);

    // 2. Refresh the question list, keeping saved card active
    this._listHandler.refresh(index);

    // 3. Render live preview using existing quiz component
    const saved = this._state.getQuestion(index);
    this._preview.show(saved);

    // 4. Persist draft to localStorage
    this._saveDraft();

    console.log('[EditorPanelHandler] Saved question at index', index, saved);
  }

  // ── Draft persistence ─────────────────────────────────

  _saveDraft() {
    try {
      const draft = {
        questions:   this._state.exportQuestions(),
        savedAt:     new Date().toISOString(),
      };
      localStorage.setItem(
        EditorConfig.STORAGE_KEY,
        JSON.stringify(draft)
      );
    } catch (e) {
      console.warn('[EditorPanelHandler] Draft save failed:', e);
    }
  }

}