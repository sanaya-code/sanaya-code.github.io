// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class OrderingHorizontalRenderer {

    createStructure(host) {
        if (host.querySelector('.oh-question-wrapper')) return;
        host.innerHTML = `
            <div class="oh-question-wrapper">

                <div class="oh-question"></div>

                <div class="oh-section" data-section="svg" style="display: none;">
                    <div class="oh-section-header">Figure</div>
                    <div class="oh-section-body">
                        <div class="oh-svg-figure"></div>
                    </div>
                </div>

                <div class="oh-section" data-section="image" style="display: none;">
                    <div class="oh-section-header">Figure</div>
                    <div class="oh-section-body">
                        <div class="oh-figure"></div>
                    </div>
                </div>

                <div class="oh-sequence">
                    <div class="oh-line"></div>
                </div>

                <div class="oh-items"></div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.oh-question-wrapper');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._questionEl    = root.querySelector('.oh-question');
        this._svgFigureEl   = root.querySelector('.oh-svg-figure');
        this._imageFigureEl = root.querySelector('.oh-figure');
        this._sequenceEl    = root.querySelector('.oh-sequence');
        this._lineEl        = root.querySelector('.oh-line');
        this._itemsEl       = root.querySelector('.oh-items');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        this._clearNodes();
        this._itemsEl.innerHTML = '';
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

    // ── Sequence nodes ────────────────────────────────────────

    // Renders nodes, returns array of { el, fixed } objects
    renderNodes(userResponse, initialItems) {
        this._clearNodes();
        const hasInitial = Array.isArray(initialItems) && initialItems.length > 0;

        return userResponse.map((val, index) => {
            const isFixed = hasInitial && initialItems[index] !== '';
            const value   = isFixed ? initialItems[index] : val;

            const node = document.createElement('div');
            node.className      = 'oh-node';
            node.dataset.index  = index;

            if (isFixed) {
                node.classList.add('oh-node-fixed');
                node.innerHTML = `<span class="oh-node-text">${value}</span>`;
            } else {
                node.innerHTML = value
                    ? `<span class="oh-node-text">${value}</span>`
                    : `<span class="oh-node-placeholder"></span>`;
            }

            this._sequenceEl.appendChild(node);
            return { el: node, fixed: isFixed };
        });
    }

    // ── Items bank ────────────────────────────────────────────

    // Renders items bank, returns item elements
    // excludes items already placed via initial_items
    renderItems(items, initialItems) {
        this._itemsEl.innerHTML = '';
        const hasInitial  = Array.isArray(initialItems) && initialItems.length > 0;
        const fixedValues = hasInitial ? initialItems.filter(v => v !== '') : [];

        return items
            .filter(item => !fixedValues.includes(item))
            .map(item => {
                const el         = document.createElement('div');
                el.className     = 'oh-item';
                el.dataset.value = item;
                el.innerHTML     = item;                       // ← innerHTML for rich content
                this._itemsEl.appendChild(el);
                return el;
            });
    }

    // ── Node value update (called after placement) ────────────

    updateNode(index, value) {
        const node = this._sequenceEl.querySelector(`.oh-node[data-index="${index}"]`);
        if (!node) return;
        node.innerHTML = value
            ? `<span class="oh-node-text">${value}</span>`
            : `<span class="oh-node-placeholder"></span>`;
    }

    // ── Line position ─────────────────────────────────────────

    adjustLine() {
        const nodes = this._sequenceEl.querySelectorAll('.oh-node');
        if (nodes.length < 2) return;

        const first        = nodes[0].getBoundingClientRect();
        const last         = nodes[nodes.length - 1].getBoundingClientRect();
        const containerRect = this._sequenceEl.getBoundingClientRect();

        const left  = first.left - containerRect.left + first.width / 2;
        const right = last.left  - containerRect.left + last.width  / 2;

        this._lineEl.style.left  = `${left}px`;
        this._lineEl.style.width = `${right - left}px`;
    }

    // ── Accessors ─────────────────────────────────────────────

    getSequenceEl() { return this._sequenceEl; }
    getItemsEl()    { return this._itemsEl; }

    // ── Private ───────────────────────────────────────────────

    _clearNodes() {
        // remove nodes but keep the line element
        Array.from(this._sequenceEl.querySelectorAll('.oh-node'))
            .forEach(n => n.remove());
    }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — click select + place, drag & drop
// ──────────────────────────────────────────────────────────────

class OrderingHorizontalInteractionHandler {

    constructor(nodeInfos, itemEls, onPlace) {
        this._nodeInfos    = nodeInfos;  // [{ el, fixed }]
        this._itemEls      = itemEls;
        this._onPlace      = onPlace;
        this._selectedItem = null;
    }

    bind() {
        this._bindItemEvents();
        this._bindNodeEvents();
    }

    // ── Item events ───────────────────────────────────────────

    _bindItemEvents() {
        this._itemEls.forEach(item => {
            item.addEventListener('click',     () => this._handleItemClick(item));
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.value);
            });
        });
    }

    _handleItemClick(item) {
        if (this._selectedItem === item) {
            this._deselectItem();
        } else {
            if (this._selectedItem) this._deselectItem();
            this._selectItem(item);
        }
    }

    _selectItem(item) {
        this._selectedItem = item;
        item.classList.add('oh-selected');
    }

    _deselectItem() {
        this._selectedItem?.classList.remove('oh-selected');
        this._selectedItem = null;
    }

    // ── Node events ───────────────────────────────────────────

    _bindNodeEvents() {
        this._nodeInfos.forEach(({ el, fixed }) => {
            if (fixed) return;   // skip fixed nodes — not interactive
            const index = parseInt(el.dataset.index);
            el.addEventListener('click',    ()  => this._handleNodeClick(index));
            el.addEventListener('dragover', (e) => e.preventDefault());
            el.addEventListener('drop',     (e) => this._handleNodeDrop(e, index));
        });
    }

    _handleNodeClick(index) {
        if (!this._selectedItem) return;
        const value = this._selectedItem.dataset.value;
        this._deselectItem();
        this._onPlace(index, value);
    }

    _handleNodeDrop(e, index) {
        e.preventDefault();
        const value = e.dataTransfer.getData('text/plain');
        if (value) this._onPlace(index, value);
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class OrderingHorizontalComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized   = false;
        this._renderer      = new OrderingHorizontalRenderer();
        this._userResponse  = [];
        this._resizeHandler = () => this._renderer.adjustLine();
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
        window.addEventListener('resize', this._resizeHandler);
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

        // initialise user response
        const size = config.correct_order?.length || config.items?.length || 0;
        this._userResponse = Array.isArray(config.user_response) && config.user_response.length === size
            ? [...config.user_response]
            : new Array(size).fill('');

        this._renderInteractive(config);
        requestAnimationFrame(() => this._renderer.adjustLine());
    }

    _renderInteractive(config) {
        const initialItems = config.initial_items || [];
        const nodeInfos    = this._renderer.renderNodes(this._userResponse, initialItems);
        const itemEls      = this._renderer.renderItems(config.items || [], initialItems);

        const handler = new OrderingHorizontalInteractionHandler(
            nodeInfos,
            itemEls,
            (index, value) => this._handlePlace(index, value, config)
        );
        handler.bind();
    }

    _handlePlace(index, value, config) {
        this._userResponse[index] = value;
        this._renderer.updateNode(index, value);
        requestAnimationFrame(() => this._renderer.adjustLine());
        this.emitAnswerChanged();
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('OrderingHorizontalComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.items) || config.items.length === 0) {
            console.warn('OrderingHorizontalComponent: missing or empty items in config');
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
        const header = e.target.closest('.oh-section-header');
        if (!header) return;
        const section = header.closest('.oh-section');
        if (section) section.classList.toggle('oh-collapsed');
    }

    emitAnswerChanged() {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: this.getUserAnswer() },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return [...this._userResponse];
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        window.removeEventListener('resize', this._resizeHandler);
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._userResponse  = [];
        this._toggleHandler = null;
        this._renderer      = new OrderingHorizontalRenderer();
    }
}

customElements.define('ordering-horizontal-drag-click', OrderingHorizontalComponent);