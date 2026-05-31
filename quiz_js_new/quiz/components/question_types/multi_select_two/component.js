// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class MultiSelectTwoRenderer {

    createStructure(host) {
        if (host.querySelector('.stq-wrapper')) return;
        host.innerHTML = `
            <div class="stq-wrapper">

                <div class="stq-section" data-section="svg" style="display: none;">
                    <div class="stq-section-header">Figure</div>
                    <div class="stq-section-body">
                        <div class="stq-svg-figure"></div>
                    </div>
                </div>

                <div class="stq-section" data-section="image" style="display: none;">
                    <div class="stq-section-header">Figure</div>
                    <div class="stq-section-body">
                        <div class="stq-figure"></div>
                    </div>
                </div>

                <div class="stq-container">
                    <div class="stq-question"></div>
                    <div class="stq-quantities"></div>
                    <div class="stq-instructions"></div>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.stq-wrapper');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._svgFigureEl   = root.querySelector('.stq-svg-figure');
        this._imageFigureEl = root.querySelector('.stq-figure');
        this._questionEl    = root.querySelector('.stq-question');
        this._quantitiesEl  = root.querySelector('.stq-quantities');
        this._instructionsEl= root.querySelector('.stq-instructions');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        this._quantitiesEl.innerHTML   = '';
        this._instructionsEl.innerHTML = '';
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

    // ── Quantities ────────────────────────────────────────────

    // Renders quantity elements, returns them for handler binding
    renderQuantities(quantities) {
        this._quantitiesEl.innerHTML = '';
        return quantities.map(q => {
            const div       = document.createElement('div');
            div.className   = 'stq-quantity';
            div.dataset.id  = q.id;
            div.innerHTML   = String(q.value);              // ← innerHTML for rich content
            this._quantitiesEl.appendChild(div);
            return div;
        });
    }

    renderInstructions(requiredSelections) {
        this._instructionsEl.innerHTML = requiredSelections
            .map(sel => `<div><strong>${sel.label}</strong> → ${sel.highlight_style.type} (${sel.highlight_style.value})</div>`)
            .join('');
    }

    // ── Highlight management ──────────────────────────────────

    // Resets all quantities then applies highlights from userResponse
    applyHighlights(quantityEls, userResponse, requiredSelections, quantities) {
        // reset all
        quantityEls.forEach((el) => {
            this.clearHighlight(el);
            const q = quantities.find(q => q.id === el.dataset.id);
            if (q) el.innerHTML = String(q.value);          // ← innerHTML for rich content
        });

        // apply each selection
        requiredSelections.forEach(sel => {
            const selectedId = userResponse[sel.key];
            if (!selectedId) return;
            const el = quantityEls.find(e => e.dataset.id === selectedId);
            if (el) this.applyHighlight(el, sel.highlight_style);
        });
    }

    applyHighlight(el, highlightStyle) {
        const { type, value } = highlightStyle;
        if (type === 'color') {
            el.classList.add(`highlight-color-${value}`);
        } else if (type === 'shape') {
            el.classList.add(`highlight-shape-${value}`);
        } else if (type === 'mark' && value === 'tick') {
            el.innerHTML += ' ✓';
        }
    }

    clearHighlight(el) {
        // remove all known highlight classes
        el.classList.remove(
            'highlight-color-red', 'highlight-color-green',
            'highlight-shape-circle', 'highlight-shape-square'
        );
    }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — quantity click, slot assignment
// ──────────────────────────────────────────────────────────────

class MultiSelectTwoInteractionHandler {

    constructor(quantityEls, requiredSelections, userResponse, onChange) {
        this._quantityEls       = quantityEls;
        this._requiredSelections = requiredSelections;
        this._userResponse      = { ...userResponse };
        this._onChange          = onChange;
    }

    bind() {
        this._quantityEls.forEach(el => {
            el.addEventListener('click', () => this._handleClick(el));
        });
    }

    _handleClick(el) {
        const id = el.dataset.id;
        let updated = false;

        // deselect if already assigned to any key
        for (const sel of this._requiredSelections) {
            if (this._userResponse[sel.key] === id) {
                this._userResponse[sel.key] = '';
                updated = true;
                break;
            }
        }

        // if not deselected, fill first empty slot
        if (!updated) {
            for (const sel of this._requiredSelections) {
                if (!this._userResponse[sel.key]) {
                    this._userResponse[sel.key] = id;
                    break;
                }
            }
        }

        this._onChange({ ...this._userResponse });
    }

    getResponse() {
        return { ...this._userResponse };
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class MultiSelectTwoComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized  = false;
        this._renderer     = new MultiSelectTwoRenderer();
        this._handler      = null;
        this._userResponse = {};
        this._quantityEls  = [];
        this._quantities   = [];
        this._requiredSelections = [];
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

        this._quantities         = config.quantities || [];
        this._requiredSelections = config.required_selections || [];
        this._userResponse       = { ...(config.user_response || {}) };

        this._renderer.clear();
        this._renderer.setQuestion(config.question);
        this._renderer.setSvg(config.svg_content);
        this._renderer.setImage(config.img_url);
        this._renderer.renderInstructions(this._requiredSelections);

        this._quantityEls = this._renderer.renderQuantities(this._quantities);
        this._renderer.applyHighlights(
            this._quantityEls,
            this._userResponse,
            this._requiredSelections,
            this._quantities
        );

        this._handler = new MultiSelectTwoInteractionHandler(
            this._quantityEls,
            this._requiredSelections,
            this._userResponse,
            (updated) => this._onResponseChange(updated)
        );
        this._handler.bind();
    }

    // ── State ─────────────────────────────────────────────────

    _onResponseChange(updated) {
        this._userResponse = updated;
        this._renderer.applyHighlights(
            this._quantityEls,
            this._userResponse,
            this._requiredSelections,
            this._quantities
        );
        this.emitAnswerChanged();
    }

    // ── User Interaction / Events ─────────────────────────────

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.stq-section-header');
        if (!header) return;
        const section = header.closest('.stq-section');
        if (section) section.classList.toggle('stq-collapsed');
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
            console.warn('MultiSelectTwoComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.quantities) || config.quantities.length === 0) {
            console.warn('MultiSelectTwoComponent: missing or empty quantities');
            return false;
        }
        return true;
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return this._handler ? this._handler.getResponse() : { ...this._userResponse };
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML         = '';
        this._initialized      = false;
        this._handler          = null;
        this._userResponse     = {};
        this._quantityEls      = [];
        this._toggleHandler    = null;
        this._renderer         = new MultiSelectTwoRenderer();
    }
}

customElements.define('multi-select-two', MultiSelectTwoComponent);