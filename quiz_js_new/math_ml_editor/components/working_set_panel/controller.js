// WorkingSetPanel/controller.js — placeholder
// components/working_set_panel/controller.js

class WorkingSetPanelController {

  constructor(mountEl) {
    this.component = new WorkingSetPanelComponent();
    this.mountEl   = mountEl;
  }

  // ── setup ─────────────────────────────────────────────────────────────────

  mount() {
    this.component.createElement();
    this.component.buildLayout();
    this.mountEl.appendChild(this.component.el);
  }

  // ── event binding ─────────────────────────────────────────────────────────

  bindEvents(onPillClick, onDeleteClick) {
    this.component.el.addEventListener('working-set:pill-click',   (e) => onPillClick(e.detail.id));
    this.component.el.addEventListener('working-set:delete-click', (e) => onDeleteClick(e.detail.id));
  }

  // ── called by app / event handlers ───────────────────────────────────────

  load(items) {
    this.component.renderPills(items);
  }

  activateItem(id) {
    this.component.highlightPill(id);
  }

  highlightSelected(id) {
    this.component.highlightPill(id);
  }

  clearSelection() {
    this.component.clearHighlight();
  }

  append(item) {
    // re-render full list — caller passes updated list from state
  }

  remove(id) {
    // re-render full list — caller passes updated list from state
  }

}