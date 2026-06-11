// components/working_set_panel/component.js

class WorkingSetPanelComponent {

  constructor() {
    this.el        = null;
    this._pillWrap = null;
    this._emptyEl  = null;
  }

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'working-set-panel';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'working-set-panel__header';
    header.innerHTML = `
      <span class="working-set-panel__title">
        <span class="working-set-panel__title-text">Working Set</span>
        <span class="working-set-panel__count" id="ws-count">0</span>
      </span>
    `;

    this._emptyEl = document.createElement('div');
    this._emptyEl.className = 'working-set-panel__empty';
    this._emptyEl.textContent = 'Saved expressions appear here.';

    this._pillWrap = document.createElement('div');
    this._pillWrap.className = 'working-set-panel__pills';
    this._pillWrap.style.display = 'none';

    this.el.appendChild(header);
    this.el.appendChild(this._emptyEl);
    this.el.appendChild(this._pillWrap);
  }

  renderPills(nodes) {
    if (!nodes.length) {
      this.showEmpty();
      return;
    }

    this._emptyEl.style.display  = 'none';
    this._pillWrap.style.display = 'flex';
    this._pillWrap.innerHTML     = '';

    nodes.forEach(node => {
      const pill = document.createElement('span');
      pill.className  = 'working-set-panel__pill';
      pill.dataset.id = node.id;

      const label = document.createElement('span');
      label.className = 'working-set-panel__pill-label';
      label.innerHTML = node.getPreview();

      const del = document.createElement('span');
      del.className   = 'working-set-panel__pill-delete';
      del.textContent = '✕';
      del.title       = 'Remove';
      del.addEventListener('click', (e) => {
        e.stopPropagation();
        this.emitDeleteClick(node.id);
      });

      pill.appendChild(label);
      pill.appendChild(del);
      pill.addEventListener('click', () => this.emitPillClick(node.id));
      this._pillWrap.appendChild(pill);
    });

    const countEl = this.el.querySelector('#ws-count');
    if (countEl) countEl.textContent = nodes.length;
  }

  highlightPill(id) {
    this._pillWrap.querySelectorAll('.working-set-panel__pill').forEach(pill => {
      pill.classList.toggle('working-set-panel__pill--selected', pill.dataset.id === id);
    });
  }

  clearHighlight() {
    this._pillWrap.querySelectorAll('.working-set-panel__pill').forEach(pill => {
      pill.classList.remove('working-set-panel__pill--selected');
    });
  }

  showEmpty() {
    this._emptyEl.style.display  = 'block';
    this._pillWrap.style.display = 'none';
    const countEl = this.el.querySelector('#ws-count');
    if (countEl) countEl.textContent = '0';
  }

  emitPillClick(id) {
    this.el.dispatchEvent(new CustomEvent('working-set:pill-click', {
      bubbles: true, detail: { id }
    }));
  }

  emitDeleteClick(id) {
    this.el.dispatchEvent(new CustomEvent('working-set:delete-click', {
      bubbles: true, detail: { id }
    }));
  }

}