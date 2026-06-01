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
        // remove old column classes
        this._table.className = 'tifib-table';
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.innerHTML = question;              // ← innerHTML for rich content
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

    // columns = total columns including image column
    // fieldsCount = columns - 1
    // headings: object with keys: image, field1, field2, ... fieldN
    //           OR legacy keys: image, count, word (for 2/3 col backward compat)
    renderHeaders(headings, columns) {
        this._table.classList.add(`tifib-cols-${columns}`);
        this._headerRow.innerHTML = '';

        const fieldsCount = columns - 1;

        // Image column header
        const imgTh    = document.createElement('th');
        imgTh.innerHTML = headings.image || 'Image';
        this._headerRow.appendChild(imgTh);

        // Field column headers — dynamic
        for (let i = 1; i <= fieldsCount; i++) {
            const th    = document.createElement('th');
            // support both field1/field2 keys and legacy count/word keys
            const label = headings[`field${i}`]
                || (i === 1 ? headings.count : null)
                || (i === 2 ? headings.word  : null)
                || `Field ${i}`;
            th.innerHTML = label;                           // ← innerHTML for rich content
            this._headerRow.appendChild(th);
        }
    }

    // Renders all rows, returns input elements for event binding
    renderRows(rows, columns, userResponses) {
        this._tbody.innerHTML = '';
        const inputEls   = [];
        const fieldsCount = columns - 1;

        rows.forEach((row, rowIdx) => {
            const tr = document.createElement('tr');

            // Image cell
            const tdImg     = document.createElement('td');
            tdImg.className = 'tifib-image-cell';
            const wrapper   = document.createElement('div');
            wrapper.className = 'tifib-image-wrapper';
            wrapper.innerHTML = row.svg_content
                ? row.svg_content
                : `<img src="${row.img_url}" alt="${row.alt_text || ''}" />`;
            tdImg.appendChild(wrapper);
            tr.appendChild(tdImg);

            // Dynamic field columns
            for (let i = 1; i <= fieldsCount; i++) {
                const fieldKey = `field${i}`;
                const colIdx   = i - 1;
                const { el, isInput } = this._createFieldCell(
                    row[fieldKey],
                    rowIdx,
                    colIdx,
                    userResponses[rowIdx]?.[colIdx] || ''
                );
                tr.appendChild(el);
                if (isInput) inputEls.push(isInput);
            }

            this._tbody.appendChild(tr);
        });

        return inputEls;
    }

    // ── Private ───────────────────────────────────────────────

    _createFieldCell(field, rowIdx, colIdx, savedValue) {
        const td = document.createElement('td');

        // field has "value" → non-editable display cell
        if (field?.value !== undefined) {
            const div     = document.createElement('div');
            div.className = 'tifib-fixed-cell';
            div.innerHTML = String(field.value);            // ← innerHTML for rich content
            td.appendChild(div);
            return { el: td, isInput: null };
        }

        // field has "acceptable_answers" or is undefined → editable input
        const input         = document.createElement('input');
        input.type          = 'text';
        input.className     = 'tifib-input-field';
        input.dataset.row   = rowIdx;
        input.dataset.col   = colIdx;
        input.value         = savedValue;
        input.placeholder   = '';
        td.appendChild(input);
        return { el: td, isInput: input };
    }

    // ── Accessors ─────────────────────────────────────────────

    getTbody() { return this._tbody; }
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

        // Default to 2 columns if not specified
        const columns      = config.columns || 2;
        const fieldsPerRow = columns - 1;

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
        if (!this._userResponses[rowIdx]) {
            this._userResponses[rowIdx] = [];
        }
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