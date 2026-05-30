// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class TableImageFillInBlankRenderer {

    createStructure(host) {
        if (host.querySelector('.tifib-wrapper')) return;
        host.innerHTML = `
            <div class="tifib-wrapper">

                <div class="tifib-section" data-section="svg" style="display: none;">
                    <div class="tifib-section-header">Figure</div>
                    <div class="tifib-section-body">
                        <div class="tifib-svg-figure"></div>
                    </div>
                </div>

                <div class="tifib-section" data-section="image" style="display: none;">
                    <div class="tifib-section-header">Figure</div>
                    <div class="tifib-section-body">
                        <div class="tifib-figure"></div>
                    </div>
                </div>

                <div class="tifib-question-text"></div>

                <div class="tifib-table-container">
                    <table class="tifib-table">
                        <thead><tr class="tifib-header-row"></tr></thead>
                        <tbody class="tifib-tbody"></tbody>
                    </table>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.tifib-wrapper');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._svgFigureEl   = root.querySelector('.tifib-svg-figure');
        this._imageFigureEl = root.querySelector('.tifib-figure');
        this._questionEl    = root.querySelector('.tifib-question-text');
        this._table         = root.querySelector('.tifib-table');
        this._headerRow     = root.querySelector('.tifib-header-row');
        this._tbody         = root.querySelector('.tifib-tbody');
    }

    clear() {
        this.setQuestion('');
        this.setSvgFigure(null);
        this.setImageFigure(null);
        this._headerRow.innerHTML = '';
        this._tbody.innerHTML    = '';
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.textContent = question;
    }

    setSvgFigure(svgContent) {
        if (svgContent) {
            this._svgSection.style.display = '';
            this._svgFigureEl.innerHTML = svgContent;
        } else {
            this._svgSection.style.display = 'none';
            this._svgFigureEl.innerHTML = '';
        }
    }

    setImageFigure(imgUrl) {
        if (imgUrl) {
            this._imageSection.style.display = '';
            this._imageFigureEl.innerHTML = `<img src="${imgUrl}" alt="figure" />`;
        } else {
            this._imageSection.style.display = 'none';
            this._imageFigureEl.innerHTML = '';
        }
    }

    // ── Table ─────────────────────────────────────────────────

    renderHeaders(headings, columns) {
        this._table.classList.remove('tifib-cols-2', 'tifib-cols-3');
        this._table.classList.add(`tifib-cols-${columns}`);

        this._headerRow.innerHTML = '';
        const headers = columns === 2
            ? [headings.image || 'Image', headings.count || 'Count']
            : [headings.image || 'Image', headings.count || 'Count', headings.word || 'Word'];

        headers.forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            this._headerRow.appendChild(th);
        });
    }

    // Renders all rows, returns input elements for event binding
    renderRows(rows, columns, userResponses) {
        this._tbody.innerHTML = '';
        const inputEls = [];

        rows.forEach((row, rowIdx) => {
            const tr = document.createElement('tr');

            // Image cell
            const tdImg = document.createElement('td');
            tdImg.className = 'tifib-image-cell';
            const wrapper = document.createElement('div');
            wrapper.className = 'tifib-image-wrapper';
            wrapper.innerHTML = row.svg_content
                ? row.svg_content
                : `<img src="${row.img_url}" alt="${row.alt_text || ''}" />`;
            tdImg.appendChild(wrapper);
            tr.appendChild(tdImg);

            // Field 1
            const { el: f1El, isInput: f1Input } = this._createFieldCell(
                row.field1, rowIdx, 0, userResponses[rowIdx]?.[0] || ''
            );
            tr.appendChild(f1El);
            if (f1Input) inputEls.push(f1Input);

            // Field 2 — only if columns === 3
            if (columns === 3) {
                const { el: f2El, isInput: f2Input } = this._createFieldCell(
                    row.field2, rowIdx, 1, userResponses[rowIdx]?.[1] || ''
                );
                tr.appendChild(f2El);
                if (f2Input) inputEls.push(f2Input);
            }

            this._tbody.appendChild(tr);
        });

        return inputEls;
    }

    // ── Private ───────────────────────────────────────────────

    _createFieldCell(field, rowIdx, colIdx, savedValue) {
        const td = document.createElement('td');

        // If field has "value" → non-editable display cell
        if (field?.value !== undefined) {
            const div = document.createElement('div');
            div.className   = 'tifib-fixed-cell';
            div.textContent = field.value;
            td.appendChild(div);
            return { el: td, isInput: null };
        }

        // Otherwise → editable input
        const input           = document.createElement('input');
        input.type            = 'text';
        input.className       = 'tifib-input-field';
        input.dataset.row     = rowIdx;
        input.dataset.col     = colIdx;
        input.value           = savedValue;
        input.placeholder     = '';
        td.appendChild(input);
        return { el: td, isInput: input };
    }

    // ── Accessors ─────────────────────────────────────────────

    getTbody()  { return this._tbody; }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class TableImageFillInBlankComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized   = false;
        this._renderer      = new TableImageFillInBlankRenderer();
        this._userResponses = [];
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
        this._renderer.setSvgFigure(config.svg_content);
        this._renderer.setImageFigure(config.img_url);

        const columns  = config.columns || 3;
        const fieldsPerRow = columns === 2 ? 1 : 2;

        this._initUserResponses(config, fieldsPerRow);

        this._renderer.renderHeaders(config.column_headings || {}, columns);

        const inputEls = this._renderer.renderRows(
            config.rows,
            columns,
            this._userResponses
        );

        this._bindInputEvents(inputEls);
    }

    // ── State ─────────────────────────────────────────────────

    _initUserResponses(config, fieldsPerRow) {
        if (Array.isArray(config.user_response) && config.user_response.length > 0) {
            this._userResponses = config.user_response.map(row => [...row]);
        } else {
            this._userResponses = (config.rows || []).map(() =>
                Array(fieldsPerRow).fill('')
            );
        }
    }

    // ── Events ────────────────────────────────────────────────

    _bindInputEvents(inputEls) {
        inputEls.forEach(input => {
            input.addEventListener('input', (e) => this._handleInput(e));
        });
    }

    _handleInput(e) {
        const rowIdx = parseInt(e.target.dataset.row);
        const colIdx = parseInt(e.target.dataset.col);
        if (!this._userResponses[rowIdx]) this._userResponses[rowIdx] = ['', ''];
        this._userResponses[rowIdx][colIdx] = e.target.value;
        this.emitAnswerChanged();
    }

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.tifib-section-header');
        if (!header) return;
        const section = header.closest('.tifib-section');
        if (section) section.classList.toggle('tifib-collapsed');
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
            console.warn('TableImageFillInBlankComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.rows) || config.rows.length === 0) {
            console.warn('TableImageFillInBlankComponent: missing or empty rows');
            return false;
        }
        return true;
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return this._userResponses.map(row => [...row]);
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML        = '';
        this._initialized     = false;
        this._userResponses   = [];
        this._toggleHandler   = null;
        this._renderer        = new TableImageFillInBlankRenderer();
    }
}

customElements.define('table-image-fill-in-the-blank', TableImageFillInBlankComponent);