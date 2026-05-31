// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class MultiSelectCircleRenderer {

    createStructure(host) {
        if (host.querySelector('.msc-wrapper')) return;
        host.innerHTML = `
            <div class="msc-wrapper">

                <div class="msc-section" data-section="svg" style="display: none;">
                    <div class="msc-section-header">Figure</div>
                    <div class="msc-section-body">
                        <div class="msc-svg-figure"></div>
                    </div>
                </div>

                <div class="msc-section" data-section="image" style="display: none;">
                    <div class="msc-section-header">Figure</div>
                    <div class="msc-section-body">
                        <div class="msc-figure"></div>
                    </div>
                </div>

                <div class="msc-container">
                    <div class="msc-question"></div>
                    <div class="msc-options"></div>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.msc-wrapper');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._svgFigureEl   = root.querySelector('.msc-svg-figure');
        this._imageFigureEl = root.querySelector('.msc-figure');
        this._questionEl    = root.querySelector('.msc-question');
        this._optionsEl     = root.querySelector('.msc-options');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        this._optionsEl.innerHTML = '';
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

    // ── Options ───────────────────────────────────────────────

    // Renders option elements, returns them for handler binding
    renderOptions(options, selectedIds) {
        this._optionsEl.innerHTML = '';
        return options.map(opt => {
            const div       = document.createElement('div');
            div.className   = 'msc-option';
            div.dataset.id  = opt.id;
            div.innerHTML   = opt.text;                     // ← innerHTML for rich content
            if (selectedIds.includes(opt.id)) {
                div.classList.add('msc-selected');
            }
            this._optionsEl.appendChild(div);
            return div;
        });
    }

    // Toggle selected class on a single option — no re-render
    setOptionSelected(el, selected) {
        el.classList.toggle('msc-selected', selected);
    }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — option click, selection state
// ──────────────────────────────────────────────────────────────

class MultiSelectCircleInteractionHandler {

    constructor(optionEls, selectedIds, maxSelections, onChange) {
        this._optionEls    = optionEls;
        this._selected     = new Set(selectedIds);
        this._max          = maxSelections || Infinity;
        this._onChange     = onChange;
    }

    bind() {
        this._optionEls.forEach(el => {
            el.addEventListener('click', () => this._handleOptionClick(el));
        });
    }

    _handleOptionClick(el) {
        const id = el.dataset.id;

        if (this._selected.has(id)) {
            // deselect
            this._selected.delete(id);
            this._onChange(id, false, [...this._selected]);
        } else {
            // select only if under max
            if (this._selected.size < this._max) {
                this._selected.add(id);
                this._onChange(id, true, [...this._selected]);
            }
        }
    }

    getSelected() {
        return [...this._selected];
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class MultiSelectCircleComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized = false;
        this._renderer    = new MultiSelectCircleRenderer();
        this._handler     = null;
        this._userResponse = [];
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

        this._userResponse = Array.isArray(config.user_response)
            ? [...config.user_response]
            : [];

        this._renderer.clear();
        this._renderer.setQuestion(config.question);
        this._renderer.setSvg(config.svg_content);
        this._renderer.setImage(config.img_url);

        const optionEls = this._renderer.renderOptions(
            config.options || [],
            this._userResponse
        );

        this._handler = new MultiSelectCircleInteractionHandler(
            optionEls,
            this._userResponse,
            config.maximum_selections,
            (id, selected, allSelected) => this._onSelectionChange(id, selected, allSelected, optionEls)
        );
        this._handler.bind();
    }

    // ── State ─────────────────────────────────────────────────

    _onSelectionChange(id, selected, allSelected, optionEls) {
        this._userResponse = allSelected;
        // update only the clicked option's visual — no re-render
        const el = optionEls.find(o => o.dataset.id === id);
        if (el) this._renderer.setOptionSelected(el, selected);
        this.emitAnswerChanged();
    }

    // ── User Interaction / Events ─────────────────────────────

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.msc-section-header');
        if (!header) return;
        const section = header.closest('.msc-section');
        if (section) section.classList.toggle('msc-collapsed');
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
            console.warn('MultiSelectCircleComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.options) || config.options.length === 0) {
            console.warn('MultiSelectCircleComponent: missing or empty options');
            return false;
        }
        return true;
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return this._handler ? this._handler.getSelected() : [...this._userResponse];
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML       = '';
        this._initialized    = false;
        this._handler        = null;
        this._userResponse   = [];
        this._toggleHandler  = null;
        this._renderer       = new MultiSelectCircleRenderer();
    }
}

customElements.define('multi-select-circle', MultiSelectCircleComponent);