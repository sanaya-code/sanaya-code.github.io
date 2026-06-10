// event_handlers/event_composer/event_composer.js

class EventComposer {

  constructor(ui, stateController) {
    this.atomsPanel = new AtomsPanelEventHandler(
      stateController,
      ui.atomsPanel,
      ui.addItemPopup
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

    this.operatorAccordion = new OperatorAccordionEventHandler(
      stateController,
      ui.operatorAccordion,
      ui.rightPanel
    );

    // added in later steps:
    // this.workingSetPanel = new WorkingSetPanelEventHandler(...);
    // this.operatorForm    = new OperatorFormEventHandler(...);
  }

}