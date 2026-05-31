class McqRenderer {

    // ── Internal Infrastructure ───────────────────────────────

    createStructure(host) {
        if (host.querySelector('.mcq-question')) return;
        host.innerHTML = `
            <div class="mcq-question">

                <div class="mcq-question-text"></div>

                <div class="mcq-section" data-section="svg" style="display: none;">
                    <div class="mcq-section-header">Figure</div>
                    <div class="mcq-section-body">
                        <div class="mcq-svg"></div>
                    </div>
                </div>

                <div class="mcq-section" data-section="image" style="display: none;">
                    <div class="mcq-section-header">Figure</div>
                    <div class="mcq-section-body">
                        <div class="mcq-image"></div>
                    </div>
                </div>

                <div class="mcq-options"></div>

            </div>
        `;
    }

    cacheElements(host) {
        const root         = host.querySelector('.mcq-question');
        this._svgSection   = root.querySelector('[data-section="svg"]');
        this._imageSection = root.querySelector('[data-section="image"]');
        this._questionEl   = root.querySelector('.mcq-question-text');
        this._svgEl        = root.querySelector('.mcq-svg');
        this._imageEl      = root.querySelector('.mcq-image');
        this._optionsEl    = root.querySelector('.mcq-options');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        this._optionsEl.innerHTML = '';
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.innerHTML = question;
    }

    setSvg(svgContent) {
        if (svgContent) {
            this._svgSection.style.display = '';
            this._svgEl.innerHTML = svgContent;
        } else {
            this._svgSection.style.display = 'none';
            this._svgEl.innerHTML = '';
        }
    }

    setImage(imgUrl) {
        if (imgUrl) {
            this._imageSection.style.display = '';
            this._imageEl.innerHTML = `<img src="${imgUrl}" alt="figure" />`;
        } else {
            this._imageSection.style.display = 'none';
            this._imageEl.innerHTML = '';
        }
    }

    // ── MCQ Specific ──────────────────────────────────────────

    setOptions(options = [], questionId) {
        this._optionsEl.innerHTML = '';
        options.forEach(opt => {
            this._optionsEl.appendChild(this.createOptionElement(opt, questionId));
        });
    }

    createOptionElement(opt, questionId) {
        const optId   = `${questionId}-${opt.id}`;
        const div     = document.createElement('div');
        div.className = 'mcq-option';
        div.innerHTML = `
            <input  type="radio"
                    name="${questionId}"
                    id="${optId}"
                    value="${opt.id}">
            <label for="${optId}">${opt.text}</label>
        `;
        return div;
    }

    // ── Accessor ──────────────────────────────────────────────

    getOptionsEl() {
        return this._optionsEl;
    }
}


class McqQuestion extends HTMLElement {

    // ── Lifecycle ─────────────────────────────────────────────

    constructor() {
        super();
        this._initialized = false;
        this._questionId  = `mcq-${crypto.randomUUID()}`;
        this._renderer    = new McqRenderer();
    }

    static get observedAttributes() {
        return ['config'];
    }

    connectedCallback() {
        if (this._initialized) return;
        this._renderer.createStructure(this);
        this._renderer.cacheElements(this);
        this.bindEvents();
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
        this._renderer.setOptions(config.options, this._questionId);
        this.setUserAnswer(config.user_response);
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('McqQuestion: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.options) || config.options.length === 0) {
            console.warn('McqQuestion: missing or empty options in config');
            return false;
        }
        return true;
    }

    // ── User Interaction / Events ─────────────────────────────

    bindEvents() {
        this._changeHandler = (e) => this.handleOptionChange(e);
        this._renderer.getOptionsEl().addEventListener('change', this._changeHandler);

        // Delegated click for collapsible section headers
        this._toggleHandler = (e) => this.handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    handleOptionChange(e) {
        if (e.target.type === 'radio') {
            this.emitAnswerChanged(e.target.value);
        }
    }

    handleSectionToggle(e) {
        const header = e.target.closest('.mcq-section-header');
        if (!header) return;
        const section = header.closest('.mcq-section');
        if (section) section.classList.toggle('mcq-collapsed');
    }

    emitAnswerChanged(value) {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: value },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        const selected = this.querySelector('input[type="radio"]:checked');
        return selected ? selected.value : null;
    }

    setUserAnswer(optionId) {
        if (!optionId) return;
        const input = this.querySelector(`#${this._questionId}-${optionId}`);
        if (input) input.checked = true;
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this._renderer.getOptionsEl()?.removeEventListener('change', this._changeHandler);
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._changeHandler = null;
        this._toggleHandler = null;
        this._renderer      = new McqRenderer();
    }
}

customElements.define('mcq-radio', McqQuestion);