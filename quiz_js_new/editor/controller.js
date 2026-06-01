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
  const fileInput      = document.getElementById('file-input');
  const esLoadError    = document.getElementById('es-load-error');

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
    _typeSelectorOpen = false;
  }

  // ── Load JSON helpers ─────────────────────────────────

  function _triggerFilePicker(onSuccess) {
    // Reset so same file can be re-picked
    fileInput.value = '';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const questions = await JsonLoader.loadFromFile(file);
        onSuccess(questions);
      } catch (err) {
        _showLoadError(err.message);
      }
    };
    fileInput.click();
  }

  function _loadQuestions(questions) {
    EditorState.reset();
    EditorState.loadQuestions(questions);
    _hideLoadError();
    _enterEditor();
  }

  function _showLoadError(msg) {
    esLoadError.textContent = '⚠ ' + msg;
    esLoadError.classList.remove('hidden');
  }

  function _hideLoadError() {
    esLoadError.classList.add('hidden');
    esLoadError.textContent = '';
  }

  // ── Resume draft ──────────────────────────────────────

  function _resumeDraft() {
    try {
      const raw   = localStorage.getItem(EditorConfig.STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw);
      const questions = Array.isArray(draft.questions) ? draft.questions : [];
      EditorState.reset();
      EditorState.loadQuestions(questions);
      _enterEditor();
    } catch (e) {
      _showLoadError('Failed to resume draft: ' + e.message);
    }
  }

  // ── Export ────────────────────────────────────────────

  function _exportJson() {
    const questions = EditorState.exportQuestions();
    if (questions.length === 0) {
      alert('No questions to export.');
      return;
    }
    JsonExporter.download(questions);
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

    // Empty state — Load JSON File
    btnEsLoad.addEventListener('click', () => {
      _hideLoadError();
      _triggerFilePicker(_loadQuestions);
    });

    // Empty state — Start Fresh
    btnEsFresh.addEventListener('click', () => {
      EditorState.reset();
      _hideLoadError();
      _enterEditor();
    });

    // Empty state — Resume Draft
    btnEsResume.addEventListener('click', () => {
      _resumeDraft();
    });

    // Topbar — Load JSON (available inside editor too)
    btnLoadJson.addEventListener('click', () => {
      _triggerFilePicker((questions) => {
        if (EditorState.getQuestions().length > 0) {
          if (!confirm(
            'Loading a new file will replace your current questions.\n' +
            'Unsaved changes will be lost. Continue?'
          )) return;
        }
        _loadQuestions(questions);
      });
    });

    // Topbar — Export JSON
    btnExportJson.addEventListener('click', () => {
      _exportJson();
    });

    // Topbar — Add Question
    btnAddQuestion.addEventListener('click', () => {
      _typeSelectorOpen ? _showEditorPlaceholder() : _showTypeSelector();
    });

  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', () => EditorController.init());