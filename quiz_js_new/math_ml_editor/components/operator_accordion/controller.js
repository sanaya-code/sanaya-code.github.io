// components/operator_accordion/controller.js

class OperatorAccordionController {

  constructor(mountEl) {
    this.component = new OperatorAccordionComponent();
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
    this.component.el.addEventListener('accordion:op-click', (e) => onOperatorClick(e.detail.op));
    this.component.el.addEventListener('accordion:search',   (e) => onSearchInput(e.detail.query));
  }

  // ── called by app / event handlers ───────────────────────────────────────

  load(groups) {
    this.component.renderGroups(groups);
  }

  highlightSelected(op) {
    this.component.highlightOperator(op.name);
  }

  clearSelection() {
    this.component.highlightOperator(null);
  }

  onOperatorClick(op) {
    this.component.highlightOperator(op.name);
  }

  onSearchInput(query) {
    this.component.filterItems(query);
  }

}