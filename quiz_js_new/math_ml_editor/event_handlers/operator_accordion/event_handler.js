// event_handlers/operator_accordion/event_handler.js

class OperatorAccordionEventHandler {

  constructor(stateController, operatorAccordionController) {
    this._state     = stateController;
    this._accordion = operatorAccordionController;

    this.onOperatorClick = this.onOperatorClick.bind(this);
    this.onSearchInput   = this.onSearchInput.bind(this);
  }

  onOperatorClick(op) {
    this._state.setSelectedOperator(op);
    this._accordion.highlightSelected(op);
    console.log('[accordion] operator selected:', op.name);
    // tab switch to form happens in step 6 (TabPanel)
  }

  onSearchInput(query) {
    // filtering is handled internally by the component
    // nothing to persist in state for now
  }

}