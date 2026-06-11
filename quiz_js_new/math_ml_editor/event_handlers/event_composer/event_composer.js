// event_handlers/event_composer/event_composer.js

class EventComposer {

  constructor(ui, stateController) {
    this.atomsPanel = new AtomsPanelEventHandler(
      stateController,
      ui.atomsPanel,
      ui.addItemPopup,
      ui.operatorForm
    );

    this.addItemPopup = new AddItemPopupEventHandler(
      stateController,
      ui.atomsPanel,
      ui.addItemPopup
    );

    this.rightPanel = new RightPanelEventHandler(
      stateController,
      ui.rightPanel
    );

    this.operatorBrowser = new OperatorBrowserEventHandler(
      stateController,
      ui.operatorBrowser,
      ui.rightPanel,
      ui.operatorForm
    );

    this.operatorForm = new OperatorFormEventHandler(
      stateController,
      ui.operatorForm,
      ui.workingSetPanel
    );

    this.workingSetPanel = new WorkingSetPanelEventHandler(
      stateController,
      ui.workingSetPanel,
      ui.operatorForm
    );
  }

}