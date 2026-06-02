// editor/event_handler/question_list/handler.js

class QuestionListHandler {

  constructor(listComponent, editorState, editorPanelHandler) {
    this._list         = listComponent;
    this._state        = editorState;
    this._panelHandler = editorPanelHandler;
    this._bindEvents();
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {

    this._list.addEventListener('question-selected', (e) => {
      const { index } = e.detail;
      this._state.setActiveIndex(index);
      const q = this._state.getQuestion(index);
      if (q && this._panelHandler) this._panelHandler.loadQuestion(index, q);
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

    const prevActive = this._state.getActiveIndex();
    const wasActive  = prevActive === index;
    const shiftedUp  = !wasActive && index < prevActive;

    // Mutate state first
    this._state.deleteQuestion(index);
    const newActive = this._state.getActiveIndex();

    // Refresh list from state
    this.refresh(newActive);

    if (!this._panelHandler) return;

    if (wasActive) {
      // Deleted the open question
      if (newActive < 0) {
        this._panelHandler.clearPanel();
      } else {
        // Load whatever is now at newActive
        const q = this._state.getQuestion(newActive);
        if (q) this._panelHandler.loadQuestion(newActive, q);
      }
    } else if (shiftedUp) {
      // Form content unchanged — just fix the index silently
      this._panelHandler.updateCurrentIndex(newActive);
    }
    // If deleted below active — nothing to do
  }

  // ── Reorder ──────────────────────────────────────────

  _handleReorder(from, to) {
    const prevActive = this._state.getActiveIndex();

    // Mutate state first
    this._state.reorderQuestions(from, to);
    const newActive = this._state.getActiveIndex();

    // Refresh list from state
    this.refresh(newActive);

    if (!this._panelHandler) return;

    if (prevActive === newActive) {
      // Active card did not move — preserve unsaved input, do nothing
      return;
    }

    // Active card moved to a new index
    const q = this._state.getQuestion(newActive);
    if (!q) return;

    if (q._unsaved) {
      // Unsaved — only fix index, don't re-render (would wipe input)
      this._panelHandler.updateCurrentIndex(newActive);
    } else {
      // Saved — safe to reload at new index
      this._panelHandler.loadQuestion(newActive, q);
    }
  }

  // ── Refresh ──────────────────────────────────────────

  refresh(activeIndex = -1) {
    this._list.setQuestions(
      this._state.getQuestions(),
      activeIndex
    );
  }

}