// editor/event_handler/import_panel/handler.js

class ImportPanelHandler {

  constructor(importPanelCtrl, listCtrl) {
    this._importPanelCtrl = importPanelCtrl;
    this._listCtrl        = listCtrl;
    this._bindEvents();
  }

  // ── Open panel with questions from file ──────────────

  openWithQuestions(questions) {
    this._importPanelCtrl.show(questions);
  }

  // ── Events ───────────────────────────────────────────

  _bindEvents() {

    // import-confirmed: append selected questions to state + refresh list
    this._importPanelCtrl.onConfirm((e) => {
      const questions = e.detail.questions;
      if (!questions || questions.length === 0) return;

      StateController.importQuestions(questions);
      this._listCtrl.refresh();
      this._importPanelCtrl.hide();
    });

    // import-cancelled: just close the panel
    this._importPanelCtrl.onCancel(() => {
      this._importPanelCtrl.hide();
    });

  }

}