// editor/controller.js

const EditorController = (() => {

  // ── DOM refs ──────────────────────────────────────────
  const emptyState     = document.getElementById('empty-state');
  const shell          = document.getElementById('shell');
  const btnEsLoad      = document.getElementById('btn-es-load');
  const btnEsFresh     = document.getElementById('btn-es-fresh');
  const btnEsResume    = document.getElementById('btn-es-resume');
  const btnAddQuestion = document.getElementById('btn-add-question');
  const btnLoadJson    = document.getElementById('btn-load-json');
  const btnExportJson  = document.getElementById('btn-export-json');
  const panelMiddle    = document.getElementById('panel-middle');

  // ── Component + handler refs ──────────────────────────
  let _listHandler      = null;
  let _typeSelectorOpen = false;

  // ── Init ──────────────────────────────────────────────
  function init() {
    _checkDraft();
    _initComponents();
    _bindEvents();
  }

  // ── Draft detection ───────────────────────────────────
  function _checkDraft() {
    const hasDraft = !!localStorage.getItem(EditorConfig.STORAGE_KEY);
    if (hasDraft) {
      btnEsResume.classList.remove('hidden');
    }
  }

  // ── Wire up components + handlers ────────────────────
  function _initComponents() {
    const listEl = document.getElementById('question-list');

    // Stage 4+: pass real editorPanelHandler here
    _listHandler = new QuestionListHandler(listEl, EditorState, null);

    // Listen for delete/reorder outcomes to clear middle panel if needed
    listEl.addEventListener('question-deleted', () => {
      if (EditorState.getActiveIndex() === -1) {
        _showPlaceholder();
      }
    });
  }

  // ── Show shell, hide empty state ──────────────────────
  function _enterEditor() {
    emptyState.classList.add('hidden');
    shell.classList.remove('hidden');
    _listHandler.refresh();
  }

  // ── Middle panel helpers ──────────────────────────────
  function _showPlaceholder() {
    panelMiddle.innerHTML = `
      <div class="middle-placeholder">
        <div class="placeholder-icon">✦</div>
        <p>Click <strong>+ Add Question</strong><br>to get started</p>
      </div>
    `;
    _typeSelectorOpen = false;
  }

  function _showTypeSelector() {
    panelMiddle.innerHTML = '<type-selector></type-selector>';
    _typeSelectorOpen = true;
  }

  // ── Event bindings ────────────────────────────────────
  function _bindEvents() {

    // Empty state — Start Fresh
    btnEsFresh.addEventListener('click', () => {
      EditorState.reset();
      _enterEditor();
    });

    // Empty state — Load JSON (Stage 7)
    btnEsLoad.addEventListener('click', () => {
      console.log('[EditorController] Load JSON — Stage 7');
    });

    // Empty state — Resume Draft (Stage 5)
    btnEsResume.addEventListener('click', () => {
      console.log('[EditorController] Resume Draft — Stage 5');
      _enterEditor();
    });

    // Topbar — Load JSON (Stage 7)
    btnLoadJson.addEventListener('click', () => {
      console.log('[EditorController] Topbar Load JSON — Stage 7');
    });

    // Topbar — Export JSON (Stage 7)
    btnExportJson.addEventListener('click', () => {
      console.log('[EditorController] Topbar Export JSON — Stage 7');
    });

    // Topbar — Add Question: toggle type selector
    btnAddQuestion.addEventListener('click', () => {
      if (_typeSelectorOpen) {
        _showPlaceholder();
      } else {
        _showTypeSelector();
      }
    });

    // Type selected — add unsaved card, show stub in middle panel
    panelMiddle.addEventListener('type-selected', (e) => {
      const { type } = e.detail;
      const index    = EditorState.addUnsavedQuestion(type);
      _listHandler.refresh(index);
      _typeSelectorOpen = false;

      // Stage 4 will replace this stub with the real form
      const typeConf = EditorConfig.getType(type);
      panelMiddle.innerHTML = `
        <div class="middle-placeholder">
          <div class="placeholder-icon">📝</div>
          <p>
            <strong style="color:var(--accent)">${typeConf ? typeConf.label : type}</strong>
            form loads here in Stage 4.
          </p>
          <p style="margin-top:8px;font-size:12px">
            Question #${String(index + 1).padStart(3,'0')} added to list.
          </p>
        </div>
      `;
    });

    // Question selected from list → Stage 4 will load form
    document.getElementById('question-list')
      .addEventListener('question-selected', (e) => {
        const { index } = e.detail;
        const q = EditorState.getQuestion(index);
        console.log('[EditorController] Question selected:', index, q);
        // Stage 4: load form here
      });

  }

  return { init };

})();

// Boot
document.addEventListener('DOMContentLoaded', () => EditorController.init());