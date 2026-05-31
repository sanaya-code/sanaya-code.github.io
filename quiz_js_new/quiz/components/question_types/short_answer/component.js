// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class ShortAnswerRenderer {

    createStructure(host) {
        if (host.querySelector('.sa-question')) return;
        host.innerHTML = `
            <div class="sa-question">

                <div class="sa-question-text"></div>

                <div class="sa-section" data-section="svg" style="display: none;">
                    <div class="sa-section-header">Figure</div>
                    <div class="sa-section-body">
                        <div class="sa-svg-figure"></div>
                    </div>
                </div>

                <div class="sa-section" data-section="image" style="display: none;">
                    <div class="sa-section-header">Figure</div>
                    <div class="sa-section-body">
                        <div class="sa-figure"></div>
                    </div>
                </div>

                <div class="sa-answer-container">
                    <textarea class="sa-textarea"
                              placeholder="Type your answer here"
                              rows="4"></textarea>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.sa-question');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._questionEl    = root.querySelector('.sa-question-text');
        this._svgFigureEl   = root.querySelector('.sa-svg-figure');
        this._imageFigureEl = root.querySelector('.sa-figure');
        this._textarea      = root.querySelector('.sa-textarea');
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
        this._textarea.value = value;
    }

    // ── Accessor ──────────────────────────────────────────────

    getTextarea() { return this._textarea; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — textarea input event
// ──────────────────────────────────────────────────────────────

class ShortAnswerInteractionHandler {

    constructor(textarea, onChange) {
        this._textarea = textarea;
        this._onChange = onChange;
    }

    bind() {
        this._inputHandler = () => this._onChange(this._textarea.value);
        this._textarea.addEventListener('input', this._inputHandler);
    }

    unbind() {
        this._textarea.removeEventListener('input', this._inputHandler);
        this._inputHandler = null;
    }

    getValue() {
        return this._textarea.value;
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class ShortAnswerComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized = false;
        this._renderer    = new ShortAnswerRenderer();
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

        this._handler = new ShortAnswerInteractionHandler(
            this._renderer.getTextarea(),
            (value) => this.emitAnswerChanged(value)
        );
        this._handler.bind();
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('ShortAnswerComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !config.question) {
            console.warn('ShortAnswerComponent: missing question');
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
        const header = e.target.closest('.sa-section-header');
        if (!header) return;
        const section = header.closest('.sa-section');
        if (section) section.classList.toggle('sa-collapsed');
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
        this._renderer      = new ShortAnswerRenderer();
    }
}

customElements.define('short-answer', ShortAnswerComponent);