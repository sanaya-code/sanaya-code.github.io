// components/ui_composer/ui_composer.js
// Instantiates all component controllers and exposes them as a single object.
// main_controller.js gets all controller handles from here.
// No business logic. No event handling. No state access.

class UIComposer {

  constructor() {
    this.atomsPanel      = new AtomsPanelController();

    // added in later steps:
    // this.workingSetPanel = new WorkingSetPanelController();
    // this.addItemPopup    = new AddItemPopupController();
    // this.rightPanel      = new RightPanelController();
    // this.tabPanel        = new TabPanelController();
    // this.operatorAccordion = new OperatorAccordionController();
    // this.operatorForm    = new OperatorFormController();
  }

  mountAll() {
    this.atomsPanel.mount();

    // added in later steps:
    // this.workingSetPanel.mount();
    // this.addItemPopup.mount();
    // this.rightPanel.mount();
  }

}