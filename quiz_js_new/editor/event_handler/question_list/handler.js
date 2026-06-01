// editor/event_handler/question_list/handler.js

class QuestionListHandler {

  /**
   * @param {QuestionListComponent} listComponent
   * @param {Object} editorState   - will be wired in Stage 5
   * @param {Object} editorPanelHandler - will be wired in Stage 4
   */
  constructor(listComponent, editorState, editorPanelHandler) {
    this._list        = listComponent;
    this._state       = editorState;
    this._panelHandler = editorPanelHandler;
    this._bindEvents();
  }

  // ── Bind DOM events from the list component ──────────

  _bindEvents() {

    // Card selected → tell editor panel to load that question
    this._list.addEventListener('question-selected', (e) => {
      const { index } = e.detail;
      console.log('[QuestionListHandler] Selected index:', index);

      if (this._panelHandler) {
        const q = this._state.getQuestion(index);
        this._panelHandler.loadQuestion(index, q);
      }
    });

    // Card deleted
    this._list.addEventListener('question-deleted', (e) => {
      const { index } = e.detail;
      this._handleDelete(index);
    });

    // Card reordered via drag-drop
    this._list.addEventListener('question-reordered', (e) => {
      const { from, to } = e.detail;
      this._handleReorder(from, to);
    });

  }

  // ── Delete ───────────────────────────────────────────

  _handleDelete(index) {
    if (!confirm('Delete this question?')) return;

    if (this._state) {
      this._state.deleteQuestion(index);
      this.refresh();

      // If deleted card was active, clear the middle panel
      this.dispatchEvent && this.dispatchEvent(
        new CustomEvent('question-list-changed', { bubbles: true })
      );
    } else {
      // Stage 3 stub — no state yet, just log
      console.log('[QuestionListHandler] Delete index:', index);
    }
  }

  // ── Reorder ──────────────────────────────────────────

  _handleReorder(from, to) {
    if (this._state) {
      this._state.reorderQuestions(from, to);
      this.refresh();
    } else {
      // Stage 3 stub
      console.log('[QuestionListHandler] Reorder from', from, 'to', to);
    }
  }

  // ── Refresh list display ─────────────────────────────

  refresh(activeIndex = -1) {
    if (this._state) {
      this._list.setQuestions(this._state.getQuestions(), activeIndex);
    }
  }

  // ── Add a new unsaved question card ─────────────────
  // Called by EditorController after a type is selected

  addUnsavedCard(question, index) {
    this._list.setQuestions(
      this._state ? this._state.getQuestions() : [],
      index
    );
  }

}