// components/atoms_panel/component.js
// Dumb renderer. Renders pills into a pill-wrap div, emits events.
// No header, no background — mounted inside items_panel.

class AtomsPanelComponent {

  constructor() {
    this.el       = null; // pillWrap is the root element for this component now
  }

  // ── build ────────────────────────────────────────────────────────────────

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'atoms-panel__sections';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML = '';
  }

  // ── render ───────────────────────────────────────────────────────────────

  renderPills(nodes) {
    this.el.innerHTML = '';

    const sections = [
      { label: 'Numbers',   category: 'number'   },
      { label: 'Variables', category: 'variable' },
      { label: 'Symbols',   category: 'symbol'   },
    ];

    sections.forEach(({ label, category }) => {
      const items = nodes.filter(n => n.category === category);
      if (!items.length) return;
      this.el.appendChild(this._buildSection(label, items));
    });

    this.emitCountChange(nodes.length);
  }

  _buildSection(label, nodes) {
    const section = document.createElement('div');
    section.className = 'items-panel__section';

    const labelEl = document.createElement('div');
    labelEl.className   = 'items-panel__section-label';
    labelEl.textContent = label;

    const rowEl = document.createElement('div');
    rowEl.className = 'atoms-panel__pills';

    nodes.forEach(node => {
      const pill = document.createElement('span');
      pill.className  = 'atoms-panel__pill';
      pill.dataset.id = node.id;
      pill.innerHTML  = node.getPreview();
      pill.addEventListener('click', () => this.emitPillClick(node.id));
      rowEl.appendChild(pill);
    });

    section.appendChild(labelEl);
    section.appendChild(rowEl);
    return section;
  }

  highlightPill(id) {
    this.el.querySelectorAll('.atoms-panel__pill').forEach(pill => {
      pill.classList.toggle('atoms-panel__pill--selected', pill.dataset.id === id);
    });
  }

  clearHighlight() {
    this.el.querySelectorAll('.atoms-panel__pill').forEach(pill => {
      pill.classList.remove('atoms-panel__pill--selected');
    });
  }

  // ── emit ─────────────────────────────────────────────────────────────────

  emitPillClick(id) {
    this.el.dispatchEvent(new CustomEvent('atoms:pill-click', {
      bubbles: true,
      detail: { id }
    }));
  }

  emitCountChange(count) {
    this.el.dispatchEvent(new CustomEvent('atoms:count-change', {
      bubbles: true,
      detail: { count }
    }));
  }

}