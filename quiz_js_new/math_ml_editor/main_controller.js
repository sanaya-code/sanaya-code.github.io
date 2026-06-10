// main_controller.js

class MainController {

  constructor() {
    this.ui     = new UIComposer();
    this.events = new EventComposer(this.ui, StateController);
  }

  init() {

    // ── mount all components ──────────────────────────
    this.ui.mountAll();

    // ── load initial data ─────────────────────────────
    this.ui.atomsPanel.load(StateController.getAtoms());

    // ── bind event handlers ───────────────────────────
    this.ui.atomsPanel.bindEvents(
      this.events.atomsPanel.onPillClick,
      this.events.atomsPanel.onAddClick
    );

    this.ui.addItemPopup.bindEvents(
      this.events.addItemPopup.onSubmit,
      this.events.addItemPopup.onCancel
    );

    this.ui.rightPanel.bindEvents(
      this.events.rightPanel.onTabClick
    );

    this.ui.operatorAccordion.bindEvents(
      this.events.operatorAccordion.onOperatorClick,
      this.events.operatorAccordion.onSearchInput
    );

    this.ui.operatorForm.bindEvents(
      this.events.operatorForm.onSlotClick,
      this.events.operatorForm.onSlotClear,
      this.events.operatorForm.onApply
    );

    console.log('[main] ready');
  }

}

const app = new MainController();
app.init();