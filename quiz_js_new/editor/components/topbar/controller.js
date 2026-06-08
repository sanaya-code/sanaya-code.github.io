// editor/components/topbar/controller.js

class TopbarController {

  constructor(component) {
    this._component = component;
  }

  // ── Signal binding (called by MainController) ─────────

  onAddQuestion(fn) { this._component.onAddQuestion(fn); }
  onNew(fn)         { this._component.onNew(fn);         }
  onLoadJson(fn)    { this._component.onLoadJson(fn);    }
  onExportJson(fn)  { this._component.onExportJson(fn);  }
  onImportJson(fn)  { this._component.onImportJson(fn);  }
  onFileSelected(fn){ this._component.onFileSelected(fn);}

  // ── UI state ──────────────────────────────────────────

  disableAddQuestion() { this._component.disableAddQuestion(); }
  enableAddQuestion()  { this._component.enableAddQuestion();  }

  // ── File picker ───────────────────────────────────────

  openFilePicker()   { this._component.openFilePicker();   }
  getSelectedFile()  { return this._component.getSelectedFile(); }

}