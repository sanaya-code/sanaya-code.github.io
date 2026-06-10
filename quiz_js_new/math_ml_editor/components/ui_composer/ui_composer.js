// components/ui_composer/ui_composer.js

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

    // RightPanel mounts first — its panes become mount points for children
    this.rightPanel   = new RightPanelController(this._mounts.rightPanel);
    this.rightPanel.mount();

    this.operatorAccordion = new OperatorAccordionController(this.rightPanel.getOperatorsPane());

    // form pane placeholder until step 7
    this._mountFormPlaceholder(this.rightPanel.getFormPane());

    // added in later steps:
    // this.workingSetPanel = new WorkingSetPanelController(this._mounts.workingSet);
    // this.operatorForm    = new OperatorFormController(this.rightPanel.getFormPane());
  }

  mountAll() {
    this.atomsPanel.mount();
    this.addItemPopup.mount();
    this.operatorAccordion.mount();

    // added in later steps:
    // this.workingSetPanel.mount();
    // this.operatorForm.mount();
  }

  // ── private ───────────────────────────────────────────────────────────────

  _mountFormPlaceholder(pane) {
    pane.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;
                  height:100%;font-size:12px;color:#aaa;">
        OperatorForm — coming in Step 7
      </div>`;
  }

  _verifyMounts() {
    Object.entries(this._mounts).forEach(([name, el]) => {
      if (!el) console.error(`[UIComposer] missing mount point: #${name}`);
    });
  }

}