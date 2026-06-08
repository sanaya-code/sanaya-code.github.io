// editor/controller.js

class MainController {

  constructor() {
    // ── Shell DOM ref (layout wrapper only) ─────────────
    this._shell = document.getElementById('shell');

    // ── Component controllers ───────────────────────────
    this._topbarCtrl     = new TopbarController(
      new TopbarComponent(document.getElementById('topbar'))
    );
    this._emptyStateCtrl = new EmptyStateController(
      new EmptyStateComponent(document.getElementById('empty-state'))
    );
    this._listCtrl       = new QuestionListController(
      document.getElementById('question-list')
    );
    this._panelCtrl      = new EditorPanelController(
      document.getElementById('editor-panel')
    );
    this._importPanelCtrl = new ImportPanelController(
      new ImportPanelComponent(document.getElementById('import-panel'))
    );

    // ── Event handlers ──────────────────────────────────
    this._listHandler   = new QuestionListHandler(this._listCtrl, this._panelCtrl);
    this._panelHandler  = new EditorPanelHandler(this._listCtrl, this._panelCtrl);
    this._importHandler = new ImportPanelHandler(this._importPanelCtrl, this._listCtrl);
    this._topbarHandler = new TopbarHandler(
      this._topbarCtrl,
      this._emptyStateCtrl,
      this._panelCtrl,
      this._shell,
      (cb) => this._triggerFilePicker(cb),
      (qs) => this._loadQuestions(qs),
      ()   => this._exportJson(),
      (qs) => this._importHandler.openWithQuestions(qs)
    );

    // ── Boot ────────────────────────────────────────────
    this._checkDraft();
    this._bindCustomEvents();
    this._bindDomEvents();
  }

  // ── Draft detection ───────────────────────────────────

  _checkDraft() {
    if (StateController.hasDraft()) {
      this._emptyStateCtrl.showDraftButton();
    }
  }

  // ── Bind custom events from components ────────────────

  _bindCustomEvents() {
    const listEl  = document.getElementById('question-list');
    const panelEl = document.getElementById('editor-panel');

    listEl.addEventListener('question-selected', (e) =>
      this._listHandler.onQuestionSelected(e.detail.index));

    listEl.addEventListener('question-deleted', (e) =>
      this._listHandler.onQuestionDeleted(e.detail.index));

    listEl.addEventListener('question-reordered', (e) =>
      this._listHandler.onQuestionReordered(e.detail.from, e.detail.to));

    panelEl.addEventListener('question-saved', (e) =>
      this._panelHandler.onQuestionSaved(e.detail.index, e.detail.question));

    panelEl.addEventListener('question-closed', (e) =>
      this._panelHandler.onQuestionClosed(e.detail.isNew, e.detail.index));

    panelEl.addEventListener('type-selected', (e) =>
      this._panelHandler.onTypeSelected(e.detail.type));

    panelEl.addEventListener('type-selector-closed', () =>
      this._panelHandler.onTypeSelectorClosed());
  }

  // ── Enter editor ──────────────────────────────────────

  _enterEditor() {
    this._emptyStateCtrl.hide();
    this._shell.classList.remove('hidden');
    this._listCtrl.refresh();
    this._panelCtrl.clear();
  }

  // ── Load JSON ─────────────────────────────────────────

  _triggerFilePicker(onSuccess) {
    this._topbarCtrl.onFileSelected((e) => {
      const file = e.target.files[0];
      if (!file) return;
      JsonLoader.loadFromFile(file)
        .then((questions) => onSuccess(questions))
        .catch((err) => this._emptyStateCtrl.showError(err.message));
    });
    this._topbarCtrl.openFilePicker();
  }

  _loadQuestions(questions) {
    StateController.loadQuestions(questions);
    this._emptyStateCtrl.hideError();
    this._enterEditor();
  }

  // ── Resume draft ──────────────────────────────────────

  _resumeDraft() {
    const ok = StateController.loadDraft();
    if (ok) {
      this._enterEditor();
    } else {
      this._emptyStateCtrl.showError('Failed to resume draft.');
    }
  }

  // ── Export ────────────────────────────────────────────

  _exportJson() {
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

  // ── Bind DOM events ───────────────────────────────────

  _bindDomEvents() {

    this._emptyStateCtrl.onFresh(() => {
      StateController.reset();
      this._emptyStateCtrl.hideError();
      this._enterEditor();
    });

    this._emptyStateCtrl.onLoad(() => {
      this._emptyStateCtrl.hideError();
      this._triggerFilePicker((q) => this._loadQuestions(q));
    });

    this._emptyStateCtrl.onResume(() => this._resumeDraft());

  }

}


document.addEventListener('DOMContentLoaded', () => {
    window.obj = new MainController();
});