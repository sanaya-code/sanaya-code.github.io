// main_controller.js

class MainController {

  constructor() {
    this.ui = new UIComposer();

    this.atomsPanelEventHandler =
      new AtomsPanelEventHandler(
        StateController,
        this.ui.atomsPanel
      );
  }

  init() {

    // ── mount all components ──────────────────────────
    this.ui.mountAll();

    // ── load initial data ─────────────────────────────
    this.ui.atomsPanel.load(
      StateController.getAtoms()
    );

    // ── bind event handlers ───────────────────────────
    this.ui.atomsPanel.bindEvents(
      this.atomsPanelEventHandler.onPillClick,
      this.atomsPanelEventHandler.onAddClick
    );

    console.log('[main] readyzz');
  }

}

// ── start ─────────────────────────────────────────────
const app = new MainController();
app.init();