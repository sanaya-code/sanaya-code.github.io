// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class OptionsFillInBlankRenderer {

    createStructure(host) {
        if (host.querySelector('.fibmo-question-type')) return;
        host.innerHTML = `
            <div class="fibmo-question-type">

                <div class="fibmo-question"></div>

                <div class="fibmo-section" data-section="svg" style="display: none;">
                    <div class="fibmo-section-header">Figure</div>
                    <div class="fibmo-section-body">
                        <div class="fibmo-svg"></div>
                    </div>
                </div>

                <div class="fibmo-section" data-section="image" style="display: none;">
                    <div class="fibmo-section-header">Figure</div>
                    <div class="fibmo-section-body">
                        <div class="fibmo-img-new"></div>
                    </div>
                </div>

                <div class="fibmo-options"></div>
                <div class="fibmo-choices"></div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.fibmo-question-type');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._questionEl    = root.querySelector('.fibmo-question');
        this._svgEl         = root.querySelector('.fibmo-svg');
        this._imgEl         = root.querySelector('.fibmo-img-new');
        this._optionsEl     = root.querySelector('.fibmo-options');
        this._choicesEl     = root.querySelector('.fibmo-choices');
    }

    clear() {
        this._questionEl.innerHTML  = '';
        this.setSvg(null);
        this.setImage(null);
        this._optionsEl.innerHTML   = '';
        this._choicesEl.innerHTML   = '';
        this._choicesEl.style.display = 'none';
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.innerHTML = question;              // ← innerHTML for rich content
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
            this._imgEl.innerHTML = `<img src="${imgUrl}" alt="figure" />`;
        } else {
            this._imageSection.style.display = 'none';
            this._imgEl.innerHTML = '';
        }
    }

    // ── Options ───────────────────────────────────────────────

    // Renders all option rows, returns array of blank span arrays per option
    // blankSpans[optIndex][blankIndex] = spanEl
    renderOptions(options, responses, blankType, onBlankClick) {
        this._optionsEl.innerHTML = '';
        const blankSpans = [];

        options.forEach((opt, optIndex) => {
            const container     = document.createElement('div');
            container.className = 'fibmo-option';

            const label         = document.createElement('span');
            label.className     = 'mfib-option-label';
            label.textContent   = `${String.fromCharCode(97 + optIndex)}) `;
            container.appendChild(label);

            // split on one or more underscores
            const parts     = (opt.text || '').split(/____+/g);
            const optBlanks = [];

            parts.forEach((textPart, partIndex) => {
                // render text part as innerHTML for rich content
                if (textPart) {
                    const textSpan       = document.createElement('span');
                    textSpan.innerHTML   = textPart;         // ← innerHTML for rich content
                    container.appendChild(textSpan);
                }

                if (partIndex < parts.length - 1) {
                    const blankIndex = partIndex;
                    const value      = responses[optIndex]?.[blankIndex] || '';
                    const span       = this.createBlankSpan(optIndex, blankIndex, value, blankType);
                    span.addEventListener('click', () => onBlankClick(optIndex, blankIndex, span));
                    container.appendChild(span);
                    optBlanks.push(span);
                }
            });

            blankSpans.push(optBlanks);
            this._optionsEl.appendChild(container);
        });

        return blankSpans;
    }

    // ── Choices bank ──────────────────────────────────────────

    // Returns choice elements
    renderChoices(choices) {
        if (!choices || choices.length === 0) {
            this._choicesEl.style.display = 'none';
            this._choicesEl.innerHTML = '';
            return [];
        }

        this._choicesEl.style.display = '';
        this._choicesEl.innerHTML = '';

        return choices.map(ch => {
            const span       = document.createElement('span');
            span.className   = 'fibmo-choice';
            span.innerHTML   = String(ch);                  // ← innerHTML for rich content
            span.dataset.value = String(ch);
            this._choicesEl.appendChild(span);
            return span;
        });
    }

    // ── Blank span factory ────────────────────────────────────

    createBlankSpan(optIndex, blankIndex, value, blankType) {
        const span           = document.createElement('span');
        const typeClass      = blankType === 'box' ? 'fibmo-new-blank-box' : 'fibmo-new-blank-underline';
        span.className       = `fibmo-blank ${typeClass}${value ? ' filled' : ''}`;
        span.dataset.option  = String(optIndex);
        span.dataset.blank   = String(blankIndex);
        span.innerHTML       = value                        // ← innerHTML for rich content
            ? value
            : (blankType === 'box' ? '\u00A0\u00A0\u00A0\u00A0\u00A0' : '___');
        return span;
    }

    createInputEl(optIndex, blankIndex, value) {
        const input         = document.createElement('input');
        input.type          = 'text';
        input.className     = 'fibmo-input';
        input.value         = value;
        input.dataset.option = String(optIndex);
        input.dataset.blank  = String(blankIndex);
        return input;
    }

    // ── Accessors ─────────────────────────────────────────────

    getChoicesEl() { return this._choicesEl; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — blank clicks, choice selection, input
// ──────────────────────────────────────────────────────────────

class OptionsFillInBlankInteractionHandler {

    constructor(blankSpans, choiceEls, renderer, blankType, onResponseChange) {
        this._blankSpans      = blankSpans;
        this._choiceEls       = choiceEls;
        this._renderer        = renderer;
        this._blankType       = blankType;
        this._onResponseChange = onResponseChange;
        this._activeChoice    = null;
        this._currentInput    = null;
    }

    bind() {
        this._bindChoiceEvents();
        // blank events already bound during renderOptions via callback
    }

    // ── Choice events ─────────────────────────────────────────

    _bindChoiceEvents() {
        this._choiceEls.forEach(choice => {
            choice.addEventListener('click', () => this._handleChoiceClick(choice));
        });
    }

    _handleChoiceClick(choice) {
        this._clearActiveChoice();
        choice.classList.add('active');
        this._activeChoice = choice.dataset.value;
    }

    _clearActiveChoice() {
        this._choiceEls.forEach(c => c.classList.remove('active'));
        this._activeChoice = null;
    }

    // ── Blank click ───────────────────────────────────────────

    handleBlankClick(optIndex, blankIndex, spanEl) {
        if (this._activeChoice !== null) {
            this._fillBlank(optIndex, blankIndex, spanEl, this._activeChoice);
            this._clearActiveChoice();
        } else {
            this._activateInput(optIndex, blankIndex, spanEl);
        }
    }

    _fillBlank(optIndex, blankIndex, spanEl, value) {
        spanEl.innerHTML   = value;                         // ← innerHTML for rich content
        spanEl.classList.add('filled');
        this._onResponseChange(optIndex, blankIndex, value);
    }

    // ── Input activation / commit ─────────────────────────────

    _activateInput(optIndex, blankIndex, spanEl) {
        if (this._currentInput) this._commitCurrentInput();

        const value   = spanEl.dataset.value || '';
        const input   = this._renderer.createInputEl(optIndex, blankIndex, value);

        input.addEventListener('blur',    () => this._commitInput(input));
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter')  { e.preventDefault(); input.blur(); }
            if (e.key === 'Escape') { this._commitCurrentInput(); }
        });

        spanEl.replaceWith(input);
        input.focus();
        this._currentInput = input;
    }

    _commitCurrentInput() {
        if (!this._currentInput) return;
        this._commitInput(this._currentInput);
    }

    _commitInput(inputEl) {
        const optIndex   = parseInt(inputEl.dataset.option, 10);
        const blankIndex = parseInt(inputEl.dataset.blank,  10);
        const value      = inputEl.value.trim();

        const span = this._renderer.createBlankSpan(optIndex, blankIndex, value, this._blankType);
        span.addEventListener('click', () => this.handleBlankClick(optIndex, blankIndex, span));

        inputEl.replaceWith(span);
        this._currentInput = null;

        this._onResponseChange(optIndex, blankIndex, value);
    }

    commitCurrentInput() {
        this._commitCurrentInput();
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class OptionsFillInBlankComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized = false;
        this._renderer    = new OptionsFillInBlankRenderer();
        this._handler     = null;
        this._responses   = [];
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

        const blankType = config.blank_type || 'normal';
        this._responses = this._initResponses(config);

        const blankSpans = this._renderer.renderOptions(
            config.options || [],
            this._responses,
            blankType,
            (optIdx, blankIdx, span) => this._handler?.handleBlankClick(optIdx, blankIdx, span)
        );

        const choiceEls = this._renderer.renderChoices(config.choices || []);

        this._handler = new OptionsFillInBlankInteractionHandler(
            blankSpans,
            choiceEls,
            this._renderer,
            blankType,
            (optIdx, blankIdx, value) => this._onResponseChange(optIdx, blankIdx, value)
        );
        this._handler.bind();
    }

    // ── State ─────────────────────────────────────────────────

    _initResponses(config) {
        const opts     = config.options || [];
        const userResp = Array.isArray(config.user_response) ? config.user_response : null;

        return opts.map((opt, optIndex) => {
            const blanksCount = Math.max(0, (opt.text || '').split(/____+/g).length - 1);
            if (userResp && Array.isArray(userResp[optIndex])) {
                return Array(blanksCount).fill('').map((_, i) => userResp[optIndex][i] || '');
            }
            return Array(blanksCount).fill('');
        });
    }

    _onResponseChange(optIndex, blankIndex, value) {
        if (!this._responses[optIndex]) this._responses[optIndex] = [];
        this._responses[optIndex][blankIndex] = value;
        this.emitAnswerChanged();
    }

    // ── User Interaction / Events ─────────────────────────────

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.fibmo-section-header');
        if (!header) return;
        const section = header.closest('.fibmo-section');
        if (section) section.classList.toggle('fibmo-collapsed');
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
            console.warn('OptionsFillInBlankComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.options) || config.options.length === 0) {
            console.warn('OptionsFillInBlankComponent: missing or empty options');
            return false;
        }
        return true;
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        this._handler?.commitCurrentInput();
        return this._responses.map(row => [...row]);
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._handler       = null;
        this._responses     = [];
        this._toggleHandler = null;
        this._renderer      = new OptionsFillInBlankRenderer();
    }
}

customElements.define('options-fill-in-blank', OptionsFillInBlankComponent);