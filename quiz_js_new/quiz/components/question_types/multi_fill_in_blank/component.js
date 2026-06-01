// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class MultiFillInBlankRenderer {

    createStructure(host) {
        if (host.querySelector('.mfib-question')) return;
        host.innerHTML = `
            <div class="mfib-question">

                <div class="mfib-section" data-section="svg" style="display: none;">
                    <div class="mfib-section-header">Figure</div>
                    <div class="mfib-section-body">
                        <div class="mfib-svg-figure"></div>
                    </div>
                </div>

                <div class="mfib-section" data-section="image" style="display: none;">
                    <div class="mfib-section-header">Figure</div>
                    <div class="mfib-section-body">
                        <div class="mfib-figure"></div>
                    </div>
                </div>

                <div class="mfib-question-text"></div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.mfib-question');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._svgFigureEl   = root.querySelector('.mfib-svg-figure');
        this._imageFigureEl = root.querySelector('.mfib-figure');
        this._questionEl    = root.querySelector('.mfib-question-text');
    }

    clear() {
        this._questionEl.innerHTML = '';
        this.setSvg(null);
        this.setImage(null);
    }

    // ── UI Rendering Helpers ──────────────────────────────────

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

    // ── Question with inline blanks ───────────────────────────

    // Splits question on ____ and builds text + blank spans
    // Returns blank span elements for event binding
    renderQuestion(questionText, blanksCount, responses, onBlankClick) {
        this._questionEl.innerHTML = '';
        const parts    = questionText.split(/____+/g);
        const frag     = document.createDocumentFragment();
        const blankEls = [];

        parts.forEach((part, i) => {
            // text part — render as HTML span for rich content
            if (part) {
                const textSpan     = document.createElement('span');
                textSpan.innerHTML = part;                  // ← innerHTML for rich content
                frag.appendChild(textSpan);
            }

            // blank span for each gap
            if (i < blanksCount) {
                const value = responses[i] || '';
                const span  = this.createBlankSpan(i, value);
                span.addEventListener('click', () => onBlankClick(i, span));
                frag.appendChild(span);
                blankEls.push(span);
            }
        });

        this._questionEl.appendChild(frag);
        return blankEls;
    }

    // ── Blank span factory ────────────────────────────────────

    createBlankSpan(index, value) {
        const span           = document.createElement('span');
        span.className       = `mfib-blank${value ? ' mfib-filled' : ''}`;
        span.dataset.index   = index;
        span.textContent     = value || '____';
        return span;
    }

    createInputEl(index, value) {
        const input         = document.createElement('input');
        input.type          = 'text';
        input.className     = 'mfib-input';
        input.value         = value;
        input.dataset.index = index;
        return input;
    }

    getQuestionEl() { return this._questionEl; }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class MultiFillInBlankComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized   = false;
        this._renderer      = new MultiFillInBlankRenderer();
        this._responses     = [];
        this._currentInput  = null;
        this._config        = null;
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

        this._config    = config;
        this._responses = Array.isArray(config.user_response)
            ? [...config.user_response]
            : Array(config.blanks.length).fill('');

        this._renderer.clear();
        this._renderer.setSvg(config.svg_content);
        this._renderer.setImage(config.img_url);

        this._renderer.renderQuestion(
            config.question || '',
            config.blanks.length,
            this._responses,
            (index, span) => this._activateInput(index, span)
        );
    }

    // ── Input activation / commit ─────────────────────────────

    _activateInput(index, span) {
        if (this._currentInput) this._commitCurrentInput();

        const value  = this._responses[index] || '';
        const input  = this._renderer.createInputEl(index, value);

        input.addEventListener('blur',    () => this._commitInput(input));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter')  { e.preventDefault(); input.blur(); }
            if (e.key === 'Escape') {
                // cancel — restore previous span
                const oldSpan = this._renderer.createBlankSpan(index, this._responses[index]);
                oldSpan.addEventListener('click', () => this._activateInput(index, oldSpan));
                input.removeEventListener('blur', () => this._commitInput(input));
                input.replaceWith(oldSpan);
                this._currentInput = null;
            }
        });

        span.replaceWith(input);
        input.focus();
        input.select();
        this._currentInput = input;
    }

    _commitCurrentInput() {
        if (!this._currentInput) return;
        this._commitInput(this._currentInput);
    }

    _commitInput(inputEl) {
        const index = parseInt(inputEl.dataset.index, 10);
        const value = inputEl.value.trim();

        this._responses[index] = value;

        const newSpan = this._renderer.createBlankSpan(index, value);
        newSpan.addEventListener('click', () => this._activateInput(index, newSpan));
        inputEl.replaceWith(newSpan);
        this._currentInput = null;

        this.emitAnswerChanged();
    }

    // ── User Interaction / Events ─────────────────────────────

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.mfib-section-header');
        if (!header) return;
        const section = header.closest('.mfib-section');
        if (section) section.classList.toggle('mfib-collapsed');
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
            console.warn('MultiFillInBlankComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !config.question || !Array.isArray(config.blanks)) {
            console.warn('MultiFillInBlankComponent: missing question or blanks');
            return false;
        }
        return true;
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        this._commitCurrentInput();
        return [...this._responses];
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._responses     = [];
        this._currentInput  = null;
        this._config        = null;
        this._toggleHandler = null;
        this._renderer      = new MultiFillInBlankRenderer();
    }
}

customElements.define('multi-fill-in-blank', MultiFillInBlankComponent);