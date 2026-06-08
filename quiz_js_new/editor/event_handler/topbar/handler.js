// editor/event_handler/topbar/handler.js

class TopbarHandler {

  constructor(topbarCtrl, emptyStateCtrl, panelCtrl, shell, triggerFilePicker, loadQuestions, exportJson, openImportPanel) {
    this._topbarCtrl        = topbarCtrl;
    this._emptyStateCtrl    = emptyStateCtrl;
    this._panelCtrl         = panelCtrl;
    this._shell             = shell;
    this._triggerFilePicker = triggerFilePicker;
    this._loadQuestions     = loadQuestions;
    this._exportJson        = exportJson;
    this._openImportPanel   = openImportPanel;
    this._bindEvents();
  }

  // ── Bind all topbar events ────────────────────────────

  _bindEvents() {
    this._topbarCtrl.onNew(()          => this._onNew());
    this._topbarCtrl.onLoadJson(()     => this._onLoadJson());
    this._topbarCtrl.onExportJson(()   => this._onExportJson());
    this._topbarCtrl.onAddQuestion(()  => this._onAddQuestion());
    this._topbarCtrl.onImportJson(()   => this._onImportJson());
  }

  // ── Handlers ─────────────────────────────────────────

  _onNew() {
    if (StateController.getCount() > 0) {
      if (!confirm(
        'Start a new file?\nAll current questions will be cleared.'
      )) return;
    }
    StateController.reset();
    StateController.clearDraft();
    this._emptyStateCtrl.hideDraftButton();
    this._emptyStateCtrl.hideError();
    this._emptyStateCtrl.show();
    this._shell.classList.add('hidden');
  }

  _onLoadJson() {
    this._triggerFilePicker((questions) => {
      if (StateController.getCount() > 0) {
        if (!confirm(
          'Loading a new file will replace your current questions.\n' +
          'Unsaved changes will be lost. Continue?'
        )) return;
      }
      this._loadQuestions(questions);
    });
  }

  _onExportJson() {
    this._exportJson();
  }

  _onAddQuestion() {
    if (!StateController.canAdd()) {
      StateController.promptFinishEditing();
      return;
    }
    this._panelCtrl.showTypeSelector();
  }

  _onImportJson() {
    // Do nothing if no file is loaded yet (shell not visible)
    if (this._shell.classList.contains('hidden')) return;

    this._triggerFilePicker((questions) => {
      if (questions.length === 0) {
        alert('No questions found in this file.');
        return;
      }
      this._openImportPanel(questions);
    });
  }

}