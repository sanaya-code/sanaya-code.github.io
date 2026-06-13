// editor/event_handler/editor_panel/handler.js

class EditorPanelHandler {

  constructor(listController, panelController, statusBarController) {
    this._listCtrl     = listController;
    this._panelCtrl    = panelController;
    this._statusBarCtrl = statusBarController;
  }

  // ── Event handler methods (called by MainController) ─

  onQuestionSaved(index, questionData) {
    StateController.saveQuestion(index, questionData);
    StateController.returnToView();
    this._listCtrl.refresh();
    this._listCtrl.scrollToIndex(index);
    this._statusBarCtrl.show('Question saved', 'success');
  }

  onQuestionClosed(isNew, index) {
    if (isNew) StateController.deleteQuestion(index);
    StateController.returnToView();
    this._listCtrl.refresh();
    this._panelCtrl.clear();
  }

  onTypeSelected(type) {
    const index = StateController.addUnsavedQuestion(type);
    this._listCtrl.refresh();
    this._panelCtrl.loadNewQuestion(index);
  }

  onTypeSelectorClosed() {
    StateController.returnToView();
    this._listCtrl.refresh();
    this._panelCtrl.clear();
  }

}