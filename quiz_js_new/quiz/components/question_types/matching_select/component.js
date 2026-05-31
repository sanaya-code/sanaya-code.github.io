// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class MatchingSelectRenderer {

    createStructure(host) {
        if (host.querySelector('.mdrag-question')) return;
        host.innerHTML = `
            <div class="mdrag-question">

                <div class="mdrag-question-text"></div>

                <div class="mdrag-section" data-section="svg" style="display: none;">
                    <div class="mdrag-section-header">Figure</div>
                    <div class="mdrag-section-body">
                        <div class="mdrag-svg"></div>
                    </div>
                </div>

                <div class="mdrag-section" data-section="image" style="display: none;">
                    <div class="mdrag-section-header">Figure</div>
                    <div class="mdrag-section-body">
                        <div class="mdrag-image"></div>
                    </div>
                </div>

                <div class="mdrag-pairs"></div>
                <div class="mdrag-options"></div>

            </div>
        `;
    }

    cacheElements(host) {
        const root         = host.querySelector('.mdrag-question');
        this._svgSection   = root.querySelector('[data-section="svg"]');
        this._imageSection = root.querySelector('[data-section="image"]');
        this._questionEl   = root.querySelector('.mdrag-question-text');
        this._svgEl        = root.querySelector('.mdrag-svg');
        this._imageEl      = root.querySelector('.mdrag-image');
        this._pairsEl      = root.querySelector('.mdrag-pairs');
        this._optionsEl    = root.querySelector('.mdrag-options');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        this._pairsEl.innerHTML   = '';
        this._optionsEl.innerHTML = '';
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.innerHTML = question;             // ← innerHTML for rich content
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

    // ── Matching Specific ─────────────────────────────────────

    renderOptionBank(options = []) {
        this._optionsEl.innerHTML = '';
        return options.map(text => {
            const opt         = document.createElement('div');
            opt.className     = 'mdrag-option';
            opt.innerHTML     = text;                      // ← innerHTML for rich content
            opt.dataset.value = text;
            this._optionsEl.appendChild(opt);
            return opt;
        });
    }

    renderPairs(pairs = [], userResponse = []) {
        this._pairsEl.innerHTML = '';
        return pairs.map((pair, idx) => {
            const pairDiv     = document.createElement('div');
            pairDiv.className = 'mdrag-pair';

            const leftDiv     = document.createElement('div');
            leftDiv.className = 'mdrag-left';
            leftDiv.innerHTML = pair.left;                 // ← innerHTML for rich content

            const dropZone         = document.createElement('div');
            dropZone.className     = 'mdrag-drop-zone';
            dropZone.dataset.index = idx;

            if (userResponse[idx]) {
                dropZone.innerHTML     = userResponse[idx];  // ← innerHTML for rich content
                dropZone.dataset.value = userResponse[idx];
            }

            pairDiv.appendChild(leftDiv);
            pairDiv.appendChild(dropZone);
            this._pairsEl.appendChild(pairDiv);
            return dropZone;
        });
    }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — click/tap select and place logic
// ──────────────────────────────────────────────────────────────

class MatchingSelectInteractionHandler {
    constructor(optionEls, dropZones, onChange) {
        this._optionEls      = optionEls;
        this._dropZones      = dropZones;
        this._onChange       = onChange;
        this._selectedOption = null;
    }

    bind() {
        this._optionEls.forEach(opt  => this._bindOptionClick(opt));
        this._dropZones.forEach(zone => this._bindDropZoneClick(zone));
    }

    // ── Option click ──────────────────────────────────────────

    _bindOptionClick(opt) {
        opt.addEventListener('click', () => {
            if (this._selectedOption === opt) {
                this._deselectOption();
            } else {
                if (this._selectedOption) this._deselectOption();
                this._selectOption(opt);
            }
        });
    }

    _selectOption(opt) {
        this._selectedOption = opt;
        opt.classList.add('mdrag-selected');
    }

    _deselectOption() {
        if (!this._selectedOption) return;
        this._selectedOption.classList.remove('mdrag-selected');
        this._selectedOption = null;
    }

    getSelectedOption() {
        return this._selectedOption;
    }

    // ── Drop zone click ───────────────────────────────────────

    _bindDropZoneClick(zone) {
        zone.addEventListener('click', () => {
            if (!this._selectedOption) return;
            this._placeInDropZone(zone);
        });
    }

    _placeInDropZone(zone) {
        zone.innerHTML     = this._selectedOption.dataset.value; // ← innerHTML for rich content
        zone.dataset.value = this._selectedOption.dataset.value;
        this._deselectOption();
        this._onChange();
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class MatchingSelectComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized = false;
        this._renderer    = new MatchingSelectRenderer();
        this._dropZones   = [];
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
        this.renderInteractive(config);
    }

    renderInteractive(config) {
        const pairs        = config.pairs       || [];
        const distractors  = config.distractors || [];
        const userResponse = Array.isArray(config.user_response) ? config.user_response : [];
        const bankItems    = [...pairs.map(p => p.right), ...distractors];

        const optionEls  = this._renderer.renderOptionBank(bankItems);
        this._dropZones  = this._renderer.renderPairs(pairs, userResponse);

        const handler = new MatchingSelectInteractionHandler(
            optionEls,
            this._dropZones,
            () => this.emitAnswerChanged()
        );
        handler.bind();
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('MatchingSelectComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.pairs) || config.pairs.length === 0) {
            console.warn('MatchingSelectComponent: missing or empty pairs in config');
            return false;
        }
        return true;
    }

    // ── User Interaction / Events ─────────────────────────────

    bindToggleEvent() {
        this._toggleHandler = (e) => this.handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    handleSectionToggle(e) {
        const header = e.target.closest('.mdrag-section-header');
        if (!header) return;
        const section = header.closest('.mdrag-section');
        if (section) section.classList.toggle('mdrag-collapsed');
    }

    emitAnswerChanged() {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: this.getUserAnswer() },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return this._dropZones.map(zone => zone.dataset.value || '');
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._toggleHandler = null;
        this._dropZones     = [];
        this._renderer      = new MatchingSelectRenderer();
    }
}

customElements.define('matching-select', MatchingSelectComponent);