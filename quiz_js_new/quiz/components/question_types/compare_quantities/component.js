// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class CompareQuantitiesRenderer {

    createStructure(host) {
        if (host.querySelector('.cmp-qq-wrapper')) return;
        host.innerHTML = `
            <div class="cmp-qq-wrapper">

                <div class="cmp-qq-question-text"></div>

                <div class="cmp-qq-section" data-section="svg" style="display: none;">
                    <div class="cmp-qq-section-header">Figure</div>
                    <div class="cmp-qq-section-body">
                        <div class="cmp-qq-svg-figure"></div>
                    </div>
                </div>

                <div class="cmp-qq-section" data-section="image" style="display: none;">
                    <div class="cmp-qq-section-header">Figure</div>
                    <div class="cmp-qq-section-body">
                        <div class="cmp-qq-figure"></div>
                    </div>
                </div>

                <div class="cmp-qq-options-container">
                    <div class="cmp-qq-option cmp-qq-quantity-a"></div>
                    <div class="cmp-qq-option cmp-qq-symbol" title="Click to change"></div>
                    <div class="cmp-qq-option cmp-qq-quantity-b"></div>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.cmp-qq-wrapper');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._questionEl    = root.querySelector('.cmp-qq-question-text');
        this._svgFigureEl   = root.querySelector('.cmp-qq-svg-figure');
        this._imageFigureEl = root.querySelector('.cmp-qq-figure');
        this._quantityAEl   = root.querySelector('.cmp-qq-quantity-a');
        this._quantityBEl   = root.querySelector('.cmp-qq-quantity-b');
        this._symbolEl      = root.querySelector('.cmp-qq-symbol');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        this._quantityAEl.innerHTML = '';
        this._quantityBEl.innerHTML = '';
        this._symbolEl.textContent  = '';
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

    // ── Compare Specific ──────────────────────────────────────

    setQuantityA(quantity) {
        this._quantityAEl.innerHTML = `
            <strong>${quantity.label || ''}</strong> ${quantity.value || ''}
            ${quantity.description ? `<br><small>${quantity.description}</small>` : ''}
        `;
    }

    setQuantityB(quantity) {
        this._quantityBEl.innerHTML = `
            <strong>${quantity.label || ''}</strong> ${quantity.value || ''}
            ${quantity.description ? `<br><small>${quantity.description}</small>` : ''}
        `;
    }

    setSymbol(value, isFixed) {
        this._symbolEl.textContent = value;
        if (isFixed) {
            this._symbolEl.classList.remove('cmp-qq-symbol');
            this._symbolEl.classList.add('cmp-qq-symbol-fixed');
            this._symbolEl.removeAttribute('title');
        } else {
            this._symbolEl.classList.remove('cmp-qq-symbol-fixed');
            this._symbolEl.classList.add('cmp-qq-symbol');
            this._symbolEl.title = 'Click to change';
        }
    }

    updateSymbolDisplay(value) {
        this._symbolEl.textContent = value;
    }

    // ── Accessors ─────────────────────────────────────────────

    getSymbolEl() { return this._symbolEl; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — symbol click toggle
// ──────────────────────────────────────────────────────────────

class CompareQuantitiesInteractionHandler {

    constructor(symbolEl, symbolOptions, initialSymbol, onChange) {
        this._symbolEl      = symbolEl;
        this._symbolOptions = symbolOptions;
        this._onChange      = onChange;
        this._currentIndex  = 0;

        // restore from user_response or default to 0
        if (initialSymbol !== null && initialSymbol !== undefined && initialSymbol !== '') {
            const idx = symbolOptions.indexOf(initialSymbol);
            this._currentIndex = idx !== -1 ? idx : 0;
        }
    }

    bind(isFixed) {
        if (isFixed) return;
        this._bindSymbolClick();
    }

    // ── Symbol click ──────────────────────────────────────────

    _bindSymbolClick() {
        this._clickHandler = () => this._handleSymbolClick();
        this._symbolEl.addEventListener('click', this._clickHandler);
    }

    _handleSymbolClick() {
        this._currentIndex = (this._currentIndex + 1) % this._symbolOptions.length;
        this._symbolEl.textContent = this._symbolOptions[this._currentIndex];
        this._onChange(this.getSelectedSymbol());
    }

    // ── Public API ────────────────────────────────────────────

    getSelectedSymbol() {
        return this._symbolOptions[this._currentIndex];
    }

    setSymbol(value) {
        const idx = this._symbolOptions.indexOf(value);
        if (idx !== -1) {
            this._currentIndex = idx;
            this._symbolEl.textContent = value;
        }
    }

    unbind() {
        if (this._clickHandler) {
            this._symbolEl.removeEventListener('click', this._clickHandler);
            this._clickHandler = null;
        }
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class CompareQuantitiesComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized = false;
        this._renderer    = new CompareQuantitiesRenderer();
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
        this._renderer.setQuantityA(config.quantity_a);
        this._renderer.setQuantityB(config.quantity_b);

        const symbolOptions  = config.symbol_options || ['>', '<', '='];
        const isFixed        = config.initial_symbol !== undefined && config.initial_symbol !== null;
        const initialValue   = isFixed ? config.initial_symbol : (config.user_response || '');

        this._renderer.setSymbol(initialValue || symbolOptions[0], isFixed);

        this._handler = new CompareQuantitiesInteractionHandler(
            this._renderer.getSymbolEl(),
            symbolOptions,
            initialValue,
            (value) => this.emitAnswerChanged(value)
        );
        this._handler.bind(isFixed);
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('CompareQuantitiesComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !config.quantity_a || !config.quantity_b) {
            console.warn('CompareQuantitiesComponent: missing quantity_a or quantity_b');
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
        const header = e.target.closest('.cmp-qq-section-header');
        if (!header) return;
        const section = header.closest('.cmp-qq-section');
        if (section) section.classList.toggle('cmp-qq-collapsed');
    }

    emitAnswerChanged(value) {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: value },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return this._handler ? this._handler.getSelectedSymbol() : null;
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this._handler?.unbind();
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._handler       = null;
        this._toggleHandler = null;
        this._renderer      = new CompareQuantitiesRenderer();
    }
}

customElements.define('compare-quantities', CompareQuantitiesComponent);