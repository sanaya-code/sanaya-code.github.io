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

  bindEvents(onPillClick, onAddClick) {
    this.component.el.addEventListener('atoms:pill-click', (e) => onPillClick(e.detail.id));
    this.component.el.addEventListener('atoms:add-click',  ()  => onAddClick());
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

  // ── ui-level response to events ───────────────────────────────────────────

  onPillClick(id) {
    this.component.highlightPill(id);
  }

  onAddClick() {
    // nothing at UI level — event handler decides what to open
  }

}