// editor/components/question_list/controller.js

class QuestionListController {

  constructor(component) {
    this._component = component;
    this._bindViewToggle();
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

  // ── View toggle ───────────────────────────────────────

  _bindViewToggle() {
    const btnCard = document.getElementById('btn-view-card');
    const btnDot  = document.getElementById('btn-view-dot');
    if (!btnCard || !btnDot) return;

    btnCard.addEventListener('click', () => {
      this._component.setViewMode('card');
      btnCard.classList.add('ql-view-btn-active');
      btnDot.classList.remove('ql-view-btn-active');
    });

    btnDot.addEventListener('click', () => {
      this._component.setViewMode('dot');
      btnDot.classList.add('ql-view-btn-active');
      btnCard.classList.remove('ql-view-btn-active');
    });
  }

}