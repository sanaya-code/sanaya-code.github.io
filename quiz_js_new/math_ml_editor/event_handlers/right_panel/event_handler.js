// event_handlers/right_panel/event_handler.js

class RightPanelEventHandler {

  constructor(stateController, rightPanelController) {
    this._state      = stateController;
    this._rightPanel = rightPanelController;

    this.onTabClick = this.onTabClick.bind(this);
  }

  onTabClick(tabId) {
    if (tabId === 'operators') {
      this._rightPanel.showOperatorsView();
    } else if (tabId === 'form') {
      this._rightPanel.showFormView();
    } else if (tabId === 'sentence') {
      this._rightPanel.showSentenceView();
    }
  }

}