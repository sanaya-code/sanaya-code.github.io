// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class FillInBlankRenderer {

    createStructure(host) {
        if (host.querySelector('.fib-question')) return;
        host.innerHTML = `
            <div class="fib-question">

                <div class="fib-question-text"></div>

                <div class="fib-section" data-section="svg" style="display: none;">
                    <div class="fib-section-header">Figure</div>
                    <div class="fib-section-body">
                        <div class="fib-svg-figure"></div>
                    </div>
                </div>

                <div class="fib-section" data-section="image" style="display: none;">
                    <div class="fib-section-header">Figure</div>
                    <div class="fib-section-body">
                        <div class="fib-figure"></div>
                    </div>
                </div>

                <div class="fib-answer-container">
                    <input type="text"
                           class="fib-input"
                           placeholder="Type your answer here" />
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.fib-question');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._questionEl    = root.querySelector('.fib-question-text');
        this._svgFigureEl   = root.querySelector('.fib-svg-figure');
        this._imageFigureEl = root.querySelector('.fib-figure');
        this._input         = root.querySelector('.fib-input');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        this.setValue('');
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.innerHTML = question;              // ← innerHTML for rich content
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

    setValue(value = '') {
        this._input.value = value;
    }

    getInput() { return this._input; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — input event
// ──────────────────────────────────────────────────────────────

class FillInBlankInteractionHandler {

    constructor(input, onChange) {
        this._input    = input;
        this._onChange = onChange;
    }

    bind() {
        this._inputHandler = () => this._onChange(this._input.value);
        this._input.addEventListener('input', this._inputHandler);
    }

    unbind() {
        this._input.removeEventListener('input', this._inputHandler);
        this._inputHandler = null;
    }

    getValue() {
        return this._input.value;
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class FillInBlankComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized = false;
        this._renderer    = new FillInBlankRenderer();
        this._handler     = null;
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

        this._handler?.unbind();

        this._renderer.clear();
        this._renderer.setQuestion(config.question);
        this._renderer.setSvg(config.svg_content);
        this._renderer.setImage(config.img_url);
        this._renderer.setValue(config.user_response || '');

        this._handler = new FillInBlankInteractionHandler(
            this._renderer.getInput(),
            (value) => this.emitAnswerChanged(value)
        );
        this._handler.bind();
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('FillInBlankComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !config.question) {
            console.warn('FillInBlankComponent: missing question');
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
        const header = e.target.closest('.fib-section-header');
        if (!header) return;
        const section = header.closest('.fib-section');
        if (section) section.classList.toggle('fib-collapsed');
    }

    emitAnswerChanged(value) {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: value },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return this._handler ? this._handler.getValue() : '';
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this._handler?.unbind();
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._handler       = null;
        this._toggleHandler = null;
        this._renderer      = new FillInBlankRenderer();
    }
}

customElements.define('fill-in-blank', FillInBlankComponent);