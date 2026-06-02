// editor/state/selection_state.js

const SelectionState = (() => {

  let _activeIndex = -1;
  let _mode        = 'view';   // 'view' | 'edit' | 'new'

  // ── Transitions ──────────────────────────────────────

  function selectExisting(index) {
    _activeIndex = index;
    _mode        = 'edit';
  }

  function startNew(index) {
    _activeIndex = index;
    _mode        = 'new';
  }

  function returnToView() {
    _activeIndex = -1;
    _mode        = 'view';
  }

  // ── Getters ──────────────────────────────────────────

  function getActiveIndex() { return _activeIndex; }
  function getMode()        { return _mode;         }

  // ── Guards ───────────────────────────────────────────

  function canReorder() { return _mode === 'view'; }
  function canDelete()  { return _mode === 'view'; }
  function canAdd()     { return _mode === 'view'; }
  function isEditing()  { return _mode === 'edit' || _mode === 'new'; }
  function isNew()      { return _mode === 'new';  }

  // ── User prompt ──────────────────────────────────────

  function promptFinishEditing() {
    alert('You are currently editing a question.\nPlease Save or Close it first.');
  }

  function reset() {
    _activeIndex = -1;
    _mode        = 'view';
  }

  return {
    selectExisting,
    startNew,
    returnToView,
    reset,
    getActiveIndex,
    getMode,
    canReorder,
    canDelete,
    canAdd,
    isEditing,
    isNew,
    promptFinishEditing,
  };

})();