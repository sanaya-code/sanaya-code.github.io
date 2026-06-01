// ──────────────────────────────────────────────────────────────
// Geometry Helper — pure math, zero DOM, zero events
// ──────────────────────────────────────────────────────────────

class FillInBlankMultiGraphTextGeometry {

    getBlockPosition(index, total, cx, cy, radius) {
        const angle = (2 * Math.PI * index) / total;
        return {
            x: cx + radius * Math.cos(angle),
            y: cy + radius * Math.sin(angle),
        };
    }

    getBoardCenter(boardWidth, boardHeight) {
        return {
            cx: boardWidth  / 2,
            cy: boardHeight / 2,
        };
    }

    getRadius(boardWidth, boardHeight) {
        return Math.min(boardWidth, boardHeight) / 2.5;
    }
}


// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class FillInBlankMultiGraphTextRenderer {

    constructor(geometry) {
        this._geometry = geometry;
    }

    createStructure(host) {
        if (host.querySelector('.fibmgt-wrapper')) return;
        host.innerHTML = `
            <div class="fibmgt-wrapper">

                <div class="fibmgt-section" data-section="svg" style="display: none;">
                    <div class="fibmgt-section-header">Figure</div>
                    <div class="fibmgt-section-body">
                        <div class="fibmgt-svg-figure"></div>
                    </div>
                </div>

                <div class="fibmgt-section" data-section="image" style="display: none;">
                    <div class="fibmgt-section-header">Figure</div>
                    <div class="fibmgt-section-body">
                        <div class="fibmgt-figure"></div>
                    </div>
                </div>

                <div class="fibmgt-container">
                    <div class="fibmgt-question"></div>
                    <div class="fibmgt-board">
                        <svg class="fibmgt-lines"></svg>
                        <div class="fibmgt-center"></div>
                    </div>
                    <div class="fibmgt-choices"></div>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.fibmgt-wrapper');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._svgFigureEl   = root.querySelector('.fibmgt-svg-figure');
        this._imageFigureEl = root.querySelector('.fibmgt-figure');
        this._questionEl    = root.querySelector('.fibmgt-question');
        this._board         = root.querySelector('.fibmgt-board');
        this._svgLines      = root.querySelector('.fibmgt-lines');
        this._centerEl      = root.querySelector('.fibmgt-center');
        this._choicesEl     = root.querySelector('.fibmgt-choices');
    }

    clear() {
        this._questionEl.innerHTML  = '';
        this.setSvgFigure(null);
        this.setImageFigure(null);
        this._centerEl.innerHTML    = '';
        this._svgLines.innerHTML    = '';
        this._choicesEl.innerHTML   = '';
        this._choicesEl.style.display = 'none';
        // remove old blocks
        this._board.querySelectorAll('.fibmgt-block').forEach(b => b.remove());
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

    setCenterLabel(label) {
        this._centerEl.innerHTML = label;                   // ← innerHTML for rich content
    }

    // ── Blocks ────────────────────────────────────────────────

    // Returns input elements array
    renderBlocks(blocks, responses) {
        this._board.querySelectorAll('.fibmgt-block').forEach(b => b.remove());
        const inputEls = [];

        blocks.forEach((block, i) => {
            const div       = document.createElement('div');
            div.className   = 'fibmgt-block';
            div.dataset.index = i;

            const label     = document.createElement('div');
            label.className = 'fibmgt-label';
            label.innerHTML = `${block.a} ${block.b}`;     // ← innerHTML for rich content

            const input     = document.createElement('input');
            input.type      = 'text';
            input.className = 'fibmgt-input';
            input.dataset.index = i;
            input.value     = responses[i] || '';

            div.appendChild(label);
            div.appendChild(input);
            this._board.appendChild(div);
            inputEls.push(input);
        });

        return inputEls;
    }

    // ── Choices bank ──────────────────────────────────────────

    renderChoices(choices) {
        this._choicesEl.innerHTML = '';
        if (!choices || choices.length === 0) {
            this._choicesEl.style.display = 'none';
            return [];
        }
        this._choicesEl.style.display = '';
        return choices.map(ch => {
            const span       = document.createElement('span');
            span.className   = 'fibmgt-choice';
            span.innerHTML   = String(ch);                  // ← innerHTML for rich content
            span.dataset.value = String(ch);
            this._choicesEl.appendChild(span);
            return span;
        });
    }

    // ── Layout / Positioning ──────────────────────────────────

    positionBlocks() {
        const boardRect = this._board.getBoundingClientRect();
        const { cx, cy } = this._geometry.getBoardCenter(boardRect.width, boardRect.height);
        const radius      = this._geometry.getRadius(boardRect.width, boardRect.height);
        const blocks      = this._board.querySelectorAll('.fibmgt-block');
        const total       = blocks.length;

        this._svgLines.setAttribute('width',  boardRect.width);
        this._svgLines.setAttribute('height', boardRect.height);
        this._svgLines.innerHTML = '';

        blocks.forEach((block, i) => {
            const { x, y } = this._geometry.getBlockPosition(i, total, cx, cy, radius);

            block.style.left = `${x - block.offsetWidth  / 2}px`;
            block.style.top  = `${y - block.offsetHeight / 2}px`;

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', cx);
            line.setAttribute('y1', cy);
            line.setAttribute('x2', x);
            line.setAttribute('y2', y);
            this._svgLines.appendChild(line);
        });

        this._centerEl.style.left = `${cx - this._centerEl.offsetWidth  / 2}px`;
        this._centerEl.style.top  = `${cy - this._centerEl.offsetHeight / 2}px`;
    }

    // ── Accessors ─────────────────────────────────────────────

    getBoard()     { return this._board; }
    getChoicesEl() { return this._choicesEl; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — input events and choice selection
// ──────────────────────────────────────────────────────────────

class FillInBlankMultiGraphTextInteractionHandler {

    constructor(inputEls, choiceEls, onChange) {
        this._inputEls     = inputEls;
        this._choiceEls    = choiceEls;
        this._onChange     = onChange;
        this._activeChoice = null;
        this._activeInput  = null;
    }

    bind() {
        this._bindInputEvents();
        this._bindChoiceEvents();
    }

    // ── Input events ──────────────────────────────────────────

    _bindInputEvents() {
        this._inputEls.forEach(input => {
            input.addEventListener('click',  () => this._handleInputClick(input));
            input.addEventListener('input',  () => this._handleInputChange(input));
            input.addEventListener('focus',  () => this._setActiveInput(input));
            input.addEventListener('blur',   () => this._clearActiveInput(input));
        });
    }

    _handleInputClick(input) {
        if (this._activeChoice !== null) {
            this._fillInput(input, this._activeChoice);
            this._clearActiveChoice();
        } else {
            this._setActiveInput(input);
        }
    }

    _handleInputChange(input) {
        const index = parseInt(input.dataset.index);
        this._onChange(index, input.value.trim());
    }

    _setActiveInput(input) {
        this._clearActiveInput();
        this._activeInput = input;
        input.classList.add('fibmgt-active-target');
    }

    _clearActiveInput() {
        if (this._activeInput) {
            this._activeInput.classList.remove('fibmgt-active-target');
            this._activeInput = null;
        }
    }

    _fillInput(input, value) {
        input.value = value;
        const index = parseInt(input.dataset.index);
        this._onChange(index, value);
    }

    // ── Choice events ─────────────────────────────────────────

    _bindChoiceEvents() {
        this._choiceEls.forEach(choice => {
            choice.addEventListener('click', () => this._handleChoiceClick(choice));
        });
    }

    _handleChoiceClick(choice) {
        if (this._activeInput) {
            // fill active input immediately
            this._fillInput(this._activeInput, choice.dataset.value);
            this._clearActiveInput();
            this._clearActiveChoice();
        } else {
            // select choice, wait for input click
            if (this._activeChoice === choice.dataset.value &&
                choice.classList.contains('fibmgt-choice-active')) {
                this._clearActiveChoice();
            } else {
                this._clearActiveChoice();
                choice.classList.add('fibmgt-choice-active');
                this._activeChoice = choice.dataset.value;
            }
        }
    }

    _clearActiveChoice() {
        this._choiceEls.forEach(c => c.classList.remove('fibmgt-choice-active'));
        this._activeChoice = null;
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class FillInBlankMultiGraphTextComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized   = false;
        this._geometry      = new FillInBlankMultiGraphTextGeometry();
        this._renderer      = new FillInBlankMultiGraphTextRenderer(this._geometry);
        this._responses     = [];
        this._resizeHandler = () => this._renderer.positionBlocks();
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
        window.addEventListener('resize', this._resizeHandler);
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
        this._renderer.setCenterLabel(String(config.center_label ?? ''));

        const blocks = config.blocks || [];
        this._responses = this._initResponses(config);

        const inputEls  = this._renderer.renderBlocks(blocks, this._responses);
        const choiceEls = this._renderer.renderChoices(config.value_choices || []);

        const handler = new FillInBlankMultiGraphTextInteractionHandler(
            inputEls,
            choiceEls,
            (index, value) => this._onResponseChange(index, value)
        );
        handler.bind();

        requestAnimationFrame(() => this._renderer.positionBlocks());
    }

    // ── State ─────────────────────────────────────────────────

    _initResponses(config) {
        const count  = (config.blocks || []).length;
        const saved  = config.user_response;
        if (Array.isArray(saved) && saved.length === count) return [...saved];
        return Array(count).fill('');
    }

    _onResponseChange(index, value) {
        this._responses[index] = value;
        this.emitAnswerChanged();
    }

    // ── User Interaction / Events ─────────────────────────────

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.fibmgt-section-header');
        if (!header) return;
        const section = header.closest('.fibmgt-section');
        if (section) section.classList.toggle('fibmgt-collapsed');
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
            console.warn('FillInBlankMultiGraphTextComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.blocks) || config.blocks.length === 0) {
            console.warn('FillInBlankMultiGraphTextComponent: missing or empty blocks');
            return false;
        }
        return true;
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return [...this._responses];
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        window.removeEventListener('resize', this._resizeHandler);
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._responses     = [];
        this._toggleHandler = null;
        this._renderer      = new FillInBlankMultiGraphTextRenderer(this._geometry);
    }
}

customElements.define('fill-in-blank-multi-graph-text', FillInBlankMultiGraphTextComponent);