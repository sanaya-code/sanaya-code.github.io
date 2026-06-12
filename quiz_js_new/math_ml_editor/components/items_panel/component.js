// components/items_panel/component.js
// Single header + scrollable body containing two labeled sections:
// Atoms and Working Set. Child components (AtomsPanel, WorkingSetPanel)
// are mounted into the section bodies by the controller.

class ItemsPanelComponent {

  constructor() {
    this.el            = null;
    this._atomsCountEl = null;
    this._wsCountEl    = null;
    this._atomsBody    = null;
    this._wsBody       = null;
  }

  // ── build ─────────────────────────────────────────────────────────────────

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'items-panel';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'items-panel__header';
    header.innerHTML = `
      <span class="items-panel__title-text">Items</span>
      <button class="items-panel__add-btn" id="items-add-btn">+ Add</button>
    `;
    header.querySelector('#items-add-btn')
      .addEventListener('click', () => this.emitAddClick());

    const body = document.createElement('div');
    body.className = 'items-panel__body';

    const atomsSection = this._buildSection('Atoms');
    this._atomsCountEl  = atomsSection.countEl;
    this._atomsBody     = atomsSection.bodyEl;

    const wsSection = this._buildSection('Working Set');
    this._wsCountEl  = wsSection.countEl;
    this._wsBody     = wsSection.bodyEl;

    body.appendChild(atomsSection.el);
    body.appendChild(wsSection.el);

    this.el.appendChild(header);
    this.el.appendChild(body);
  }

  _buildSection(title) {
    const el = document.createElement('div');
    el.className = 'items-panel__section';

    const label = document.createElement('div');
    label.className = 'items-panel__section-label';

    const titleEl = document.createElement('span');
    titleEl.textContent = title;

    const countEl = document.createElement('span');
    countEl.className   = 'items-panel__count';
    countEl.textContent = '0';

    label.appendChild(titleEl);
    label.appendChild(countEl);

    const bodyEl = document.createElement('div');
    bodyEl.className = 'items-panel__section-body';

    el.appendChild(label);
    el.appendChild(bodyEl);

    return { el, countEl, bodyEl };
  }

  // ── public API ────────────────────────────────────────────────────────────

  getAtomsMount() { return this._atomsBody; }
  getWorkingSetMount() { return this._wsBody; }

  setAtomsCount(count) { this._atomsCountEl.textContent = count; }
  setWorkingSetCount(count) { this._wsCountEl.textContent = count; }

  // ── emit ──────────────────────────────────────────────────────────────────

  emitAddClick() {
    this.el.dispatchEvent(new CustomEvent('items:add-click', { bubbles: true }));
  }

}