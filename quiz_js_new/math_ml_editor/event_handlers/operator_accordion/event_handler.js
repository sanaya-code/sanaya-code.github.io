// event_handlers/operator_accordion/event_handler.js

class OperatorAccordionEventHandler {

  constructor(stateController, operatorAccordionController, rightPanelController, operatorFormController) {
    this._state      = stateController;
    this._accordion  = operatorAccordionController;
    this._rightPanel = rightPanelController;
    this._form       = operatorFormController;

    this.onOperatorClick = this.onOperatorClick.bind(this);
    this.onSearchInput   = this.onSearchInput.bind(this);
  }

  onOperatorClick(op) {
    this._state.setSelectedOperator(op);
    this._accordion.highlightSelected(op);
    this._form.reset(op);
    this._rightPanel.showFormView();
  }

  onSearchInput(query) {
    // filtering handled internally by component
  }

}