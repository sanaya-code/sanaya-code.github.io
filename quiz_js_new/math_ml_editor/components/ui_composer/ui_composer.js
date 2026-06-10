// components/ui_composer/ui_composer.js
// Owns all DOM mount point lookups.
// Instantiates all controllers and injects their mount elements.
// No business logic. No event handling. No state access.

class UIComposer {

  constructor() {
    // ── resolve mount points ───────────────────────────────────────────────
    this._mounts = {
      atomsPanel:   document.getElementById('atoms-panel-mount'),
      workingSet:   document.getElementById('working-set-panel-mount'),
      addItemPopup: document.getElementById('add-item-popup-mount'),
      rightPanel:   document.getElementById('right-panel-mount'),
    };

    this._verifyMounts();

    // ── instantiate controllers ────────────────────────────────────────────
    this.atomsPanel   = new AtomsPanelController(this._mounts.atomsPanel);
    this.addItemPopup = new AddItemPopupController(this._mounts.addItemPopup);

    // added in later steps:
    // this.workingSetPanel   = new WorkingSetPanelController(this._mounts.workingSet);
    // this.rightPanel        = new RightPanelController(this._mounts.rightPanel);
    // this.tabPanel          = new TabPanelController(...);
    // this.operatorAccordion = new OperatorAccordionController(...);
    // this.operatorForm      = new OperatorFormController(...);
  }

  mountAll() {
    this.atomsPanel.mount();
    this.addItemPopup.mount();

    // added in later steps:
    // this.workingSetPanel.mount();
    // this.rightPanel.mount();
  }

  // ── private ───────────────────────────────────────────────────────────────

  _verifyMounts() {
    Object.entries(this._mounts).forEach(([name, el]) => {
      if (!el) console.error(`[UIComposer] missing mount point: #${name}`);
    });
  }

}