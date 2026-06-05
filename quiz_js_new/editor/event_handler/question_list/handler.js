// editor/event_handler/question_list/handler.js

class QuestionListHandler {

  constructor(listComponent, editorPanelHandler) {
    this._list         = listComponent;
    this._panelHandler = editorPanelHandler;
    this._bindEvents();
  }

  // ── Bind events ──────────────────────────────────────

  _bindEvents() {

    this._list.addEventListener('question-selected', (e) => {
      const { index } = e.detail;
      if (StateController.isEditing()) {
        StateController.promptFinishEditing();
        return;
      }
      StateController.selectExisting(index);
      // this.refresh();
      const q = StateController.getQuestion(index);
      if (q && this._panelHandler) this._panelHandler.loadQuestion(index, q);
    });

    this._list.addEventListener('question-deleted', (e) => {
      if (!StateController.canDelete()) {
        StateController.promptFinishEditing();
        return;
      }
      this._handleDelete(e.detail.index);
    });

    this._list.addEventListener('question-reordered', (e) => {
      if (!StateController.canReorder()) return;
      this._handleReorder(e.detail.from, e.detail.to);
    });

  }

  // ── Delete ───────────────────────────────────────────

  _handleDelete(index) {
    if (!confirm('Delete this question?')) return;
    StateController.deleteQuestion(index);
    this.refresh();
    if (this._panelHandler) this._panelHandler.clearPanel();
  }

  // ── Reorder ──────────────────────────────────────────

  _handleReorder(from, to) {
    StateController.reorderQuestions(from, to);
    this.refresh();
  }

  // ── Refresh ──────────────────────────────────────────

  refresh() {
    this._list.setQuestions(
      StateController.getQuestions(),
      StateController.getActiveIndex(),
      StateController.getMode()
    );
  }

}