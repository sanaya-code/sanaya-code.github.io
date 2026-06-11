// components/operator_browser/component.js
// OPERATOR_GROUPS is defined in mathml_operators/operator_registry.js

class OperatorBrowserComponent {

  constructor() {
    this.el            = null;
    this._searchInput  = null;
    this._catRowEl     = null;
    this._opsPanelEl   = null;
    this._activeGroup  = null;
  }

  // ── build ─────────────────────────────────────────────────────────────────

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'op-browser';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML = '';

    this._searchInput = this._buildSearchInput();
    this._catRowEl    = this._buildCatRow();
    this._opsPanelEl  = this._buildOpsPanel();

    const searchWrap = document.createElement('div');
    searchWrap.className = 'op-browser__search-wrap';
    const icon = document.createElement('span');
    icon.className   = 'op-browser__search-icon';
    icon.textContent = '⌕';
    searchWrap.appendChild(icon);
    searchWrap.appendChild(this._searchInput);

    this.el.appendChild(searchWrap);
    this.el.appendChild(this._catRowEl);
    this.el.appendChild(this._opsPanelEl);

    this._renderCategories();
    this._renderOps(null);
  }

  // ── private builders ──────────────────────────────────────────────────────

  _buildSearchInput() {
    const input = document.createElement('input');
    input.className   = 'op-browser__search-input';
    input.type        = 'text';
    input.placeholder = 'Search operators…';
    input.addEventListener('input', () => {
      const q = input.value.trim();
      if (q) {
        this._activeGroup = null;
        this._renderCategories();
        this._renderSearchResults(q);
      } else {
        this._renderCategories();
        this._renderOps(this._activeGroup);
      }
      this.emitSearchInput(q);
    });
    return input;
  }

  _buildCatRow() {
    const el = document.createElement('div');
    el.className = 'op-browser__cat-row';
    return el;
  }

  _buildOpsPanel() {
    const el = document.createElement('div');
    el.className = 'op-browser__ops-panel';
    return el;
  }

  _buildCatCard(group, active) {
    const card = document.createElement('div');
    card.className   = 'op-browser__cat-card' + (active ? ' op-browser__cat-card--active' : '');
    card.textContent = group;
    card.addEventListener('click', () => {
      this._searchInput.value = '';
      this._activeGroup = this._activeGroup === group ? null : group;
      this._renderCategories();
      this._renderOps(this._activeGroup);
    });
    return card;
  }

  _buildOpPill(op) {
    const pill = document.createElement('div');
    pill.className     = 'op-browser__op-pill';
    pill.dataset.opName = op.name;

    const sym = document.createElement('span');
    sym.className   = 'op-browser__op-sym';
    sym.textContent = op.sym;

    const name = document.createElement('span');
    name.className   = 'op-browser__op-name';
    name.textContent = op.name;

    const arity = document.createElement('span');
    arity.className   = 'op-browser__op-arity';
    arity.textContent = op.arity;

    pill.appendChild(sym);
    pill.appendChild(name);
    pill.appendChild(arity);
    pill.addEventListener('click', () => this.emitOperatorClick(op));
    return pill;
  }

  // ── render ────────────────────────────────────────────────────────────────

  _renderCategories() {
    this._catRowEl.innerHTML = '';
    OPERATOR_GROUPS.forEach(g => {
      this._catRowEl.appendChild(
        this._buildCatCard(g.group, this._activeGroup === g.group)
      );
    });
  }

  _renderOps(groupName) {
    this._opsPanelEl.innerHTML = '';

    if (!groupName) {
      const empty = document.createElement('div');
      empty.className   = 'op-browser__ops-empty';
      empty.textContent = 'Select a category to see operators';
      this._opsPanelEl.appendChild(empty);
      return;
    }

    const group = OPERATOR_GROUPS.find(g => g.group === groupName);
    if (!group) return;

    const label = document.createElement('div');
    label.className   = 'op-browser__ops-label';
    label.textContent = group.group;

    const pills = document.createElement('div');
    pills.className = 'op-browser__ops-pills';
    group.ops.forEach(op => pills.appendChild(this._buildOpPill(op)));

    this._opsPanelEl.appendChild(label);
    this._opsPanelEl.appendChild(pills);
  }

  _renderSearchResults(query) {
    this._opsPanelEl.innerHTML = '';

    const matches = [];
    OPERATOR_GROUPS.forEach(g => {
      g.ops.forEach(op => {
        if (this._opMatches(op, query)) matches.push(op);
      });
    });

    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className   = 'op-browser__ops-empty';
      empty.textContent = 'No operators match';
      this._opsPanelEl.appendChild(empty);
      return;
    }

    const pills = document.createElement('div');
    pills.className = 'op-browser__ops-pills';
    matches.forEach(op => pills.appendChild(this._buildOpPill(op)));
    this._opsPanelEl.appendChild(pills);
  }

  _opMatches(op, query) {
    if (typeof op.matches === 'function') return op.matches(query);
    const q = query.toLowerCase();
    return op.name.toLowerCase().includes(q)
        || op.sym.toLowerCase().includes(q)
        || (op.keywords || []).some(k => k.toLowerCase().includes(q));
  }

  // ── public API ────────────────────────────────────────────────────────────

  highlightOperator(name) {
    this._opsPanelEl.querySelectorAll('.op-browser__op-pill').forEach(pill => {
      pill.classList.toggle('op-browser__op-pill--active', pill.dataset.opName === name);
    });
  }

  // ── emit ──────────────────────────────────────────────────────────────────

  emitOperatorClick(op) {
    this.el.dispatchEvent(new CustomEvent('browser:op-click', {
      bubbles: true, detail: { op }
    }));
  }

  emitSearchInput(query) {
    this.el.dispatchEvent(new CustomEvent('browser:search', {
      bubbles: true, detail: { query }
    }));
  }

}