// editor/components/status_bar/controller.js

class StatusBarController {

  constructor(component) {
    this._component = component;
  }

  // ── Show ─────────────────────────────────────────────

  show(message, type = 'success', duration = 1800) {
    this._component.show(message, type, duration);
  }

}