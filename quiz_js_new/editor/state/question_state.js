// editor/state/question_state.js

const QuestionState = (() => {

  let _questions = [];

  // ── Clone helper ─────────────────────────────────────
  // All data in and out is deep cloned.
  // No external code ever holds a live reference into state.

  function _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ── Read ─────────────────────────────────────────────

  function getQuestion(index) {
    if (index < 0 || index >= _questions.length) return null;
    return _clone(_questions[index]);
  }

  function getQuestions() {
    return _questions.map(q => _clone(q));
  }

  function getCount() {
    return _questions.length;
  }

  // ── Write ────────────────────────────────────────────

  function addUnsavedQuestion(type) {
    const template = EditorFormRegistry.getDefault(type);
    _questions.push(Object.assign(template, { _unsaved: true }));
    const index = _questions.length - 1;
    _reassignIds();
    return index;
  }

  function saveQuestion(index, questionData) {
    if (index < 0 || index >= _questions.length) return;
    _questions[index] = Object.assign(_clone(questionData), { _unsaved: false });
    _reassignIds();
  }

  // Only called in 'view' mode — SelectionState guards enforced by StateController
  function deleteQuestion(index) {
    if (index < 0 || index >= _questions.length) return;
    _questions.splice(index, 1);
    _reassignIds();
  }

  // Only called in 'view' mode — SelectionState guards enforced by StateController
  function reorderQuestions(from, to) {
    if (
      from < 0 || to < 0 ||
      from >= _questions.length ||
      to   >= _questions.length ||
      from === to
    ) return;
    const moved = _questions.splice(from, 1)[0];
    _questions.splice(to, 0, moved);
    _reassignIds();
  }

  // Only called in 'view' mode — SelectionState guards enforced by StateController
  // Deep clones the question and appends it to the end, marked as saved
  function duplicateQuestion(index) {
    if (index < 0 || index >= _questions.length) return;
    const copy = Object.assign(_clone(_questions[index]), { _unsaved: false });
    _questions.push(copy);
    _reassignIds();
  }

  function reset() {
    _questions = [];
  }

  function loadQuestions(arr) {
    _questions = arr.map(q => Object.assign(_clone(q), { _unsaved: false }));
    _reassignIds();
  }

  // Appends questions to existing array — does NOT replace
  function importQuestions(arr) {
    const incoming = arr.map(q => Object.assign(_clone(q), { _unsaved: false }));
    _questions = _questions.concat(incoming);
    _reassignIds();
  }

  // ── Export (saved questions only) ────────────────────

  function exportQuestions() {
    return _questions
      .filter(q => !q._unsaved)
      .map(q => {
        const clean = _clone(q);
        delete clean._unsaved;
        return clean;
      });
  }

  // ── Private ──────────────────────────────────────────

  function _reassignIds() {
    _questions.forEach((q, i) => {
      q.id = String(i + 1).padStart(3, '0');
    });
  }

  return {
    getQuestion,
    getQuestions,
    getCount,
    addUnsavedQuestion,
    saveQuestion,
    deleteQuestion,
    duplicateQuestion,
    reorderQuestions,
    reset,
    loadQuestions,
    importQuestions,
    exportQuestions,
  };

})();