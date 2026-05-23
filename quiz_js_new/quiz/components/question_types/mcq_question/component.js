class McqQuestion extends HTMLElement {

    constructor() {
        super();
        this._initialized    = false;
        this._optionsRendered = false;
        this._questionTextEl  = null;
        this._svgFigureEl     = null;
        this._imageFigureEl   = null;
        this._optionsEl       = null;
    }

    static get observedAttributes() {
        return ['config'];
    }

    connectedCallback() {
        this._ensureStructure();
        this._updateFromConfig();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config') {
            this._ensureStructure();
            this._updateFromConfig();
        }
    }

    // ── Structure ─────────────────────────────────────────────

    _ensureStructure() {
        if (this._initialized) return;
        this.innerHTML = `
            <div class="question-type question-panel mcq-question">
                <div class="question-text"></div>
                <div class="svg-figure" style="display: none;"></div>
                <div class="figure" style="display: none;"></div>
                <div class="options-container"></div>
            </div>
        `;
        const root            = this.querySelector('.mcq-question');
        this._questionTextEl  = root.querySelector('.question-text');
        this._svgFigureEl     = root.querySelector('.svg-figure');
        this._imageFigureEl   = root.querySelector('.figure');
        this._optionsEl       = root.querySelector('.options-container');
        this._initialized     = true;
    }

    // ── Config ────────────────────────────────────────────────

    _updateFromConfig() {
        let config = {};
        try {
            config = JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('McqQuestion: invalid config JSON', e);
            return;
        }
        const { question = '', svg_content = null, img_url = null, options = [], user_response = null } = config;
        this._renderQuestion(question);
        this._renderSvg(svg_content);
        this._renderImage(img_url);
        this._renderOptions(options, user_response);
        this._optionsRendered = true;
    }

    // ── Render ────────────────────────────────────────────────

    _renderQuestion(question) {
        this._questionTextEl.textContent = question;
    }

    _renderSvg(svgContent) {
        if (svgContent) {
            this._svgFigureEl.style.display = '';
            this._svgFigureEl.innerHTML = svgContent;
        } else {
            this._svgFigureEl.style.display = 'none';
            this._svgFigureEl.innerHTML = '';
        }
    }

    _renderImage(imgUrl) {
        if (imgUrl) {
            this._imageFigureEl.style.display = '';
            this._imageFigureEl.innerHTML = `<img src="${imgUrl}" alt="figure" />`;
        } else {
            this._imageFigureEl.style.display = 'none';
            this._imageFigureEl.innerHTML = '';
        }
    }

    _renderOptions(options, userResponse) {
        this._optionsEl.innerHTML = '';
        options.forEach(opt => this._addOption(opt, userResponse));
    }

    _addOption(opt, userResponse) {
        this._optionsEl.insertAdjacentHTML('beforeend', `
            <div class="option">
                <input  type="radio"
                        name="mcq"
                        id="${opt.id}"
                        value="${opt.id}"
                        ${opt.id === userResponse ? 'checked' : ''}>
                <label for="${opt.id}">${opt.text}</label>
            </div>
        `);
    }

    // ── Public API ────────────────────────────────────────────

    getUserAnswer() {
        if (!this._optionsRendered) return null;
        const selected = this.querySelector('input[type="radio"]:checked');
        return selected ? selected.value : null;
    }

    cleanup() {
        this.innerHTML        = '';
        this._initialized     = false;
        this._optionsRendered = false;
        this._questionTextEl  = null;
        this._svgFigureEl     = null;
        this._imageFigureEl   = null;
        this._optionsEl       = null;
    }

    disconnectedCallback() {
        this.cleanup();
    }
}

customElements.define('mcq-radio', McqQuestion);