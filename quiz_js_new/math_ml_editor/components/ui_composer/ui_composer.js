// components/ui_composer/ui_composer.js

class UIComposer {

  constructor() {
    // ── resolve mount points ───────────────────────────────────────────────
    this._mounts = {
      atomsPanel:        document.getElementById('atoms-panel-mount'),
      workingSet:        document.getElementById('working-set-panel-mount'),
      addItemPopup:      document.getElementById('add-item-popup-mount'),
      rightPanel:        document.getElementById('right-panel-mount'),
      operatorAccordion: document.getElementById('operator-accordion-mount'),
    };

    this._verifyMounts();

    // ── instantiate controllers ────────────────────────────────────────────
    this.atomsPanel        = new AtomsPanelController(this._mounts.atomsPanel);
    this.addItemPopup      = new AddItemPopupController(this._mounts.addItemPopup);
    this.operatorAccordion = new OperatorAccordionController(this._mounts.operatorAccordion);

    // added in later steps:
    // this.workingSetPanel   = new WorkingSetPanelController(this._mounts.workingSet);
    // this.rightPanel        = new RightPanelController(this._mounts.rightPanel);
    // this.tabPanel          = new TabPanelController(...);
    // this.operatorForm      = new OperatorFormController(...);
  }

  mountAll() {
    this.atomsPanel.mount();
    this.addItemPopup.mount();
    this.operatorAccordion.mount();

    // added in later steps:
    // this.workingSetPanel.mount();
    // this.rightPanel.mount();
  }

  _verifyMounts() {
    Object.entries(this._mounts).forEach(([name, el]) => {
      if (!el) console.error(`[UIComposer] missing mount point: #${name}`);
    });
  }

}