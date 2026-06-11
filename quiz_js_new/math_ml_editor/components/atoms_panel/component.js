// components/atoms_panel/component.js
// Dumb renderer. Creates DOM, renders pills, emits events.
// No logic. No state access.

class AtomsPanelComponent {

  constructor() {
    this.el       = null;
    this.header   = null;
    this.pillWrap = null;
  }

  // ── build ────────────────────────────────────────────────────────────────

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'atoms-panel';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML = '';

    this.header = document.createElement('div');
    this.header.className = 'atoms-panel__header';
    this.header.innerHTML = `
      <span class="atoms-panel__title">
        <span class="atoms-panel__title-text">Atoms</span>
        <span class="atoms-panel__count" id="atoms-count">0</span>
      </span>
      <button class="atoms-panel__add-btn" id="atoms-add-btn">+ Add</button>
    `;

    this.pillWrap = document.createElement('div');
    this.pillWrap.className = 'atoms-panel__pills';
    this.pillWrap.id = 'atoms-pill-wrap';

    this.el.appendChild(this.header);
    this.el.appendChild(this.pillWrap);

    this.header.querySelector('#atoms-add-btn')
      .addEventListener('click', () => this.emitAddClick());
  }

  // ── render ───────────────────────────────────────────────────────────────

  renderPills(nodes) {
    this.pillWrap.innerHTML = '';
    nodes.forEach(node => {
      const pill = document.createElement('span');
      pill.className  = 'atoms-panel__pill';
      pill.dataset.id = node.id;
      pill.innerHTML  = node.getPreview();
      pill.addEventListener('click', () => this.emitPillClick(node.id));
      this.pillWrap.appendChild(pill);
    });

    const countEl = this.el.querySelector('#atoms-count');
    if (countEl) countEl.textContent = nodes.length;
  }

  highlightPill(id) {
    this.pillWrap.querySelectorAll('.atoms-panel__pill').forEach(pill => {
      pill.classList.toggle('atoms-panel__pill--selected', pill.dataset.id === id);
    });
  }

  clearHighlight() {
    this.pillWrap.querySelectorAll('.atoms-panel__pill').forEach(pill => {
      pill.classList.remove('atoms-panel__pill--selected');
    });
  }

  // ── emit ─────────────────────────────────────────────────────────────────

  emitAddClick() {
    this.el.dispatchEvent(new CustomEvent('atoms:add-click', { bubbles: true }));
  }

  emitPillClick(id) {
    this.el.dispatchEvent(new CustomEvent('atoms:pill-click', {
      bubbles: true,
      detail: { id }
    }));
  }

}