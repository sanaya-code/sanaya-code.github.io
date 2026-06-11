// components/right_panel/component.js

class RightPanelComponent {

  constructor() {
    this.el              = null;
    this._tabsEl         = null;
    this._operatorsPane  = null;
    this._formPane       = null;
    this._sentencePane   = null;
  }

  // ── build ─────────────────────────────────────────────────────────────────

  createElement() {
    this.el = document.createElement('div');
    this.el.className = 'right-panel';
    return this.el;
  }

  buildLayout() {
    this.el.innerHTML = '';

    this._tabsEl = document.createElement('div');
    this._tabsEl.className = 'right-panel__tabs';
    this._tabsEl.innerHTML = `
      <button class="right-panel__tab right-panel__tab--active"
              data-tab="operators">Operators</button>
      <button class="right-panel__tab"
              data-tab="form">Operator Form</button>
      <button class="right-panel__tab"
              data-tab="sentence">Sentence</button>
    `;

    this._operatorsPane = document.createElement('div');
    this._operatorsPane.className = 'right-panel__pane right-panel__pane--active';
    this._operatorsPane.id = 'operators-pane';

    this._formPane = document.createElement('div');
    this._formPane.className = 'right-panel__pane';
    this._formPane.id = 'form-pane';

    this._sentencePane = document.createElement('div');
    this._sentencePane.className = 'right-panel__pane';
    this._sentencePane.id = 'sentence-pane';

    this._tabsEl.querySelectorAll('.right-panel__tab').forEach(btn => {
      btn.addEventListener('click', () => this.emitTabClick(btn.dataset.tab));
    });

    this.el.appendChild(this._tabsEl);
    this.el.appendChild(this._operatorsPane);
    this.el.appendChild(this._formPane);
    this.el.appendChild(this._sentencePane);
  }

  // ── public API ────────────────────────────────────────────────────────────

  getOperatorsPane() { return this._operatorsPane; }
  getFormPane()      { return this._formPane; }
  getSentencePane()  { return this._sentencePane; }

  showOperatorsView() { this._setPaneActive('operators'); }
  showFormView()      { this._setPaneActive('form'); }
  showSentenceView()  { this._setPaneActive('sentence'); }

  // ── internal ──────────────────────────────────────────────────────────────

  _setPaneActive(tabId) {
    this._tabsEl.querySelectorAll('.right-panel__tab').forEach(btn => {
      btn.classList.toggle('right-panel__tab--active', btn.dataset.tab === tabId);
    });
    this._operatorsPane.classList.toggle('right-panel__pane--active', tabId === 'operators');
    this._formPane.classList.toggle('right-panel__pane--active',      tabId === 'form');
    this._sentencePane.classList.toggle('right-panel__pane--active',  tabId === 'sentence');
  }

  // ── emit ──────────────────────────────────────────────────────────────────

  emitTabClick(tabId) {
    this.el.dispatchEvent(new CustomEvent('right-panel:tab-click', {
      bubbles: true,
      detail: { tabId }
    }));
  }

}