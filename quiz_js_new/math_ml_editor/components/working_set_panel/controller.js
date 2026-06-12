// components/working_set_panel/controller.js

class WorkingSetPanelController {

  constructor(mountEl) {
    this.component = new WorkingSetPanelComponent();
    this.mountEl   = mountEl;
  }

  mount() {
    this.component.createElement();
    this.component.buildLayout();
    this.mountEl.appendChild(this.component.el);
  }

  bindEvents(onPillClick, onDeleteClick) {
    this.component.el.addEventListener('working-set:pill-click',   (e) => onPillClick(e.detail.id));
    this.component.el.addEventListener('working-set:delete-click', (e) => onDeleteClick(e.detail.id));
  }

  bindCountChange(onCountChange) {
    this.component.el.addEventListener('working-set:count-change', (e) => onCountChange(e.detail.count));
  }

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