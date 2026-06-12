// components/ui_composer/ui_composer.js

class UIComposer {

  constructor() {
    this._mounts = {
      itemsPanel:   document.getElementById('items-panel-mount'),
      addItemPopup: document.getElementById('add-item-popup-mount'),
      rightPanel:   document.getElementById('right-panel-mount'),
    };

    this._verifyMounts();

    this.itemsPanel   = new ItemsPanelController(this._mounts.itemsPanel);
    this.addItemPopup = new AddItemPopupController(this._mounts.addItemPopup);

    this.rightPanel = new RightPanelController(this._mounts.rightPanel);
    this.rightPanel.mount();

    this.operatorBrowser = new OperatorBrowserController(this.rightPanel.getOperatorsPane());
    this.operatorForm    = new OperatorFormController(this.rightPanel.getFormPane());
    this.sentenceBuilder = new SentenceBuilderController(this.rightPanel.getSentencePane());
  }

  mountAll() {
    this.itemsPanel.mount();
    this.addItemPopup.mount();
    this.operatorBrowser.mount();
    this.operatorForm.mount();
    this.sentenceBuilder.mount();
  }

  // convenience accessors — itemsPanel owns these child controllers
  get atomsPanel()      { return this.itemsPanel.atomsPanel; }
  get workingSetPanel() { return this.itemsPanel.workingSetPanel; }

  _verifyMounts() {
    Object.entries(this._mounts).forEach(([name, el]) => {
      if (!el) console.error(`[UIComposer] missing mount point: #${name}`);
    });
  }

}