class MultiSelectRenderer {

    // ── Internal Infrastructure ───────────────────────────────

    createStructure(host) {
        if (host.querySelector('.ms-question')) return;
        host.innerHTML = `
            <div class="ms-question">

                <div class="ms-question-text"></div>

                <div class="ms-section" data-section="svg" style="display: none;">
                    <div class="ms-section-header">Figure</div>
                    <div class="ms-section-body">
                        <div class="ms-svg"></div>
                    </div>
                </div>

                <div class="ms-section" data-section="image" style="display: none;">
                    <div class="ms-section-header">Figure</div>
                    <div class="ms-section-body">
                        <div class="ms-image"></div>
                    </div>
                </div>

                <div class="ms-options"></div>

            </div>
        `;
    }

    cacheElements(host) {
        const root         = host.querySelector('.ms-question');
        this._svgSection   = root.querySelector('[data-section="svg"]');
        this._imageSection = root.querySelector('[data-section="image"]');
        this._questionEl   = root.querySelector('.ms-question-text');
        this._svgEl        = root.querySelector('.ms-svg');
        this._imageEl      = root.querySelector('.ms-image');
        this._optionsEl    = root.querySelector('.ms-options');
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

    // ── Multi-Select Specific ─────────────────────────────────

    setOptions(options = [], questionId) {
        this._optionsEl.innerHTML = '';
        options.forEach(opt => {
            this._optionsEl.appendChild(this.createOptionElement(opt, questionId));
        });
    }

    createOptionElement(opt, questionId) {
        const optId   = `${questionId}-${opt.id}`;
        const div     = document.createElement('div');
        div.className = 'ms-option';
        div.innerHTML = `
            <input  type="checkbox"
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


class MultiSelectComponent extends HTMLElement {

    // ── Lifecycle ─────────────────────────────────────────────

    constructor() {
        super();
        this._initialized = false;
        this._questionId  = `ms-${crypto.randomUUID()}`;
        this._renderer    = new MultiSelectRenderer();
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
            console.warn('MultiSelectComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.options) || config.options.length === 0) {
            console.warn('MultiSelectComponent: missing or empty options in config');
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
        if (e.target.type === 'checkbox') {
            this.emitAnswerChanged(this.getUserAnswer());
        }
    }

    handleSectionToggle(e) {
        const header = e.target.closest('.ms-section-header');
        if (!header) return;
        const section = header.closest('.ms-section');
        if (section) section.classList.toggle('ms-collapsed');
    }

    emitAnswerChanged(value) {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: value },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        const checked = this.querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checked).map(cb => cb.value);
    }

    setUserAnswer(selected) {
        if (!Array.isArray(selected)) return;
        const checkboxes = this.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(cb => {
            cb.checked = selected.includes(cb.value);
        });
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this._renderer.getOptionsEl()?.removeEventListener('change', this._changeHandler);
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._changeHandler = null;
        this._toggleHandler = null;
        this._renderer      = new MultiSelectRenderer();
    }
}

customElements.define('multi-select', MultiSelectComponent);