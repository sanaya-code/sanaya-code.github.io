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
    this.el.className = 'atoms-panel__pills';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML = '';
  }

  // ── render ───────────────────────────────────────────────────────────────

  renderPills(nodes) {
    this.el.innerHTML = '';
    nodes.forEach(node => {
      const pill = document.createElement('span');
      pill.className  = 'atoms-panel__pill';
      pill.dataset.id = node.id;
      pill.innerHTML  = node.getPreview();
      pill.addEventListener('click', () => this.emitPillClick(node.id));
      this.el.appendChild(pill);
    });
    this.emitCountChange(nodes.length);
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