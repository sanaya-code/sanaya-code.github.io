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
    this.ui.workingSetPanel.load(StateController.getExpressions());

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

    this.ui.operatorBrowser.bindEvents(
      this.events.operatorBrowser.onOperatorClick,
      this.events.operatorBrowser.onSearchInput
    );

    this.ui.operatorForm.bindEvents(
      this.events.operatorForm.onSlotClick,
      this.events.operatorForm.onSlotClear,
      this.events.operatorForm.onApply
    );

    this.ui.workingSetPanel.bindEvents(
      this.events.workingSetPanel.onPillClick,
      this.events.workingSetPanel.onDeleteClick
    );

    this.ui.sentenceBuilder.bindEvents(
      this.events.sentenceBuilder.onAddText,
      this.events.sentenceBuilder.onAddSpace,
      this.events.sentenceBuilder.onDeleteLast,
      this.events.sentenceBuilder.onMathmlModeToggle,
      this.events.sentenceBuilder.onCopy
    );

    console.log('[main] ready');
  }

}

const app = new MainController();
app.init();