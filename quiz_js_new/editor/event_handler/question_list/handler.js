// editor/event_handler/question_list/handler.js

class QuestionListHandler {

  constructor(listComponent, editorState, editorPanelHandler) {
    this._list         = listComponent;
    this._state        = editorState;
    this._panelHandler = editorPanelHandler;
    this._bindEvents();
  }

  // ── Bind DOM events ──────────────────────────────────

  _bindEvents() {

    this._list.addEventListener('question-selected', (e) => {
      const { index } = e.detail;
      if (this._panelHandler) {
        this._state.setActiveIndex(index);
        const q = this._state.getQuestion(index);
        this._panelHandler.loadQuestion(index, q);
      }
    });

    this._list.addEventListener('question-deleted', (e) => {
      this._handleDelete(e.detail.index);
    });

    this._list.addEventListener('question-reordered', (e) => {
      this._handleReorder(e.detail.from, e.detail.to);
    });

  }

  // ── Delete ───────────────────────────────────────────

  _handleDelete(index) {
    if (!confirm('Delete this question?')) return;

    const prevActiveIndex = this._state.getActiveIndex();
    const wasActive       = prevActiveIndex === index;
    const activeIsAbove   = !wasActive && index < prevActiveIndex;

    // Mutate state immediately
    this._state.deleteQuestion(index);
    const newActiveIndex = this._state.getActiveIndex();

    // Refresh list with updated active highlight
    this.refresh(newActiveIndex);

    if (this._panelHandler) {
      if (wasActive) {
        // Deleted the open question
        if (newActiveIndex < 0) {
          // No questions left — clear panel
          this._panelHandler.clearPanel();
        } else {
          // Load the question that is now at newActiveIndex
          const q = this._state.getQuestion(newActiveIndex);
          if (q) this._panelHandler.loadQuestion(newActiveIndex, q);
        }
      } else if (activeIsAbove) {
        // Active card shifted down by 1 — silently update index
        // Do NOT re-render — preserves any unsaved input in the form
        this._panelHandler.updateIndex(newActiveIndex);
      }
      // If deleted card was below active — index unchanged, no action needed
    }
  }

  // ── Reorder ──────────────────────────────────────────

  _handleReorder(from, to) {
    const prevActiveIndex = this._state.getActiveIndex();

    // Mutate state immediately
    this._state.reorderQuestions(from, to);
    const newActiveIndex = this._state.getActiveIndex();

    // Refresh list with updated active highlight
    this.refresh(newActiveIndex);

    if (this._panelHandler) {
      if (prevActiveIndex === newActiveIndex) {
        // Active card did not move — do nothing, preserves unsaved input
        return;
      }

      // Active card moved to a new index
      const q = this._state.getQuestion(newActiveIndex);
      if (!q) return;

      if (q._unsaved) {
        // Unsaved question moved — only update index silently
        // Re-rendering would wipe the unsaved form state
        this._panelHandler.updateIndex(newActiveIndex);
      } else {
        // Saved question moved — safe to reload at new index
        this._panelHandler.loadQuestion(newActiveIndex, q);
      }
    }
  }

  // ── Refresh list display ─────────────────────────────

  refresh(activeIndex = -1) {
    if (this._state) {
      this._list.setQuestions(this._state.getQuestions(), activeIndex);
    }
  }

}