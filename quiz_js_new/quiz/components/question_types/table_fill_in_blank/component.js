// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class TableFillInBlankRenderer {

    createStructure(host) {
        if (host.querySelector('.tabfib-wrapper')) return;
        host.innerHTML = `
            <div class="tabfib-wrapper">

                <div class="tabfib-question-text"></div>

                <div class="tabfib-section" data-section="svg" style="display: none;">
                    <div class="tabfib-section-header">Figure</div>
                    <div class="tabfib-section-body">
                        <div class="tabfib-svg-figure"></div>
                    </div>
                </div>

                <div class="tabfib-section" data-section="image" style="display: none;">
                    <div class="tabfib-section-header">Figure</div>
                    <div class="tabfib-section-body">
                        <div class="tabfib-figure"></div>
                    </div>
                </div>

                <div class="tabfib-container">
                    <table class="tabfib-table"></table>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.tabfib-wrapper');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._questionEl    = root.querySelector('.tabfib-question-text');
        this._svgFigureEl   = root.querySelector('.tabfib-svg-figure');
        this._imageFigureEl = root.querySelector('.tabfib-figure');
        this._tableEl       = root.querySelector('.tabfib-table');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        this._tableEl.innerHTML = '';
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.innerHTML = question;
    }

    setSvg(svgContent) {
        if (svgContent) {
            this._svgSection.style.display = '';
            this._svgFigureEl.innerHTML = svgContent;
        } else {
            this._svgSection.style.display = 'none';
            this._svgFigureEl.innerHTML = '';
        }
    }

    setImage(imgUrl) {
        if (imgUrl) {
            this._imageSection.style.display = '';
            this._imageFigureEl.innerHTML = `<img src="${imgUrl}" alt="figure" />`;
        } else {
            this._imageSection.style.display = 'none';
            this._imageFigureEl.innerHTML = '';
        }
    }

    // ── Table ─────────────────────────────────────────────────

    // Renders the full table, returns input elements for event binding
    renderTable(data, rowLabels, colLabels, responses) {
        this._tableEl.innerHTML = '';

        this._renderHeader(colLabels);
        const inputEls = this._renderBody(data, rowLabels, responses);
        return inputEls;
    }

    _renderHeader(colLabels) {
        const thead   = document.createElement('thead');
        const headRow = document.createElement('tr');

        // empty corner cell for row label column
        headRow.appendChild(document.createElement('th'));

        colLabels.forEach(label => {
            const th      = document.createElement('th');
            th.innerHTML  = label;
            headRow.appendChild(th);
        });

        thead.appendChild(headRow);
        this._tableEl.appendChild(thead);
    }

    _renderBody(data, rowLabels, responses) {
        const tbody    = document.createElement('tbody');
        const inputEls = [];

        data.forEach((row, rowIdx) => {
            const tr = document.createElement('tr');

            // Row label
            const rowLabelTd      = document.createElement('td');
            rowLabelTd.innerHTML  = rowLabels[rowIdx] || '';
            tr.appendChild(rowLabelTd);

            row.forEach((cell, colIdx) => {
                const td = document.createElement('td');

                if (cell.value === '____') {
                    const input         = document.createElement('input');
                    input.type          = 'text';
                    input.className     = 'tabfib-input';
                    input.dataset.row   = rowIdx;
                    input.dataset.col   = colIdx;
                    input.value         = responses?.[rowIdx]?.[colIdx] || '';
                    td.appendChild(input);
                    inputEls.push(input);
                } else {
                    td.innerHTML = cell.value;
                }

                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        this._tableEl.appendChild(tbody);
        return inputEls;
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class TableFillInBlankComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized = false;
        this._renderer    = new TableFillInBlankRenderer();
        this._responses   = [];
    }

    static get observedAttributes() {
        return ['config'];
    }

    connectedCallback() {
        if (this._initialized) return;
        this._renderer.createStructure(this);
        this._renderer.cacheElements(this);
        this.bindToggleEvent();
        this._initialized = true;
        this.setup();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config' && oldValue !== newValue) {
            this.setup();
        }
    }

    disconnectedCallback() {
        this.cleanup();
    }

    // ── Main Rendering ────────────────────────────────────────

    setup() {
        if (!this._initialized) return;
        const config = this.parseConfigAttribute();
        if (!this.validateData(config)) {
            this._renderer.clear();
            return;
        }

        this._renderer.clear();
        this._renderer.setQuestion(config.question);
        this._renderer.setSvg(config.svg_content);
        this._renderer.setImage(config.img_url);

        this._responses = this._initResponses(config);

        const inputEls = this._renderer.renderTable(
            config.data,
            config.row_labels  || [],
            config.column_labels || [],
            this._responses
        );

        this._bindInputEvents(inputEls);
    }

    // ── State ─────────────────────────────────────────────────

    _initResponses(config) {
        const data     = config.data || [];
        const saved    = config.user_response || [];
        return data.map((row, rowIdx) =>
            row.map((_, colIdx) => {
                const savedRow = Array.isArray(saved[rowIdx]) ? saved[rowIdx] : [];
                return savedRow[colIdx] || '';
            })
        );
    }

    // ── Events ────────────────────────────────────────────────

    _bindInputEvents(inputEls) {
        inputEls.forEach(input => {
            input.addEventListener('input', (e) => this._handleInput(e));
        });
    }

    _handleInput(e) {
        const rowIdx = parseInt(e.target.dataset.row, 10);
        const colIdx = parseInt(e.target.dataset.col, 10);
        if (!this._responses[rowIdx]) this._responses[rowIdx] = [];
        this._responses[rowIdx][colIdx] = e.target.value;
        this.emitAnswerChanged();
    }

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.tabfib-section-header');
        if (!header) return;
        const section = header.closest('.tabfib-section');
        if (section) section.classList.toggle('tabfib-collapsed');
    }

    emitAnswerChanged() {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: this.getUserAnswer() },
            bubbles: true,
        }));
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('TableFillInBlankComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.data) || config.data.length === 0) {
            console.warn('TableFillInBlankComponent: missing or empty data');
            return false;
        }
        return true;
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return this._responses.map(row => [...row]);
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._responses     = [];
        this._toggleHandler = null;
        this._renderer      = new TableFillInBlankRenderer();
    }
}

customElements.define('table-fill-in-the-blank', TableFillInBlankComponent);