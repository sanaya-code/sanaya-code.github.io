// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class OrderingRenderer {

    createStructure(host) {
        if (host.querySelector('.ord-question')) return;
        host.innerHTML = `
            <div class="ord-question">

                <div class="ord-question-text"></div>

                <div class="ord-section" data-section="svg" style="display: none;">
                    <div class="ord-section-header">Figure</div>
                    <div class="ord-section-body">
                        <div class="ord-svg-figure"></div>
                    </div>
                </div>

                <div class="ord-section" data-section="image" style="display: none;">
                    <div class="ord-section-header">Figure</div>
                    <div class="ord-section-body">
                        <div class="ord-image"></div>
                    </div>
                </div>

                <div class="ord-container"></div>

            </div>
        `;
    }

    cacheElements(host) {
        const root          = host.querySelector('.ord-question');
        this._svgSection    = root.querySelector('[data-section="svg"]');
        this._imageSection  = root.querySelector('[data-section="image"]');
        this._questionEl    = root.querySelector('.ord-question-text');
        this._svgFigureEl   = root.querySelector('.ord-svg-figure');
        this._imageFigureEl = root.querySelector('.ord-image');
        this._containerEl   = root.querySelector('.ord-container');
    }

    clear() {
        this.setQuestion('');
        this.setSvg(null);
        this.setImage(null);
        this._containerEl.innerHTML = '';
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.textContent = question;
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

    // ── Ordering Specific ─────────────────────────────────────

    // Renders items and returns the item elements
    renderItems(items) {
        this._containerEl.innerHTML = '';
        return items.map(item => {
            const el = this.createItemElement(item.id, item.text);
            this._containerEl.appendChild(el);
            return el;
        });
    }

    createItemElement(itemId, itemText) {
        const div       = document.createElement('div');
        div.className   = 'ord-item';
        div.draggable   = true;
        div.dataset.id  = itemId;
        div.textContent = itemText;
        return div;
    }

    // Reorders DOM children to match orderedIds array
    reorderItems(orderedIds) {
        const idToEl = {};
        Array.from(this._containerEl.children).forEach(el => {
            idToEl[el.dataset.id] = el;
        });
        this._containerEl.innerHTML = '';
        orderedIds.forEach(id => {
            if (idToEl[id]) this._containerEl.appendChild(idToEl[id]);
        });
    }

    // ── Accessors ─────────────────────────────────────────────

    getContainerEl() { return this._containerEl; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — drag to reorder
// ──────────────────────────────────────────────────────────────

class OrderingInteractionHandler {

    constructor(itemEls, containerEl, onChange) {
        this._itemEls           = itemEls;
        this._containerEl       = containerEl;
        this._onChange          = onChange;
        this._currentDraggedItem = null;
    }

    bind() {
        this._itemEls.forEach(item => this._bindItemEvents(item));
    }

    _bindItemEvents(item) {
        item.addEventListener('dragstart', (e) => this._handleDragStart(e));
        item.addEventListener('dragover',  (e) => this._handleDragOver(e));
        item.addEventListener('drop',      (e) => this._handleDrop(e));
        item.addEventListener('dragend',   (e) => this._handleDragEnd(e));
    }

    _handleDragStart(e) {
        this._currentDraggedItem = e.target;
        e.dataTransfer.effectAllowed = 'move';
        e.target.classList.add('ord-dragging');
    }

    _handleDragOver(e) {
        e.preventDefault();
        const target = e.target.closest('.ord-item');
        if (!target || target === this._currentDraggedItem) return;

        const bounding    = target.getBoundingClientRect();
        const insertBefore = (e.clientY - bounding.top) < bounding.height / 2;

        if (insertBefore) {
            this._containerEl.insertBefore(this._currentDraggedItem, target);
        } else {
            this._containerEl.insertBefore(this._currentDraggedItem, target.nextSibling);
        }
    }

    _handleDrop(e) {
        e.preventDefault();
    }

    _handleDragEnd(e) {
        e.target.classList.remove('ord-dragging');
        this._currentDraggedItem = null;
        this._onChange();
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class OrderingComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized = false;
        this._renderer    = new OrderingRenderer();
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

        const itemEls = this._renderer.renderItems(config.items);

        // apply saved user response order
        if (Array.isArray(config.user_response) && config.user_response.length > 0) {
            this._renderer.reorderItems(config.user_response);
        }

        const handler = new OrderingInteractionHandler(
            itemEls,
            this._renderer.getContainerEl(),
            () => this.emitAnswerChanged()
        );
        handler.bind();
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('OrderingComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.items) || config.items.length === 0) {
            console.warn('OrderingComponent: missing or empty items in config');
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
        const header = e.target.closest('.ord-section-header');
        if (!header) return;
        const section = header.closest('.ord-section');
        if (section) section.classList.toggle('ord-collapsed');
    }

    emitAnswerChanged() {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: this.getUserAnswer() },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return Array.from(this._renderer.getContainerEl().children)
            .map(item => item.dataset.id);
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._toggleHandler = null;
        this._renderer      = new OrderingRenderer();
    }
}

customElements.define('ordering-drag-drop', OrderingComponent);