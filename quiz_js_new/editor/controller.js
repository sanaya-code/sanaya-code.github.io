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

  // ── Component + handler refs ──────────────────────────
  let _listHandler   = null;
  let _panelHandler  = null;
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
    if (hasDraft) btnEsResume.classList.remove('hidden');
  }

  // ── Wire components + handlers ────────────────────────
  function _initComponents() {
    const listEl    = document.getElementById('question-list');
    const panelEl   = document.getElementById('editor-panel');
    const previewEl = document.getElementById('preview-panel');

    // Instantiate handlers — cross-wire them
    _listHandler  = new QuestionListHandler(listEl, EditorState, null);
    _panelHandler = new EditorPanelHandler(panelEl, previewEl, EditorState, _listHandler);

    // Give list handler a reference to panel handler (for card click → load form)
    _listHandler._panelHandler = _panelHandler;

    // When a question card is clicked, load its form
    listEl.addEventListener('question-selected', (e) => {
      const { index } = e.detail;
      EditorState.setActiveIndex(index);
      const q = EditorState.getQuestion(index);
      _panelHandler.loadQuestion(index, q);
    });

    // When active question is deleted, clear middle + preview
    listEl.addEventListener('question-deleted', () => {
      if (EditorState.getQuestions().length === 0) {
        _showMiddlePlaceholder();
        previewEl.clear();
      }
    });
  }

  // ── Enter editor ──────────────────────────────────────
  function _enterEditor() {
    emptyState.classList.add('hidden');
    shell.classList.remove('hidden');
    _listHandler.refresh();
    _showMiddlePlaceholder();
  }

  // ── Middle panel helpers ──────────────────────────────
  function _showMiddlePlaceholder() {
    const panelEl = document.getElementById('editor-panel');
    panelEl.innerHTML = `
      <div class="middle-placeholder">
        <div class="placeholder-icon">✦</div>
        <p>Click <strong>+ Add Question</strong><br>to get started</p>
      </div>
    `;
    _typeSelectorOpen = false;
  }

  function _showTypeSelector() {
    const panelEl = document.getElementById('editor-panel');
    panelEl.innerHTML = '<type-selector></type-selector>';

    // type-selected fires from within editor-panel
    panelEl.addEventListener('type-selected', _handleTypeSelected, { once: true });
    _typeSelectorOpen = true;
  }

  function _handleTypeSelected(e) {
    const { type }  = e.detail;
    const index     = EditorState.addUnsavedQuestion(type);
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
      console.log('[EditorController] Resume Draft — Stage 5');
      _enterEditor();
    });

    btnLoadJson.addEventListener('click', () => {
      console.log('[EditorController] Topbar Load JSON — Stage 7');
    });

    btnExportJson.addEventListener('click', () => {
      console.log('[EditorController] Topbar Export JSON — Stage 7');
    });

    btnAddQuestion.addEventListener('click', () => {
      if (_typeSelectorOpen) {
        _showMiddlePlaceholder();
      } else {
        _showTypeSelector();
      }
    });

  }

  return { init };

})();

// Boot
document.addEventListener('DOMContentLoaded', () => EditorController.init());