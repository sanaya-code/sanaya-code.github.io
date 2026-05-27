class TrueFalseRenderer {

    // ── Internal Infrastructure ───────────────────────────────

    createStructure(host, questionId) {
        if (host.querySelector('.tf-question')) return;
        host.innerHTML = `
            <div class="tf-question">

                <div class="tf-question-text"></div>

                <div class="tf-section" data-section="svg" style="display: none;">
                    <div class="tf-section-header">Figure</div>
                    <div class="tf-section-body">
                        <div class="tf-svg"></div>
                    </div>
                </div>

                <div class="tf-section" data-section="image" style="display: none;">
                    <div class="tf-section-header">Figure</div>
                    <div class="tf-section-body">
                        <div class="tf-image"></div>
                    </div>
                </div>

                <div class="tf-options">
                    <div class="tf-option">
                        <input type="radio" name="${questionId}" id="${questionId}-true" value="true">
                        <label for="${questionId}-true">True</label>
                    </div>
                    <div class="tf-option">
                        <input type="radio" name="${questionId}" id="${questionId}-false" value="false">
                        <label for="${questionId}-false">False</label>
                    </div>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root         = host.querySelector('.tf-question');
        this._svgSection   = root.querySelector('[data-section="svg"]');
        this._imageSection = root.querySelector('[data-section="image"]');
        this._questionEl   = root.querySelector('.tf-question-text');
        this._svgEl        = root.querySelector('.tf-svg');
        this._imageEl      = root.querySelector('.tf-image');
        this._optionsEl    = root.querySelector('.tf-options');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.textContent = question;
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

    // ── Accessor ──────────────────────────────────────────────

    getOptionsEl() {
        return this._optionsEl;
    }
}


class TrueFalseComponent extends HTMLElement {

    // ── Lifecycle ─────────────────────────────────────────────

    constructor() {
        super();
        this._initialized = false;
        this._questionId  = `tf-${crypto.randomUUID()}`;
        this._renderer    = new TrueFalseRenderer();
    }

    static get observedAttributes() {
        return ['config'];
    }

    connectedCallback() {
        if (this._initialized) return;
        this._renderer.createStructure(this, this._questionId);
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
        this._renderer.clear();
        this._renderer.setQuestion(config.question);
        this._renderer.setSvg(config.svg_content);
        this._renderer.setImage(config.img_url);
        this.setUserAnswer(config.user_response);
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('TrueFalseComponent: invalid config JSON', e);
            return {};
        }
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
        const header = e.target.closest('.tf-section-header');
        if (!header) return;
        const section = header.closest('.tf-section');
        if (section) section.classList.toggle('tf-collapsed');
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

    setUserAnswer(value) {
        if (value === null || value === undefined || value === '') return;
        const normalized = String(value);
        const input = this.querySelector(`#${this._questionId}-${normalized}`);
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
        this._renderer      = new TrueFalseRenderer();
    }
}

customElements.define('true-false', TrueFalseComponent);