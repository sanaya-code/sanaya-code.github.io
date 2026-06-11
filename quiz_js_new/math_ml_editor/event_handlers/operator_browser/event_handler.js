// event_handlers/operator_browser/event_handler.js

class OperatorBrowserEventHandler {

  constructor(stateController, operatorBrowserController, rightPanelController, operatorFormController) {
    this._state       = stateController;
    this._browser     = operatorBrowserController;
    this._rightPanel  = rightPanelController;
    this._form        = operatorFormController;

    this.onOperatorClick = this.onOperatorClick.bind(this);
    this.onSearchInput   = this.onSearchInput.bind(this);
  }

  onOperatorClick(op) {
    this._state.setSelectedOperator(op);
    this._browser.highlightSelected(op);
    this._form.reset(op);
    this._rightPanel.showFormView();
  }

  onSearchInput(query) {
    // filtering handled internally by component
  }

}