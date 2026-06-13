// editor/state/index.js
//
// StateController is the ONLY object the rest of the app talks to.
// It delegates to QuestionState, SelectionState, and DraftState.
// No other file imports from state sub-modules directly.

const StateController = (() => {

  // ── Questions ─────────────────────────────────────────

  function getQuestion(index)  { return QuestionState.getQuestion(index);  }
  function getQuestions()      { return QuestionState.getQuestions();       }
  function getCount()          { return QuestionState.getCount();           }

  function addUnsavedQuestion(type) {
    const index = QuestionState.addUnsavedQuestion(type);
    SelectionState.startNew(index);
    return index;
  }

  function saveQuestion(index, data) {
    QuestionState.saveQuestion(index, data);
    // Persist draft automatically on every save
    DraftState.save(QuestionState.exportQuestions());
  }

  function deleteQuestion(index) {
    QuestionState.deleteQuestion(index);
  }

  function duplicateQuestion(index) {
    QuestionState.duplicateQuestion(index);
    // Persist draft — the duplicate is saved data
    DraftState.save(QuestionState.exportQuestions());
  }

  function reorderQuestions(from, to) {
    QuestionState.reorderQuestions(from, to);
  }

  function exportQuestions() {
    return QuestionState.exportQuestions();
  }

  function loadQuestions(arr) {
    QuestionState.loadQuestions(arr);
    SelectionState.reset();
  }

  function importQuestions(arr) {
    QuestionState.importQuestions(arr);
    // Auto-save draft after import
    DraftState.save(QuestionState.exportQuestions());
  }

  function reset() {
    QuestionState.reset();
    SelectionState.reset();
  }

  // ── Selection ─────────────────────────────────────────

  function selectExisting(index)   { SelectionState.selectExisting(index); }
  function startNew(index)         { SelectionState.startNew(index);        }
  function returnToView()          { SelectionState.returnToView();          }
  function getActiveIndex()        { return SelectionState.getActiveIndex(); }
  function getMode()               { return SelectionState.getMode();        }
  function canAdd()                { return SelectionState.canAdd();         }
  function canDelete()             { return SelectionState.canDelete();      }
  function canReorder()            { return SelectionState.canReorder();     }
  function isEditing()             { return SelectionState.isEditing();      }
  function isNew()                 { return SelectionState.isNew();          }
  function promptFinishEditing()   { SelectionState.promptFinishEditing();   }

  // ── Draft ─────────────────────────────────────────────

  function saveDraft() {
    DraftState.save(QuestionState.exportQuestions());
  }

  function loadDraft() {
    const questions = DraftState.load();
    if (!questions) return false;
    QuestionState.loadQuestions(questions);
    SelectionState.reset();
    return true;
  }

  function hasDraft()   { return DraftState.hasDraft(); }
  function clearDraft() { DraftState.clear();           }

  return {
    // Questions
    getQuestion, getQuestions, getCount,
    addUnsavedQuestion, saveQuestion,
    deleteQuestion, duplicateQuestion, reorderQuestions,
    exportQuestions, loadQuestions, importQuestions, reset,

    // Selection
    selectExisting, startNew, returnToView,
    getActiveIndex, getMode,
    canAdd, canDelete, canReorder,
    isEditing, isNew, promptFinishEditing,

    // Draft
    saveDraft, loadDraft, hasDraft, clearDraft,
  };

})();