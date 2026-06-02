// editor/state/draft_state.js

const DraftState = (() => {

  const KEY = () => EditorConfig.STORAGE_KEY;

  // ── Save ─────────────────────────────────────────────

  function save(questions) {
    try {
      localStorage.setItem(KEY(), JSON.stringify({
        questions: questions,
        savedAt:   new Date().toISOString(),
      }));
    } catch (e) {
      console.warn('[DraftState] Save failed:', e);
    }
  }

  // ── Load ─────────────────────────────────────────────

  function load() {
    try {
      const raw = localStorage.getItem(KEY());
      if (!raw) return null;
      const draft = JSON.parse(raw);
      return Array.isArray(draft.questions) ? draft.questions : null;
    } catch (e) {
      console.warn('[DraftState] Load failed:', e);
      return null;
    }
  }

  // ── Check ────────────────────────────────────────────

  function hasDraft() {
    return !!localStorage.getItem(KEY());
  }

  // ── Clear ────────────────────────────────────────────

  function clear() {
    localStorage.removeItem(KEY());
  }

  return { save, load, hasDraft, clear };

})();