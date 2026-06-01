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

  // ── Handler refs ──────────────────────────────────────
  let _listHandler      = null;
  let _panelHandler     = null;
  let _typeSelectorOpen = false;

  // ── Init ──────────────────────────────────────────────
  function init() {
    _checkDraft();
    _initComponents();
    _bindEvents();
  }

  // ── Draft detection ───────────────────────────────────
  function _checkDraft() {
    if (localStorage.getItem(EditorConfig.STORAGE_KEY)) {
      btnEsResume.classList.remove('hidden');
    }
  }

  // ── Wire components + handlers ────────────────────────
  function _initComponents() {
    const listEl  = document.getElementById('question-list');
    const panelEl = document.getElementById('editor-panel');

    _listHandler  = new QuestionListHandler(listEl, EditorState, null);
    _panelHandler = new EditorPanelHandler(panelEl, EditorState, _listHandler);
    _listHandler._panelHandler = _panelHandler;

    // Card selected → load question into editor panel
    listEl.addEventListener('question-selected', (e) => {
      const { index } = e.detail;
      EditorState.setActiveIndex(index);
      _panelHandler.loadQuestion(index, EditorState.getQuestion(index));
    });

    // Last question deleted → show placeholder
    listEl.addEventListener('question-deleted', () => {
      if (EditorState.getQuestions().length === 0) {
        document.getElementById('editor-panel').clear();
      }
    });
  }

  // ── Enter editor ──────────────────────────────────────
  function _enterEditor() {
    emptyState.classList.add('hidden');
    shell.classList.remove('hidden');
    _listHandler.refresh();
    document.getElementById('editor-panel').clear();
  }

  // ── Type selector ─────────────────────────────────────
  function _showTypeSelector() {
    const panelEl = document.getElementById('editor-panel');
    panelEl.innerHTML = '<type-selector></type-selector>';
    panelEl.addEventListener('type-selected', _handleTypeSelected, { once: true });
    _typeSelectorOpen = true;
  }

  function _showEditorPlaceholder() {
    document.getElementById('editor-panel').clear();
    _typeSelectorOpen = false;
  }

  function _handleTypeSelected(e) {
    const { type } = e.detail;
    const index    = EditorState.addUnsavedQuestion(type);
    _listHandler.refresh(index);
    _panelHandler.loadNewQuestion(type, index);
    _typeSelectorOpen = false;
  }

  // ── Event bindings ────────────────────────────────────
  function _bindEvents() {

    btnEsFresh.addEventListener('click', () => {
      EditorState.reset();
      _enterEditor();
    });

    btnEsLoad.addEventListener('click', () => {
      console.log('[EditorController] Load JSON — Stage 7');
    });

    btnEsResume.addEventListener('click', () => {
      console.log('[EditorController] Resume Draft — Stage 7');
      _enterEditor();
    });

    btnLoadJson.addEventListener('click', () => {
      console.log('[EditorController] Topbar Load JSON — Stage 7');
    });

    btnExportJson.addEventListener('click', () => {
      console.log('[EditorController] Topbar Export JSON — Stage 7');
    });

    btnAddQuestion.addEventListener('click', () => {
      _typeSelectorOpen ? _showEditorPlaceholder() : _showTypeSelector();
    });

  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', () => EditorController.init());