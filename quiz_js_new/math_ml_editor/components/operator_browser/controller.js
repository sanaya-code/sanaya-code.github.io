// components/operator_browser/controller.js

class OperatorBrowserController {

  constructor(mountEl) {
    this.component = new OperatorBrowserComponent();
    this.mountEl   = mountEl;
  }

  // ── setup ─────────────────────────────────────────────────────────────────

  mount() {
    this.component.createElement();
    this.component.buildLayout();
    this.mountEl.appendChild(this.component.el);
  }

  // ── event binding ─────────────────────────────────────────────────────────

  bindEvents(onOperatorClick, onSearchInput) {
    this.component.el.addEventListener('browser:op-click', (e) => onOperatorClick(e.detail.op));
    this.component.el.addEventListener('browser:search',   (e) => onSearchInput(e.detail.query));
  }

  // ── called by app / event handlers ───────────────────────────────────────

  highlightSelected(op) {
    this.component.highlightOperator(op.name);
  }

  clearSelection() {
    this.component.highlightOperator(null);
  }

}