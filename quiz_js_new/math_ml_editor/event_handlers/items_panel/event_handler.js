// event_handlers/items_panel/event_handler.js

class ItemsPanelEventHandler {

  constructor(stateController, addItemPopupController) {
    this._state = stateController;
    this._popup = addItemPopupController;

    this.onAddClick = this.onAddClick.bind(this);
  }

  onAddClick() {
    this._popup.show();
  }

}