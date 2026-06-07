// editor/components/question_list/controller.js

class QuestionListController {

  constructor(component) {
    this._component = component;
  }

  // ── Called by event handlers ─────────────────────────

  refresh() {
    this._component.setQuestions(
      StateController.getQuestions(),
      StateController.getActiveIndex(),
      StateController.getMode()
    );
  }

  scrollToIndex(index) {
    this._component._scrollToIndex(index);
  }

}