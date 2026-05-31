// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class MatchingDropdownRenderer {

    createStructure(host) {
        if (host.querySelector('.mdrop-question')) return;
        host.innerHTML = `
            <div class="mdrop-question">

                <div class="mdrop-question-text"></div>

                <div class="mdrop-section" data-section="svg" style="display: none;">
                    <div class="mdrop-section-header">Figure</div>
                    <div class="mdrop-section-body">
                        <div class="mdrop-svg-figure"></div>
                    </div>
                </div>

                <div class="mdrop-section" data-section="image" style="display: none;">
                    <div class="mdrop-section-header">Figure</div>
                    <div class="mdrop-section-body">
                        <div class="mdrop-image"></div>
                    </div>
                </div>

                <div class="mdrop-pairs"></div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.mdrop-question');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._questionEl    = root.querySelector('.mdrop-question-text');
        this._svgFigureEl   = root.querySelector('.mdrop-svg-figure');
        this._imageEl       = root.querySelector('.mdrop-image');
        this._pairsEl       = root.querySelector('.mdrop-pairs');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        this._pairsEl.innerHTML = '';
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
            this._imageEl.innerHTML = `<img src="${imgUrl}" alt="figure" />`;
        } else {
            this._imageSection.style.display = 'none';
            this._imageEl.innerHTML = '';
        }
    }

    // ── Pairs ─────────────────────────────────────────────────

    // Renders pairs with dropdowns, returns select elements
    renderPairs(pairs, options, userResponse) {
        this._pairsEl.innerHTML = '';
        return pairs.map((pair, idx) => {
            const div = document.createElement('div');
            div.className = 'mdrop-pair';

            const left = document.createElement('div');
            left.className = 'mdrop-left';
            left.innerHTML = pair.left;                     // ← innerHTML for rich content

            const select = document.createElement('select');
            select.className = 'mdrop-select';
            select.dataset.index = idx;

            const defaultOpt       = document.createElement('option');
            defaultOpt.value       = '';
            defaultOpt.textContent = 'Select match';
            select.appendChild(defaultOpt);

            options.forEach(optText => {
                const opt       = document.createElement('option');
                opt.value       = optText;
                opt.textContent = optText;                  // option text stays textContent
                select.appendChild(opt);
            });

            if (Array.isArray(userResponse) && userResponse[idx]) {
                select.value = userResponse[idx];
            }

            div.appendChild(left);
            div.appendChild(select);
            this._pairsEl.appendChild(div);
            return select;
        });
    }

    getPairsEl() { return this._pairsEl; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — select change events
// ──────────────────────────────────────────────────────────────

class MatchingDropdownInteractionHandler {

    constructor(selectEls, onChange) {
        this._selectEls = selectEls;
        this._onChange  = onChange;
    }

    bind() {
        this._selectEls.forEach(sel => {
            sel.addEventListener('change', () => this._handleChange());
        });
    }

    _handleChange() {
        this._onChange(this.getAnswer());
    }

    getAnswer() {
        return this._selectEls.map(sel => sel.value);
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class MatchingDropdownComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized = false;
        this._renderer    = new MatchingDropdownRenderer();
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

        this._renderer.clear();
        this._renderer.setQuestion(config.question);
        this._renderer.setSvg(config.svg_content);
        this._renderer.setImage(config.img_url);

        const pairs       = config.pairs       || [];
        const distractors = config.distractors || [];
        const options     = [...pairs.map(p => p.right), ...distractors];
        const userResp    = Array.isArray(config.user_response) ? config.user_response : [];

        const selectEls = this._renderer.renderPairs(pairs, options, userResp);

        this._handler = new MatchingDropdownInteractionHandler(
            selectEls,
            (answer) => this.emitAnswerChanged(answer)
        );
        this._handler.bind();
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('MatchingDropdownComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.pairs) || config.pairs.length === 0) {
            console.warn('MatchingDropdownComponent: missing or empty pairs');
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
        const header = e.target.closest('.mdrop-section-header');
        if (!header) return;
        const section = header.closest('.mdrop-section');
        if (section) section.classList.toggle('mdrop-collapsed');
    }

    emitAnswerChanged(answer) {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return this._handler ? this._handler.getAnswer() : [];
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._handler       = null;
        this._toggleHandler = null;
        this._renderer      = new MatchingDropdownRenderer();
    }
}

customElements.define('matching-dropdown', MatchingDropdownComponent);