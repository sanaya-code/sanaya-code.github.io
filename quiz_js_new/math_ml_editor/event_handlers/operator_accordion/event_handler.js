// event_handlers/operator_accordion/event_handler.js

class OperatorAccordionEventHandler {

  constructor(stateController, operatorAccordionController, rightPanelController) {
    this._state     = stateController;
    this._accordion = operatorAccordionController;
    this._rightPanel = rightPanelController;

    this.onOperatorClick = this.onOperatorClick.bind(this);
    this.onSearchInput   = this.onSearchInput.bind(this);
  }

  onOperatorClick(op) {
    this._state.setSelectedOperator(op);
    this._accordion.highlightSelected(op);
    this._rightPanel.showFormView();
  }

  onSearchInput(query) {
    // filtering handled internally by component
  }

}