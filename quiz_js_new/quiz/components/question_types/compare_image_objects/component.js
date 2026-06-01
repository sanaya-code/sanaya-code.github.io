// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class CompareImageObjectsRenderer {

    createStructure(host) {
        if (host.querySelector('.icqt-wrapper')) return;
        host.innerHTML = `
            <div class="icqt-wrapper">

                <div class="icqt-section" data-section="extra-svg" style="display: none;">
                    <div class="icqt-section-header">Figure</div>
                    <div class="icqt-section-body">
                        <div class="icqt-extra-svg"></div>
                    </div>
                </div>

                <div class="icqt-question-text"></div>

                <div class="icqt-figure-wrapper">
                    <div class="icqt-image-holder"></div>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root           = host.querySelector('.icqt-wrapper');
        this._extraSvgSection = root.querySelector('[data-section="extra-svg"]');
        this._extraSvgEl     = root.querySelector('.icqt-extra-svg');
        this._questionEl     = root.querySelector('.icqt-question-text');
        this._imageHolder    = root.querySelector('.icqt-image-holder');
    }

    clear() {
        this.setQuestion('');
        this._imageHolder.innerHTML = '';
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.innerHTML = question;              // ← innerHTML for rich content
    }

    // ── Image / SVG content ───────────────────────────────────

    setContent(svgContent, imgUrl) {
        this._imageHolder.innerHTML = '';

        if (svgContent) {
            this._imageHolder.innerHTML = svgContent;
        } else if (imgUrl) {
            const img = document.createElement('img');
            img.src   = imgUrl;
            img.alt   = 'Comparison image';
            this._imageHolder.appendChild(img);
        }
    }

    // ── Tick boxes ────────────────────────────────────────────

    // Renders tick boxes and returns them for handler binding
    renderTickBoxes(tickZones, selectedSide) {
        // remove existing tick boxes
        this._imageHolder.querySelectorAll('.icqt-tick-box').forEach(b => b.remove());

        const tickEls = {};

        Object.entries(tickZones || {}).forEach(([side, position]) => {
            const box       = document.createElement('div');
            const posClass  = `icqt-${position.replace('_', '-')}`;
            box.className   = `icqt-tick-box ${posClass}`;
            box.dataset.side = side;

            if (selectedSide === side) {
                box.classList.add('icqt-selected');
            }

            this._imageHolder.appendChild(box);
            tickEls[side] = box;
        });

        return tickEls;
    }

    setTickSelected(tickEls, side) {
        Object.entries(tickEls).forEach(([s, el]) => {
            el.classList.toggle('icqt-selected', s === side);
        });
    }

    getImageHolder() { return this._imageHolder; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — tick box click events
// ──────────────────────────────────────────────────────────────

class CompareImageObjectsInteractionHandler {

    constructor(tickEls, renderer, onSelect) {
        this._tickEls  = tickEls;
        this._renderer = renderer;
        this._onSelect = onSelect;
        this._selected = null;
    }

    bind() {
        Object.entries(this._tickEls).forEach(([side, el]) => {
            el.addEventListener('click', () => this._handleClick(side));
        });
    }

    _handleClick(side) {
        if (this._selected === side) return;          // already selected — no change
        this._selected = side;
        this._renderer.setTickSelected(this._tickEls, side);
        this._onSelect(side);
    }

    setInitialSelected(side) {
        this._selected = side || null;
    }

    getSelected() {
        return this._selected;
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class CompareImageObjectsComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized = false;
        this._renderer    = new CompareImageObjectsRenderer();
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

        const selectedSide = config.user_response || null;

        this._renderer.clear();
        this._renderer.setQuestion(config.question);
        this._renderer.setContent(config.svg_content, config.img_url);

        const tickEls = this._renderer.renderTickBoxes(
            config.tick_zones || {},
            selectedSide
        );

        this._handler = new CompareImageObjectsInteractionHandler(
            tickEls,
            this._renderer,
            (side) => this._onSideSelected(side)
        );
        this._handler.setInitialSelected(selectedSide);
        this._handler.bind();
    }

    // ── State ─────────────────────────────────────────────────

    _onSideSelected(side) {
        this.emitAnswerChanged(side);
    }

    // ── User Interaction / Events ─────────────────────────────

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.icqt-section-header');
        if (!header) return;
        const section = header.closest('.icqt-section');
        if (section) section.classList.toggle('icqt-collapsed');
    }

    emitAnswerChanged(answer) {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer },
            bubbles: true,
        }));
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('CompareImageObjectsComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !config.tick_zones) {
            console.warn('CompareImageObjectsComponent: missing tick_zones');
            return false;
        }
        return true;
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return this._handler ? this._handler.getSelected() : null;
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._handler       = null;
        this._toggleHandler = null;
        this._renderer      = new CompareImageObjectsRenderer();
    }
}

customElements.define('compare-image-objects', CompareImageObjectsComponent);