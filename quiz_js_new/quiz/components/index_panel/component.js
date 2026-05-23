class IndexPanelComponent extends HTMLElement {

    constructor() {
        super();
        this._gridBuilt = false;
    }

    static get observedAttributes() {
        return ['total', 'current', 'update-status', 'mark-all-unanswered', 'remove-panel'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if      (name === 'total')               this._buildGrid(parseInt(newValue, 10));
        else if (name === 'current')             { this._ensureStructure(); this._setCurrent(parseInt(newValue, 10)); }
        else if (name === 'update-status')       { this._ensureStructure(); this._updateStatus(newValue); }
        else if (name === 'mark-all-unanswered') { this._ensureStructure(); this._markAllUnanswered(); }
        else if (name === 'remove-panel')        this.remove();
    }

    // ── Structure ─────────────────────────────────────────────

    _ensureStructure() {
        if (this._gridBuilt) return;
        const total = this.getAttribute('total');
        if (total !== null) this._buildGrid(parseInt(total, 10));
    }

    _buildGrid(total) {
        this._gridBuilt = true;
        this.innerHTML = `
            <div class="index-panel">
                <div class="index-title">Questions</div>
                <div class="index-grid">
                    ${Array.from({ length: total }, (_, i) => `
                        <div class="index-item not-answered" data-index="${i}">${i + 1}</div>
                    `).join('')}
                </div>
            </div>
        `;
        this._bindGridEvents();
    }

    _bindGridEvents() {
        this.querySelector('.index-grid').addEventListener('click', (e) => {
            const item = e.target.closest('.index-item');
            if (item) {
                this.dispatchEvent(new CustomEvent('question-selected', {
                    detail: { index: parseInt(item.dataset.index, 10) },
                    bubbles: true,
                }));
            }
        });
    }

    // ── State updates ─────────────────────────────────────────

    _setCurrent(index) {
        if (isNaN(index)) return;
        this.querySelector('.index-item.current')?.classList.remove('current');
        this.querySelector(`.index-item[data-index="${index}"]`)?.classList.add('current');
    }

    _updateStatus(jsonStr) {
        try {
            const { index, status } = JSON.parse(jsonStr);
            const el = this.querySelector(`.index-item[data-index="${index}"]`);
            if (el) {
                el.classList.remove('answered', 'not-answered');
                el.classList.add(status);
            }
        } catch (e) {
            console.warn('IndexPanel: invalid update-status JSON', jsonStr);
        }
    }

    _markAllUnanswered() {
        this.querySelectorAll('.index-item').forEach(item => {
            if (!item.classList.contains('current')) {
                item.classList.remove('answered');
                item.classList.add('not-answered');
            }
        });
    }
}

customElements.define('question-index-panel', IndexPanelComponent);