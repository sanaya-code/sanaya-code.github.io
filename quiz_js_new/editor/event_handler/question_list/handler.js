// editor/event_handler/question_list/handler.js

class QuestionListHandler {

  constructor(listController, panelController) {
    this._listCtrl  = listController;
    this._panelCtrl = panelController;
  }

  // ── Event handler methods (called by MainController) ─

  onQuestionSelected(index) {
    if (StateController.isEditing()) {
      StateController.promptFinishEditing();
      return;
    }
    StateController.selectExisting(index);
    this._listCtrl.refresh();
    const q = StateController.getQuestion(index);
    if (q) this._panelCtrl.loadQuestion(index, q);
  }

  onQuestionDeleted(index) {
    if (!StateController.canDelete()) {
      StateController.promptFinishEditing();
      return;
    }
    if (!confirm('Delete this question?')) return;
    StateController.deleteQuestion(index);
    this._listCtrl.refresh();
    this._panelCtrl.clear();
  }

  onQuestionDuplicated(index) {
    if (!StateController.canDelete()) {
      StateController.promptFinishEditing();
      return;
    }
    if (!confirm('Duplicate this question? A copy will be added to the end of the list.')) return;
    StateController.duplicateQuestion(index);
    this._listCtrl.refresh();
    this._listCtrl.scrollToIndex(StateController.getCount() - 1);
  }

  onQuestionReordered(from, to) {
    if (!StateController.canReorder()) return;
    StateController.reorderQuestions(from, to);
    this._listCtrl.refresh();
  }

}