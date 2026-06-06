// editor/components/empty_state/controller.js

class EmptyStateController {

  constructor(component) {
    this._component = component;
  }

  // ── Signal binding (called by MainController) ─────────

  onLoad(fn)   { this._component.onLoad(fn);   }
  onFresh(fn)  { this._component.onFresh(fn);  }
  onResume(fn) { this._component.onResume(fn); }

  // ── UI state ──────────────────────────────────────────

  show()             { this._component.show();             }
  hide()             { this._component.hide();             }
  showDraftButton()  { this._component.showDraftButton();  }
  hideDraftButton()  { this._component.hideDraftButton();  }
  showError(msg)     { this._component.showError(msg);     }
  hideError()        { this._component.hideError();        }

}