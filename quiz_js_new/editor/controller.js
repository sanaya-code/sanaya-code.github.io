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
  let _listHandler  = null;
  let _panelHandler = null;

  // ── Init ──────────────────────────────────────────────
  function init() {
    _checkDraft();
    _initComponents();
    _bindEvents();
  }

  // ── Draft detection ───────────────────────────────────
  function _checkDraft() {
    if (StateController.hasDraft()) {
      btnEsResume.classList.remove('hidden');
    }
  }

  // ── Wire components ───────────────────────────────────
  function _initComponents() {
    const listEl  = document.getElementById('question-list');
    const panelEl = document.getElementById('editor-panel');

    _listHandler  = new QuestionListHandler(listEl, null);
    _panelHandler = new EditorPanelHandler(panelEl, _listHandler);
    _listHandler._panelHandler = _panelHandler;
  }

  // ── Enter editor ──────────────────────────────────────
  function _enterEditor() {
    emptyState.classList.add('hidden');
    shell.classList.remove('hidden');
    _listHandler.refresh();
    _panelHandler.clearPanel();
  }

  // ── Type selector ─────────────────────────────────────
  function _showTypeSelector() {
    const panelEl = document.getElementById('editor-panel');
    panelEl.innerHTML = `
      <div class="ep-shell">
        <div class="ep-tabbar">
          <div class="ep-tabbar-left">
            <span style="font-size:13px;font-weight:600;
                         color:var(--text-secondary)">New Question</span>
          </div>
          <div class="ep-tabbar-right">
            <button class="ep-close-btn" id="ts-close-btn">✕ Close</button>
          </div>
        </div>
        <div class="ep-content">
          <div class="ep-form-host">
            <type-selector></type-selector>
          </div>
        </div>
      </div>`;

    panelEl.querySelector('#ts-close-btn')?.addEventListener('click', () => {
      StateController.returnToView();
      _listHandler.refresh();
      _panelHandler.clearPanel();
    });

    panelEl.addEventListener('type-selected', _handleTypeSelected, { once: true });
  }

  function _handleTypeSelected(e) {
    const { type } = e.detail;
    const index    = StateController.addUnsavedQuestion(type);
    // addUnsavedQuestion calls StateController.startNew(index)
    _listHandler.refresh();
    _panelHandler.loadNewQuestion(type, index);
  }

  // ── Load JSON ─────────────────────────────────────────
  function _triggerFilePicker(onSuccess) {
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
    StateController.loadQuestions(questions);
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
    const ok = StateController.loadDraft();
    if (ok) {
      _enterEditor();
    } else {
      _showLoadError('Failed to resume draft.');
    }
  }

  // ── Export ────────────────────────────────────────────
  function _exportJson() {
    const total     = StateController.getCount();
    const questions = StateController.exportQuestions();
    if (total === 0) {
      alert('No questions to export.');
      return;
    }
    if (questions.length === 0) {
      alert('No saved questions to export.\nSave at least one question first.');
      return;
    }
    const skipped = total - questions.length;
    if (skipped > 0) {
      const ok = confirm(
        `Exporting ${questions.length} saved question${questions.length > 1 ? 's' : ''}.\n` +
        `${skipped} unsaved question${skipped > 1 ? 's' : ''} will be excluded.\n\nContinue?`
      );
      if (!ok) return;
    }
    JsonExporter.download(questions);
  }

  // ── Events ────────────────────────────────────────────
  function _bindEvents() {

    btnEsFresh.addEventListener('click', () => {
      StateController.reset();
      _hideLoadError();
      _enterEditor();
    });

    btnEsLoad.addEventListener('click', () => {
      _hideLoadError();
      _triggerFilePicker(_loadQuestions);
    });

    btnEsResume.addEventListener('click', _resumeDraft);

    btnLoadJson.addEventListener('click', () => {
      _triggerFilePicker((questions) => {
        if (StateController.getCount() > 0) {
          if (!confirm(
            'Loading a new file will replace your current questions.\n' +
            'Unsaved changes will be lost. Continue?'
          )) return;
        }
        _loadQuestions(questions);
      });
    });

    btnExportJson.addEventListener('click', _exportJson);

    btnAddQuestion.addEventListener('click', () => {
      if (!StateController.canAdd()) {
        StateController.promptFinishEditing();
        return;
      }
      _showTypeSelector();
    });

  }

  return { init };

})();

document.addEventListener('DOMContentLoaded', () => EditorController.init());