// editor/state.js

const EditorState = (() => {

  let _questions   = [];
  let _activeIndex = -1;

  // ── Deep clone helper ────────────────────────────────
  // Only used at boundaries where a component needs to
  // edit data without corrupting state (e.g. the form).

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

  function getActiveIndex()        { return _activeIndex; }
  function setActiveIndex(index)   { _activeIndex = index; }
  function getCount()              { return _questions.length; }

  // ── Write ────────────────────────────────────────────

  function addUnsavedQuestion(type) {
    const template = EditorFormRegistry.getDefault(type) || { type, question: '' };
    _questions.push(Object.assign(_clone(template), { _unsaved: true }));
    _activeIndex = _questions.length - 1;
    return _activeIndex;
  }

  function saveQuestion(index, questionData) {
    if (index < 0 || index >= _questions.length) return;
    _questions[index] = Object.assign(_clone(questionData), { _unsaved: false });
    _reassignIds();
  }

  function deleteQuestion(index) {
    if (index < 0 || index >= _questions.length) return;
    _questions.splice(index, 1);
    // Recalculate active index
    if (_questions.length === 0) {
      _activeIndex = -1;
    } else if (_activeIndex >= _questions.length) {
      _activeIndex = _questions.length - 1;
    } else if (index < _activeIndex) {
      _activeIndex--;
    }
    // If deleted the active card, _activeIndex already points to
    // the next card (or clamped above) — no extra logic needed
    _reassignIds();
  }

  function reorderQuestions(from, to) {
    if (from < 0 || to < 0 ||
        from >= _questions.length ||
        to   >= _questions.length ||
        from === to) return;

    const moved = _questions.splice(from, 1)[0];
    _questions.splice(to, 0, moved);

    // Track active card through the move
    if (_activeIndex === from) {
      _activeIndex = to;
    } else if (from < to && _activeIndex > from && _activeIndex <= to) {
      _activeIndex--;
    } else if (from > to && _activeIndex >= to && _activeIndex < from) {
      _activeIndex++;
    }

    _reassignIds();
  }

  function reset() {
    _questions   = [];
    _activeIndex = -1;
  }

  function loadQuestions(arr) {
    _questions   = arr.map(q => Object.assign(_clone(q), { _unsaved: false }));
    _activeIndex = -1;
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
    getQuestion, getQuestions,
    getActiveIndex, setActiveIndex, getCount,
    addUnsavedQuestion, saveQuestion,
    deleteQuestion, reorderQuestions,
    reset, loadQuestions, exportQuestions,
  };

})();