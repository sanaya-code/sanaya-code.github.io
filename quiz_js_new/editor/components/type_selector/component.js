// editor/components/type_selector/component.js

class TypeSelectorComponent extends HTMLElement {

  connectedCallback() {
    this._query = '';
    this._render();
    this._bindEvents();
    this.querySelector('.ts-search')?.focus();
  }

  // ── Get types lazily — called at render time ─────────
  // Ensures EditorFormRegistry is fully initialised
  _getTypes() {
    return EditorFormRegistry.getAllTypes();
  }

  // ── Render shell ────────────────────────────────────
  _render() {
    const types = this._getTypes();
    this.innerHTML = `
      <div class="type-selector">
        <div class="ts-heading">
          Select Question Type
          <span>${types.length} types available</span>
        </div>

        <div class="ts-search-wrap">
          <span class="ts-search-icon">🔍</span>
          <input
            class="ts-search"
            type="text"
            placeholder="Search question types..."
            value="${this._query}"
            autocomplete="off"
          />
        </div>

        <div class="ts-grid">
          ${this._renderCards(types)}
        </div>

        <div class="ts-skip-note">
          💡 To mark a question as <strong>skip</strong>, open the question
          and use the <em>Mark as Skip</em> button in the editor form.
        </div>
      </div>
    `;
  }

  // ── Render filtered cards ───────────────────────────
  _renderCards(types) {
    const q = this._query.toLowerCase().trim();
    const filtered = q
      ? types.filter(t =>
          t.label.toLowerCase().includes(q)       ||
          t.description.toLowerCase().includes(q) ||
          t.type.toLowerCase().includes(q)
        )
      : types;

    if (filtered.length === 0) {
      return `
        <div class="ts-empty">
          <div class="ts-empty-icon">🔍</div>
          <p>No question types found for <strong>"${this._query}"</strong></p>
        </div>
      `;
    }

    return filtered.map(t => `
      <div class="ts-card" data-type="${t.type}">
        <span class="ts-badge" style="background:${t.color}">${t.label}</span>
        <div class="ts-card-label">${t.label}</div>
        <div class="ts-card-desc">${t.description}</div>
      </div>
    `).join('');
  }

  // ── Events ──────────────────────────────────────────
  _bindEvents() {
    this.querySelector('.ts-search')?.addEventListener('input', (e) => {
      this._query = e.target.value;
      const types = this._getTypes();
      this.querySelector('.ts-grid').innerHTML = this._renderCards(types);
      this._bindCardEvents();
    });
    this._bindCardEvents();
  }

  _bindCardEvents() {
    this.querySelectorAll('.ts-card').forEach(card => {
      card.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('type-selected', {
          bubbles: true,
          detail: { type: card.dataset.type }
        }));
      });
    });
  }

}

customElements.define('type-selector', TypeSelectorComponent);