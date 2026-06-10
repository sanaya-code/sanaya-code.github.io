// event_handlers/event_composer/event_composer.js
// Instantiates all event handlers and injects their dependencies.
// MainController gets all event handler handles from here.
// No business logic. No DOM access.

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

    // added in later steps:
    // this.workingSetPanel     = new WorkingSetPanelEventHandler(...);
    // this.operatorAccordion   = new OperatorAccordionEventHandler(...);
    // this.tabPanel            = new TabPanelEventHandler(...);
    // this.operatorForm        = new OperatorFormEventHandler(...);
  }

}