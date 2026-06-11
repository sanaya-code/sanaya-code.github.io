// components/add_item_popup/component.js

class AddItemPopupComponent {

  constructor() {
    this.el        = null;
    this.overlay   = null;
    this.nameInput = null;
  }

  // ── build ─────────────────────────────────────────────────────────────────

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'add-item-popup';
    this.el.style.display = 'none';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML = '';

    this.overlay = document.createElement('div');
    this.overlay.className = 'add-item-popup__overlay';

    const box = document.createElement('div');
    box.className = 'add-item-popup__box';
    box.innerHTML = `
      <div class="add-item-popup__title">Add Atom</div>
      <label class="add-item-popup__label">Name / symbol</label>
      <input class="add-item-popup__input" id="popup-name-input"
             type="text" placeholder="e.g. x₄, λ, 42" autocomplete="off" />
      <div class="add-item-popup__actions">
        <button class="add-item-popup__btn-cancel" id="popup-cancel-btn">Cancel</button>
        <button class="add-item-popup__btn-add"    id="popup-add-btn">Add</button>
      </div>
    `;

    this.nameInput = box.querySelector('#popup-name-input');

    box.querySelector('#popup-cancel-btn')
      .addEventListener('click', () => this.emitCancel());

    box.querySelector('#popup-add-btn')
      .addEventListener('click', () => this._handleSubmit());

    this.nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')  this._handleSubmit();
      if (e.key === 'Escape') this.emitCancel();
    });

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.emitCancel();
    });

    this.overlay.appendChild(box);
    this.el.appendChild(this.overlay);
  }

  // ── internal ──────────────────────────────────────────────────────────────

  _handleSubmit() {
    const name = this.nameInput.value.trim();
    if (!name) { this.nameInput.focus(); return; }
    this.emitSubmit(name);
  }

  // ── public API ────────────────────────────────────────────────────────────

  open() {
    this.el.style.display = 'block';
    setTimeout(() => this.nameInput.focus(), 50);
  }

  close() {
    this.el.style.display = 'none';
  }

  clearForm() {
    this.nameInput.value = '';
  }

  // ── emit ──────────────────────────────────────────────────────────────────

  emitSubmit(name) {
    this.el.dispatchEvent(new CustomEvent('popup:submit', {
      bubbles: true,
      detail: { name }
    }));
  }

  emitCancel() {
    this.el.dispatchEvent(new CustomEvent('popup:cancel', { bubbles: true }));
  }

}