// editor/event_handler/editor_panel/handler.js

class EditorPanelHandler {

  constructor(listController, panelController) {
    this._listCtrl  = listController;
    this._panelCtrl = panelController;
  }

  // ── Event handler methods (called by MainController) ─

  onQuestionSaved(index, questionData) {
    StateController.saveQuestion(index, questionData);
    StateController.returnToView();
    this._listCtrl.refresh();
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