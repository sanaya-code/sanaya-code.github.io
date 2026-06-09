// main_controller.js
// Entry point. Instantiates UIComposer, loads data, binds event handlers.
// No DOM queries. No UI logic. No business logic.

class MainController {

  constructor() {
    this.ui = new UIComposer();
  }

  init() {
    // ── mount all components ───────────────────────────────────────────────
    this.ui.mountAll();

    // ── load initial data ──────────────────────────────────────────────────
    this.ui.atomsPanel.load(StateController.getAtoms());

    // ── bind event handlers ────────────────────────────────────────────────
    this.ui.atomsPanel.bindEvents(
      AtomsPanelEventHandler.onPillClick,
      AtomsPanelEventHandler.onAddClick
    );

    console.log('[main] readyyy');
  }

}

// ── start ─────────────────────────────────────────────────────────────────────
const app = new MainController();
app.init();