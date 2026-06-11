// components/ui_composer/ui_composer.js

class UIComposer {

  constructor() {
    this._mounts = {
      atomsPanel:   document.getElementById('atoms-panel-mount'),
      workingSet:   document.getElementById('working-set-panel-mount'),
      addItemPopup: document.getElementById('add-item-popup-mount'),
      rightPanel:   document.getElementById('right-panel-mount'),
    };

    this._verifyMounts();

    this.atomsPanel      = new AtomsPanelController(this._mounts.atomsPanel);
    this.addItemPopup    = new AddItemPopupController(this._mounts.addItemPopup);
    this.workingSetPanel = new WorkingSetPanelController(this._mounts.workingSet);

    this.rightPanel = new RightPanelController(this._mounts.rightPanel);
    this.rightPanel.mount();

    this.operatorBrowser  = new OperatorBrowserController(this.rightPanel.getOperatorsPane());
    this.operatorForm     = new OperatorFormController(this.rightPanel.getFormPane());
    this.sentenceBuilder  = new SentenceBuilderController(this.rightPanel.getSentencePane());
  }

  mountAll() {
    this.atomsPanel.mount();
    this.addItemPopup.mount();
    this.workingSetPanel.mount();
    this.operatorBrowser.mount();
    this.operatorForm.mount();
    this.sentenceBuilder.mount();
  }

  _verifyMounts() {
    Object.entries(this._mounts).forEach(([name, el]) => {
      if (!el) console.error(`[UIComposer] missing mount point: #${name}`);
    });
  }

}