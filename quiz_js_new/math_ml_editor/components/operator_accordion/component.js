// components/operator_accordion/component.js

const OPERATOR_GROUPS = [
  {
    group: 'Arithmetic',
    ops: [
      addOperator,
      powerOperator,
      subtractOperator,
      multiplyOperator,
      divideOperator,
      sqrtOperator,
      negateOperator,
      absOperator,
    ]
  },
  {
    group: 'Trigonometric',
    ops: [
      sinOperator,
      cosOperator,
      { name: 'tan',    sym: 'tan',    arity: 1, group: 'Trigonometric' },
      { name: 'arcsin', sym: 'sin⁻¹', arity: 1, group: 'Trigonometric' },
      { name: 'arccos', sym: 'cos⁻¹', arity: 1, group: 'Trigonometric' },
      { name: 'atan2',  sym: 'atan2',  arity: 2, group: 'Trigonometric' },
    ]
  },
  {
    group: 'Logarithmic',
    ops: [
      { name: 'ln',    sym: 'ln',   arity: 1, group: 'Logarithmic' },
      logOperator,
      { name: 'logₙ',  sym: 'logₙ', arity: 2, group: 'Logarithmic' },
      { name: 'exp',   sym: 'eˣ',   arity: 1, group: 'Logarithmic' },
    ]
  },
  {
    group: 'Statistical',
    ops: [
      { name: 'Mean',  sym: 'μ',     arity: 3, group: 'Statistical' },
      { name: 'Min',   sym: 'min',   arity: 2, group: 'Statistical' },
      { name: 'Max',   sym: 'max',   arity: 2, group: 'Statistical' },
      { name: 'Clamp', sym: 'clamp', arity: 3, group: 'Statistical' },
    ]
  },
  {
    group: 'Conditional',
    ops: [
      { name: 'If > 0', sym: 'if>0', arity: 3, group: 'Conditional' },
      { name: 'If = 0', sym: 'if=0', arity: 3, group: 'Conditional' },
      { name: 'Switch', sym: 'sw',   arity: 4, group: 'Conditional' },
    ]
  },
];

class OperatorAccordionComponent {

  constructor() {
    this.el           = null;
    this._searchInput = null;
    this._listEl      = null;
    this._allGroups   = OPERATOR_GROUPS;
  }

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'op-accordion';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML = '';

    const searchWrap = document.createElement('div');
    searchWrap.className = 'op-accordion__search-wrap';
    searchWrap.innerHTML = `
      <span class="op-accordion__search-icon">⌕</span>
      <input class="op-accordion__search-input" type="text" placeholder="Search operators…" />
    `;
    this._searchInput = searchWrap.querySelector('input');
    this._searchInput.addEventListener('input', () => {
      this._renderGroups(this._searchInput.value.trim());
      this.emitSearchInput(this._searchInput.value.trim());
    });

    this._listEl = document.createElement('div');
    this._listEl.className = 'op-accordion__list';

    this.el.appendChild(searchWrap);
    this.el.appendChild(this._listEl);
    this._renderGroups('');
  }

  renderGroups(groups) {
    this._allGroups = groups;
    this._renderGroups(this._searchInput ? this._searchInput.value.trim() : '');
  }

  _renderGroups(filter) {
    const f = filter.toLowerCase();
    this._listEl.innerHTML = '';

    this._allGroups.forEach(g => {
      const ops = f
        ? g.ops.filter(o => o.name.toLowerCase().includes(f) || o.sym.toLowerCase().includes(f))
        : g.ops;
      if (!ops.length) return;

      const groupEl = document.createElement('div');
      groupEl.className = 'op-accordion__group';

      const header = document.createElement('div');
      header.className = 'op-accordion__group-header';
      header.innerHTML = `
        <span class="op-accordion__group-label">${g.group}</span>
        <span class="op-accordion__group-chevron">›</span>
      `;

      const itemsEl = document.createElement('div');
      itemsEl.className = 'op-accordion__group-items';
      if (f) itemsEl.classList.add('op-accordion__group-items--open');

      header.addEventListener('click', () => {
        const isOpen = itemsEl.classList.toggle('op-accordion__group-items--open');
        header.querySelector('.op-accordion__group-chevron')
          .classList.toggle('op-accordion__group-chevron--open', isOpen);
      });

      ops.forEach(op => {
        const row = document.createElement('button');
        row.className = 'op-accordion__op-row';
        row.dataset.opName = op.name;
        row.innerHTML = `
          <span class="op-accordion__op-sym">${op.sym}</span>
          <span class="op-accordion__op-name">${op.name}</span>
          <span class="op-accordion__op-arity">${op.arity}</span>
        `;
        row.addEventListener('click', () => this.emitOperatorClick(op));
        itemsEl.appendChild(row);
      });

      groupEl.appendChild(header);
      groupEl.appendChild(itemsEl);
      this._listEl.appendChild(groupEl);
    });
  }

  highlightOperator(name) {
    this._listEl.querySelectorAll('.op-accordion__op-row').forEach(row => {
      row.classList.toggle('op-accordion__op-row--active', row.dataset.opName === name);
    });
  }

  filterItems(query) {
    if (this._searchInput) this._searchInput.value = query;
    this._renderGroups(query);
  }

  emitOperatorClick(op) {
    this.el.dispatchEvent(new CustomEvent('accordion:op-click', {
      bubbles: true, detail: { op }
    }));
  }

  emitSearchInput(query) {
    this.el.dispatchEvent(new CustomEvent('accordion:search', {
      bubbles: true, detail: { query }
    }));
  }

}