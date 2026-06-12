// components/items_panel/controller.js

class ItemsPanelController {

  constructor(mountEl) {
    this.component       = new ItemsPanelComponent();
    this.mountEl         = mountEl;
    this.atomsPanel      = null;
    this.workingSetPanel = null;
  }

  // ── setup ─────────────────────────────────────────────────────────────────

  mount() {
    this.component.createElement();
    this.component.buildLayout();
    this.mountEl.appendChild(this.component.el);

    // child controllers mount into this panel's section bodies
    this.atomsPanel      = new AtomsPanelController(this.component.getAtomsMount());
    this.workingSetPanel = new WorkingSetPanelController(this.component.getWorkingSetMount());

    this.atomsPanel.mount();
    this.workingSetPanel.mount();

    this.atomsPanel.bindCountChange((count) => this.component.setAtomsCount(count));
    this.workingSetPanel.bindCountChange((count) => this.component.setWorkingSetCount(count));
  }

  // ── event binding ─────────────────────────────────────────────────────────

  bindEvents(onAddClick) {
    this.component.el.addEventListener('items:add-click', () => onAddClick());
  }

}