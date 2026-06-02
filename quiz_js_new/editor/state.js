// editor/state.js

const EditorState = (() => {

  let _questions   = [];
  let _activeIndex = -1;

  // ── Deep clone helper ────────────────────────────────
  // All data entering and leaving state goes through this.
  // No component ever holds a live reference into state.

  function _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // ── Getters ──────────────────────────────────────────

  // Returns a deep clone of one question — caller cannot mutate state
  function getQuestion(index) {
    if (index < 0 || index >= _questions.length) return null;
    return _clone(_questions[index]);
  }

  // Returns deep clones of all questions
  function getQuestions() {
    return _questions.map(q => _clone(q));
  }

  function getActiveIndex() {
    return _activeIndex;
  }

  function setActiveIndex(index) {
    _activeIndex = index;
  }

  function getCount() {
    return _questions.length;
  }

  // ── Add unsaved question ─────────────────────────────

  function addUnsavedQuestion(type) {
    const template = EditorConfig.DEFAULTS[type] || { type, question: '' };
    // Deep clone template so no two questions share array references
    const newQ = Object.assign(_clone(template), { _unsaved: true });
    _questions.push(newQ);
    _activeIndex = _questions.length - 1;
    return _activeIndex;
  }

  // ── Save / update ────────────────────────────────────

  function saveQuestion(index, questionData) {
    if (index < 0 || index >= _questions.length) return;
    // Deep clone incoming data — state owns its own copy
    _questions[index] = Object.assign(_clone(questionData), { _unsaved: false });
    _reassignIds();
  }

  // ── Delete ───────────────────────────────────────────

  function deleteQuestion(index) {
    if (index < 0 || index >= _questions.length) return;
    _questions.splice(index, 1);
    if (_activeIndex === index) {
      _activeIndex = Math.min(_activeIndex, _questions.length - 1);
    } else if (index < _activeIndex) {
      _activeIndex--;
    }
    _reassignIds();
  }

  // ── Reorder (drag-drop) ──────────────────────────────

  function reorderQuestions(from, to) {
    if (from < 0 || to < 0 ||
        from >= _questions.length || to >= _questions.length ||
        from === to) return;

    const moved = _questions.splice(from, 1)[0];
    _questions.splice(to, 0, moved);

    // Track active index through the move
    if (_activeIndex === from) {
      _activeIndex = to;
    } else if (from < to) {
      if (_activeIndex > from && _activeIndex <= to) _activeIndex--;
    } else {
      if (_activeIndex >= to && _activeIndex < from) _activeIndex++;
    }

    _reassignIds();
  }

  // ── Export ───────────────────────────────────────────
  // Returns deep clones with internal flags stripped

  function exportQuestions() {
    // Only export saved questions — unsaved (blank/incomplete) are excluded
    return _questions
      .filter(q => !q._unsaved)
      .map(q => {
        const clean = _clone(q);
        delete clean._unsaved;
        return clean;
      });
  }

  // ── Reset ────────────────────────────────────────────

  function reset() {
    _questions   = [];
    _activeIndex = -1;
  }

  // ── Load ─────────────────────────────────────────────

  function loadQuestions(arr) {
    // Deep clone every question — state is fully independent of source
    _questions   = arr.map(q => Object.assign(_clone(q), { _unsaved: false }));
    _activeIndex = -1;
    _reassignIds();
  }

  // ── Private: reassign IDs by position ───────────────

  function _reassignIds() {
    _questions.forEach((q, i) => {
      q.id = String(i + 1).padStart(3, '0');
    });
  }

  return {
    getQuestion,
    getQuestions,
    getActiveIndex,
    setActiveIndex,
    getCount,
    addUnsavedQuestion,
    saveQuestion,
    deleteQuestion,
    reorderQuestions,
    exportQuestions,
    reset,
    loadQuestions,
  };

})();