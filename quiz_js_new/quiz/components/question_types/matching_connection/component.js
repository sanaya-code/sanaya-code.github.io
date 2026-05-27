// ──────────────────────────────────────────────────────────────
// Geometry Helper — pure math, zero DOM, zero events
// ──────────────────────────────────────────────────────────────

class MatchingConnectionGeometry {

    getLineCoords(lhsEl, rhsEl, svgRect) {
        const lhs = lhsEl.getBoundingClientRect();
        const rhs = rhsEl.getBoundingClientRect();
        return {
            x1: lhs.right  - svgRect.left,
            y1: lhs.top    + lhs.height / 2 - svgRect.top,
            x2: rhs.left   - svgRect.left,
            y2: rhs.top    + rhs.height / 2 - svgRect.top,
        };
    }

    generateColorPalette(n) {
        const base  = ['#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4'];
        const extra = Array.from({ length: Math.max(0, n - base.length) }, () => {
            const hue = Math.floor(Math.random() * 360);
            return `hsl(${hue}, 70%, 50%)`;
        });
        return [...base, ...extra].slice(0, n);
    }

    shuffleArray(array) {
        return array
            .map(val => ({ val, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(o => o.val);
    }
}


// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class MatchingConnectionRenderer {

    constructor(geometry) {
        this._geometry = geometry;
    }

    createStructure(host) {
        if (host.querySelector('.mconn-question')) return;
        host.innerHTML = `
            <div class="mconn-question">

                <div class="mconn-question-text"></div>

                <div class="mconn-section" data-section="svg" style="display: none;">
                    <div class="mconn-section-header">Figure</div>
                    <div class="mconn-section-body">
                        <div class="mconn-svg-figure"></div>
                    </div>
                </div>

                <div class="mconn-section" data-section="image" style="display: none;">
                    <div class="mconn-section-header">Figure</div>
                    <div class="mconn-section-body">
                        <div class="mconn-image"></div>
                    </div>
                </div>

                <div class="mconn-container">
                    <svg class="mconn-svg-canvas"></svg>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root           = host.querySelector('.mconn-question');
        this._svgSection     = root.querySelector('[data-section="svg"]');
        this._imageSection   = root.querySelector('[data-section="image"]');
        this._questionEl     = root.querySelector('.mconn-question-text');
        this._svgFigureEl    = root.querySelector('.mconn-svg-figure');
        this._imageEl        = root.querySelector('.mconn-image');
        this._containerEl    = root.querySelector('.mconn-container');
        this._svgCanvas      = root.querySelector('.mconn-svg-canvas');
    }

    clear() {
        this.setQuestion('');
        this.setSvgFigure(null);
        this.setImage(null);
        // remove all rows but keep the svg canvas
        Array.from(this._containerEl.querySelectorAll('.mconn-row'))
            .forEach(row => row.remove());
        this.clearSvgCanvas();
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.textContent = question;
    }

    setSvgFigure(svgContent) {
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

    // ── Connect rows ──────────────────────────────────────────

    renderRows(pairs, shuffledRhs) {
        // Remove existing rows
        Array.from(this._containerEl.querySelectorAll('.mconn-row'))
            .forEach(row => row.remove());

        const lhsEls = [];
        const rhsEls = [];

        pairs.forEach((pair, idx) => {
            const row = document.createElement('div');
            row.className = 'mconn-row';
            row.dataset.index = idx;

            const lhs = document.createElement('div');
            lhs.className   = 'mconn-item mconn-lhs';
            lhs.textContent = pair.left;
            lhs.dataset.index = idx;
            lhs.tabIndex = 0;

            const rhs = document.createElement('div');
            rhs.className   = 'mconn-item mconn-rhs';
            rhs.textContent = shuffledRhs[idx];
            rhs.dataset.value = shuffledRhs[idx];
            rhs.tabIndex = 0;

            row.appendChild(lhs);
            row.appendChild(rhs);
            // insert before svg canvas
            this._containerEl.insertBefore(row, this._svgCanvas);

            lhsEls.push(lhs);
            rhsEls.push(rhs);
        });

        return { lhsEls, rhsEls };
    }

    // ── SVG line drawing ──────────────────────────────────────

    clearSvgCanvas() {
        while (this._svgCanvas.firstChild) {
            this._svgCanvas.removeChild(this._svgCanvas.firstChild);
        }
    }

    drawLine(coords, color) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', coords.x1);
        line.setAttribute('y1', coords.y1);
        line.setAttribute('x2', coords.x2);
        line.setAttribute('y2', coords.y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', 2);
        this._svgCanvas.appendChild(line);
    }

    getSvgCanvas() {
        return this._svgCanvas;
    }

    getContainer() {
        return this._containerEl;
    }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — click and keyboard events
// ──────────────────────────────────────────────────────────────

class MatchingConnectionInteractionHandler {

    constructor(lhsEls, rhsEls, onConnect) {
        this._lhsEls           = lhsEls;
        this._rhsEls           = rhsEls;
        this._onConnect        = onConnect;
        this._selectedLHSIndex = null;
        this._focusSide        = 'lhs';
        this._focusIndex       = 0;
        this._keyHandler       = (e) => this._handleKeyDown(e);
    }

    bind() {
        this._bindClickEvents();
        this._bindKeyboardEvents();
        if (this._lhsEls.length > 0) this._lhsEls[0].focus();
    }

    unbind() {
        document.removeEventListener('keydown', this._keyHandler);
    }

    // ── Click events ──────────────────────────────────────────

    _bindClickEvents() {
        this._lhsEls.forEach((lhs, idx) => {
            lhs.addEventListener('click', () => this._handleLhsClick(idx));
        });
        this._rhsEls.forEach(rhs => {
            rhs.addEventListener('click', () => this._handleRhsClick(rhs));
        });
    }

    _handleLhsClick(index) {
        this._selectedLHSIndex = (this._selectedLHSIndex === index) ? null : index;
        this._focusSide  = 'lhs';
        this._focusIndex = index;
        this._updateSelection();
        this._updateFocus();
    }

    _handleRhsClick(rhs) {
        if (this._selectedLHSIndex === null) return;
        this._onConnect(this._selectedLHSIndex, rhs);
        this._selectedLHSIndex = null;
        this._updateSelection();
    }

    // ── Keyboard events ───────────────────────────────────────

    _bindKeyboardEvents() {
        document.addEventListener('keydown', this._keyHandler);
    }

    _handleKeyDown(e) {
        if (!this._lhsEls.length || !this._rhsEls.length) return;
        if (e.key === 'a') {
            this._handleNavigation();
        } else if (e.key === ' ') {
            this._handleSpaceSelection();
        } else {
            return;
        }
        e.preventDefault();
        this._updateFocus();
        this._updateModeIndicator();
    }

    _handleNavigation() {
        if (this._selectedLHSIndex === null) {
            this._focusSide  = 'lhs';
            this._focusIndex = (this._focusIndex + 1) % this._lhsEls.length;
        } else {
            this._focusSide  = 'rhs';
            this._focusIndex = (this._focusIndex + 1) % this._rhsEls.length;
        }
    }

    _handleSpaceSelection() {
        if (this._focusSide === 'lhs') {
            const newIndex = this._focusIndex;
            this._selectedLHSIndex = (this._selectedLHSIndex === newIndex) ? null : newIndex;
            this._updateSelection();
            if (this._selectedLHSIndex !== null) {
                this._focusSide  = 'rhs';
                this._focusIndex = 0;
            }
        } else if (this._focusSide === 'rhs' && this._selectedLHSIndex !== null) {
            this._onConnect(this._selectedLHSIndex, this._rhsEls[this._focusIndex]);
            this._selectedLHSIndex = null;
            this._focusSide        = 'lhs';
            this._focusIndex       = 0;
            this._updateSelection();
        }
    }

    // ── Visual state updates ──────────────────────────────────

    _updateSelection() {
        this._lhsEls.forEach((el, i) => {
            el.classList.toggle('mconn-selected', i === this._selectedLHSIndex);
        });
    }

    _updateFocus() {
        this._lhsEls.forEach((el, i) => {
            const focused = this._focusSide === 'lhs' && i === this._focusIndex;
            el.classList.toggle('mconn-focused', focused);
            if (focused) el.focus();
        });
        this._rhsEls.forEach((el, i) => {
            const focused = this._focusSide === 'rhs' && i === this._focusIndex;
            el.classList.toggle('mconn-focused', focused);
            if (focused) el.focus();
        });
    }

    _updateModeIndicator() {
        const container = this._lhsEls[0]?.closest('.mconn-container');
        if (container) container.setAttribute('data-mode', this._focusSide);
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class MatchingConnectionComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized  = false;
        this._geometry     = new MatchingConnectionGeometry();
        this._renderer     = new MatchingConnectionRenderer(this._geometry);
        this._handler      = null;
        this._matches      = [];
        this._lhsEls       = [];
        this._rhsEls       = [];
        this._lineColors   = [];
        this._resizeHandler = () => this._drawLines();
    }

    static get observedAttributes() {
        return ['config'];
    }

    connectedCallback() {
        if (this._initialized) return;
        this.setAttribute('tabindex', '0');
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

        // unbind old handler before re-rendering
        this._handler?.unbind();

        this._renderer.clear();
        this._renderer.setQuestion(config.question);
        this._renderer.setSvgFigure(config.svg_content);
        this._renderer.setImage(config.img_url);

        this._lineColors = this._geometry.generateColorPalette(config.pairs.length);
        this._matches    = Array(config.pairs.length).fill(null);

        const shuffledRhs        = this._geometry.shuffleArray(config.pairs.map(p => p.right));
        const { lhsEls, rhsEls } = this._renderer.renderRows(config.pairs, shuffledRhs);
        this._lhsEls = lhsEls;
        this._rhsEls = rhsEls;

        this._handler = new MatchingConnectionInteractionHandler(
            lhsEls,
            rhsEls,
            (lhsIndex, rhsEl) => this._makeConnection(lhsIndex, rhsEl)
        );
        this._handler.bind();

        this._applyUserResponse(config.user_response);
    }

    // ── Connection logic ──────────────────────────────────────

    _makeConnection(lhsIndex, rhsEl) {
        const rhsValue = rhsEl.textContent;
        // clear any existing connection to this rhs value
        this._matches = this._matches.map(val => val === rhsValue ? null : val);
        this._matches[lhsIndex] = rhsValue;
        this._drawLines();
        this.emitAnswerChanged();
    }

    _applyUserResponse(userResponse) {
        const responses = Array.isArray(userResponse)
            ? userResponse
            : Array(this._lhsEls.length).fill(null);

        responses.forEach((rhsVal, lhsIndex) => {
            if (!rhsVal) return;
            const rhsEl = this._rhsEls.find(r => r.textContent === rhsVal);
            if (rhsEl) this._makeConnection(lhsIndex, rhsEl);
        });
    }

    // ── SVG line drawing ──────────────────────────────────────

    _drawLines() {
        this._renderer.clearSvgCanvas();
        const svgRect = this._renderer.getSvgCanvas().getBoundingClientRect();
        this._matches.forEach((rhsVal, lhsIndex) => {
            if (!rhsVal) return;
            const lhsEl = this._lhsEls[lhsIndex];
            const rhsEl = this._rhsEls.find(r => r.textContent === rhsVal);
            if (!lhsEl || !rhsEl) return;
            const coords = this._geometry.getLineCoords(lhsEl, rhsEl, svgRect);
            this._renderer.drawLine(coords, this._lineColors[lhsIndex]);
        });
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('MatchingConnectionComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.pairs) || config.pairs.length === 0) {
            console.warn('MatchingConnectionComponent: missing or empty pairs in config');
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
        const header = e.target.closest('.mconn-section-header');
        if (!header) return;
        const section = header.closest('.mconn-section');
        if (section) section.classList.toggle('mconn-collapsed');
    }

    emitAnswerChanged() {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: this.getUserAnswer() },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return [...this._matches];
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this._handler?.unbind();
        window.removeEventListener('resize', this._resizeHandler);
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML     = '';
        this._initialized  = false;
        this._handler      = null;
        this._matches      = [];
        this._lhsEls       = [];
        this._rhsEls       = [];
        this._lineColors   = [];
        this._renderer     = new MatchingConnectionRenderer(this._geometry);
    }
}

customElements.define('matching-connection', MatchingConnectionComponent);