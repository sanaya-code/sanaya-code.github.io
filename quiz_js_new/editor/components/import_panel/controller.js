// editor/components/import_panel/controller.js

class ImportPanelController {

  constructor(component) {
    this._component = component;
  }

  // ── Called by ImportPanelHandler ─────────────────────

  show(questions) {
    this._component.show(questions);
  }

  hide() {
    this._component.hide();
  }

  getSelectedQuestions() {
    return this._component.getSelectedQuestions();
  }

  // ── Signal bindings (called by MainController) ───────

  onConfirm(fn) { this._component.onConfirm(fn); }
  onCancel(fn)  { this._component.onCancel(fn);  }

}