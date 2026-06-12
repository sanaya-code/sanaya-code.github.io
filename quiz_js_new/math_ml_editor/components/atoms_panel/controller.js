// components/atoms_panel/controller.js

class AtomsPanelController {

  constructor(mountEl) {
    this.component = new AtomsPanelComponent();
    this.mountEl   = mountEl;
  }

  // ── setup ─────────────────────────────────────────────────────────────────

  mount() {
    this.component.createElement();
    this.component.buildLayout();
    this.mountEl.appendChild(this.component.el);
  }

  // ── event binding ─────────────────────────────────────────────────────────

  bindEvents(onPillClick) {
    this.component.el.addEventListener('atoms:pill-click', (e) => onPillClick(e.detail.id));
  }

  bindCountChange(onCountChange) {
    this.component.el.addEventListener('atoms:count-change', (e) => onCountChange(e.detail.count));
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

}