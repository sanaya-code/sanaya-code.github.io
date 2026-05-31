// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class FillInBlankOperationRenderer {

    createStructure(host) {
        if (host.querySelector('.fibopr-container')) return;
        host.innerHTML = `
            <div class="fibopr-container">

                <div class="fibopr-section" data-section="svg" style="display: none;">
                    <div class="fibopr-section-header">Figure</div>
                    <div class="fibopr-section-body">
                        <div class="fibopr-svg-figure"></div>
                    </div>
                </div>

                <div class="fibopr-section" data-section="image" style="display: none;">
                    <div class="fibopr-section-header">Figure</div>
                    <div class="fibopr-section-body">
                        <div class="fibopr-image"></div>
                    </div>
                </div>

                <div class="fibopr-question"></div>

                <div class="fibopr-row" data-row="first_row"></div>
                <div class="fibopr-row" data-row="second_row"></div>
                <div class="fibopr-row" data-row="third_row"></div>
                <div class="fibopr-row" data-row="fourth_row"></div>

                <div class="fibopr-choices"></div>

            </div>
        `;
    }

    cacheElements(host) {
        const root           = host.querySelector('.fibopr-container');
        this._svgSection     = host.querySelector('[data-section="svg"]');
        this._imageSection   = host.querySelector('[data-section="image"]');
        this._svgFigureEl    = host.querySelector('.fibopr-svg-figure');
        this._imageFigureEl  = host.querySelector('.fibopr-image');
        this._questionEl     = root.querySelector('.fibopr-question');
        this._rows           = {
            first_row:  root.querySelector('[data-row="first_row"]'),
            second_row: root.querySelector('[data-row="second_row"]'),
            third_row:  root.querySelector('[data-row="third_row"]'),
            fourth_row: root.querySelector('[data-row="fourth_row"]'),
        };
        this._choicesEl      = root.querySelector('.fibopr-choices');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        Object.values(this._rows).forEach(row => row.innerHTML = '');
        this._choicesEl.innerHTML = '';
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

    // ── Row / Box Rendering ───────────────────────────────────

    renderRow(rowName, editableArr, initialArr, responses, strike) {
        const rowEl = this._rows[rowName];
        rowEl.innerHTML = '';

        if (!initialArr || initialArr.length === 0) return [];

        return initialArr.map((initialVal, i) => {
            const box = this._createBox(rowName, i, editableArr[i], initialVal, responses[i], strike[i]);
            rowEl.appendChild(box);
            return box;
        });
    }

    _createBox(rowName, index, editable, initialVal, response, striked) {
        const displayVal = response !== '' ? response : (initialVal || '');

        const box           = document.createElement('div');
        box.className       = 'fibopr-box';
        box.dataset.row     = rowName;
        box.dataset.index   = index;
        box.innerHTML       = displayVal;

        if (editable)           box.classList.add('editable');
        if (response !== '')    box.classList.add('filled');
        if (striked)            box.classList.add('striked');

        return box;
    }

    // ── Choices Rendering ─────────────────────────────────────

    renderChoices(choices = []) {
        this._choicesEl.innerHTML = '';
        return choices.map(value => {
            const btn           = document.createElement('button');
            btn.className       = 'fibopr-choice';
            btn.dataset.value   = value;
            btn.innerHTML       = value;
            this._choicesEl.appendChild(btn);
            return btn;
        });
    }

    // ── Single box update (no full re-render) ─────────────────

    updateBox(rowName, index, value, striked) {
        const box = this._rows[rowName]?.querySelector(
            `.fibopr-box[data-index="${index}"]`
        );
        if (!box) return;
        box.innerHTML = value;
        box.classList.toggle('filled',   value !== '');
        box.classList.toggle('striked',  striked);
    }

    toggleBoxStrike(rowName, index, striked) {
        const box = this._rows[rowName]?.querySelector(
            `.fibopr-box[data-index="${index}"]`
        );
        if (!box) return;
        box.classList.toggle('striked', striked);
    }

    clearChoiceSelections() {
        this._choicesEl.querySelectorAll('.fibopr-choice')
            .forEach(c => c.classList.remove('fibopr-selected'));
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, events
// ──────────────────────────────────────────────────────────────

class FillInBlankOperationComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized   = false;
        this._renderer      = new FillInBlankOperationRenderer();
        this._responses     = {};
        this._strike        = {};
        this._selectedChoice = null;
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

        this._initializeState(config);
        this._renderRows(config);
        this._renderChoices(config);
    }

    _initializeState(config) {
        const ur      = config.user_response || {};
        const initial = config.initial_answer;
        const rows    = ['first_row', 'second_row', 'third_row', 'fourth_row'];

        rows.forEach(row => {
            const len             = initial[row]?.length || 0;
            this._responses[row]  = Array.isArray(ur[row])
                ? [...ur[row]]
                : new Array(len).fill('');
            this._strike[row]     = Array.isArray(ur[`strike_${row}`])
                ? [...ur[`strike_${row}`]]
                : new Array(len).fill(false);
        });
    }

    _renderRows(config) {
        const rows = ['first_row', 'second_row', 'third_row', 'fourth_row'];
        rows.forEach(row => {
            const boxes = this._renderer.renderRow(
                row,
                config.editable_answer[row] || [],
                config.initial_answer[row]  || [],
                this._responses[row],
                this._strike[row]
            );
            this._bindBoxEvents(boxes, row);
        });
    }

    _renderChoices(config) {
        const choiceBtns = this._renderer.renderChoices(config.choices || []);
        this._bindChoiceEvents(choiceBtns);
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('FillInBlankOperationComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !config.initial_answer || !config.editable_answer) {
            console.warn('FillInBlankOperationComponent: missing initial_answer or editable_answer');
            return false;
        }
        return true;
    }

    // ── User Interaction / Events ─────────────────────────────

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.fibopr-section-header');
        if (!header) return;
        const section = header.closest('.fibopr-section');
        if (section) section.classList.toggle('fibopr-collapsed');
    }

    _bindChoiceEvents(choiceBtns) {
        choiceBtns.forEach(btn => {
            btn.addEventListener('click', () => this._handleChoiceClick(btn));
        });
    }

    _handleChoiceClick(btn) {
        this._renderer.clearChoiceSelections();
        btn.classList.add('fibopr-selected');
        this._selectedChoice = btn.dataset.value;
    }

    _bindBoxEvents(boxes, row) {
        boxes.forEach((box, index) => {
            // single click — fill editable box
            if (box.classList.contains('editable')) {
                box.addEventListener('click', () => this._handleBoxClick(box, row, index));
            }
            // double click — toggle strike on any box
            box.addEventListener('dblclick', () => this._handleBoxDblClick(box, row, index));
        });
    }

    _handleBoxClick(box, row, index) {
        if (this._selectedChoice === null) return;
        this._responses[row][index] = this._selectedChoice;
        this._renderer.updateBox(row, index, this._selectedChoice, this._strike[row][index]);
        this._renderer.clearChoiceSelections();
        this._selectedChoice = null;
        this.emitAnswerChanged();
    }

    _handleBoxDblClick(box, row, index) {
        this._strike[row][index] = !this._strike[row][index];
        this._renderer.toggleBoxStrike(row, index, this._strike[row][index]);
        this.emitAnswerChanged();
    }

    emitAnswerChanged() {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: this.getUserAnswer() },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return {
            first_row:         [...this._responses.first_row],
            second_row:        [...this._responses.second_row],
            third_row:         [...this._responses.third_row],
            fourth_row:        [...this._responses.fourth_row],
            strike_first_row:  [...this._strike.first_row],
            strike_second_row: [...this._strike.second_row],
            strike_third_row:  [...this._strike.third_row],
            strike_fourth_row: [...this._strike.fourth_row],
        };
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML        = '';
        this._initialized     = false;
        this._responses       = {};
        this._strike          = {};
        this._selectedChoice  = null;
        this._toggleHandler   = null;
        this._renderer        = new FillInBlankOperationRenderer();
    }
}

customElements.define('fill-in-blank-operation', FillInBlankOperationComponent);