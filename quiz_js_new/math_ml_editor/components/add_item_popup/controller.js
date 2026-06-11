// components/add_item_popup/controller.js

class AddItemPopupController {

  constructor(mountEl) {
    this.component = new AddItemPopupComponent();
    this.mountEl   = mountEl;
  }

  // ── setup ─────────────────────────────────────────────────────────────────

  mount() {
    this.component.createElement();
    this.component.buildLayout();
    this.mountEl.appendChild(this.component.el);
  }

  // ── event binding ─────────────────────────────────────────────────────────

  bindEvents(onSubmit, onSubmitAll, onCancel) {
    this.component.el.addEventListener('popup:submit',     (e) => onSubmit(e.detail.name, e.detail.type));
    this.component.el.addEventListener('popup:submit-all', (e) => onSubmitAll(e.detail.raw, e.detail.type));
    this.component.el.addEventListener('popup:cancel',     ()  => onCancel());
  }

  // ── called by app / event handlers ───────────────────────────────────────

  show() {
    this.component.open();
  }

  hide() {
    this.component.close();
    this.component.clearForm();
  }

}