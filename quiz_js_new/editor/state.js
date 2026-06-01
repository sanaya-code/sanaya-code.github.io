// editor/state.js

const EditorState = (() => {

  let _questions   = [];   // array of question objects
  let _activeIndex = -1;   // index of currently open question

  // ── Getters ──────────────────────────────────────────

  function getQuestions() {
    return _questions;
  }

  function getQuestion(index) {
    return _questions[index] || null;
  }

  function getActiveIndex() {
    return _activeIndex;
  }

  function setActiveIndex(index) {
    _activeIndex = index;
  }

  // ── Add unsaved question ─────────────────────────────
  // Adds a blank template question marked as unsaved (_unsaved: true)
  // Returns the new index

  function addUnsavedQuestion(type) {
    const template = EditorConfig.DEFAULTS[type] || { type, question: '' };
    const newQ = Object.assign({}, template, { _unsaved: true });
    _questions.push(newQ);
    _activeIndex = _questions.length - 1;
    return _activeIndex;
  }

  // ── Save / update a question at index ───────────────

  function saveQuestion(index, questionData) {
    if (index < 0 || index >= _questions.length) return;
    _questions[index] = Object.assign({}, questionData, { _unsaved: false });
    _reassignIds();
  }

  // ── Delete ───────────────────────────────────────────

  function deleteQuestion(index) {
    _questions.splice(index, 1);
    // Adjust active index
    if (_activeIndex >= _questions.length) {
      _activeIndex = _questions.length - 1;
    }
    _reassignIds();
  }

  // ── Reorder (drag-drop) ──────────────────────────────

  function reorderQuestions(from, to) {
    const moved = _questions.splice(from, 1)[0];
    _questions.splice(to, 0, moved);
    // Update active index to follow the moved card
    if (_activeIndex === from) {
      _activeIndex = to;
    }
    _reassignIds();
  }

  // ── Export (strips internal flags) ──────────────────

  function exportQuestions() {
    return _questions.map((q, i) => {
      const clean = Object.assign({}, q);
      delete clean._unsaved;
      return clean;
    });
  }

  // ── Reset ────────────────────────────────────────────

  function reset() {
    _questions   = [];
    _activeIndex = -1;
  }

  // ── Load from array (used by Load JSON + Resume Draft) ─

  function loadQuestions(arr) {
    _questions   = arr.map(q => Object.assign({}, q, { _unsaved: false }));
    _activeIndex = -1;
  }

  // ── Private: reassign IDs by position ───────────────

  function _reassignIds() {
    _questions.forEach((q, i) => {
      q.id = String(i + 1).padStart(3, '0');
    });
  }

  return {
    getQuestions,
    getQuestion,
    getActiveIndex,
    setActiveIndex,
    addUnsavedQuestion,
    saveQuestion,
    deleteQuestion,
    reorderQuestions,
    exportQuestions,
    reset,
    loadQuestions,
  };

})();