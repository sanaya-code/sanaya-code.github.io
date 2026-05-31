// ──────────────────────────────────────────────────────────────
// Geometry Helper — pure math, zero DOM, zero events
// ──────────────────────────────────────────────────────────────

class NumberLineArcsGeometry {

    // Build points array from config
    buildPoints(config) {
        if (Array.isArray(config.points) && config.points.length > 0) {
            return [...config.points];
        }
        if (config.number_line) {
            const { start, end, step } = config.number_line;
            const pts = [];
            for (let i = start; i <= end; i += step) pts.push(i);
            return pts;
        }
        return [];
    }

    getPointX(index, totalPoints, logicalWidth, pointRadius) {
        if (totalPoints <= 1) return logicalWidth / 2;
        const usable = logicalWidth - 2 * pointRadius;
        return pointRadius + (usable * index) / (totalPoints - 1);
    }

    getPointY(logicalHeight) {
        return logicalHeight * 0.8;
    }

    buildArcPath(x1, y, x2) {
        const dx     = x2 - x1;
        const radius = Math.abs(dx);
        return `M ${x1} ${y} A ${radius} ${radius} 0 0 1 ${x2} ${y}`;
    }

    buildSelfLoopPath(x, y) {
        const r = 15;
        return `M ${x} ${y} m 0 -${r} a ${r} ${r} 0 1 1 0 ${2 * r} a ${r} ${r} 0 1 1 0 -${2 * r}`;
    }
}


// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class NumberLineArcsRenderer {

    constructor(geometry) {
        this._geometry     = geometry;
        this._svg          = null;
        this._arcsGroup    = null;
        this._logicalWidth = 600;
        this._logicalHeight = 200;
        this._pointRadius  = 10;
    }

    createStructure(host) {
        if (host.querySelector('.nla-wrapper')) return;
        host.innerHTML = `
            <div class="nla-wrapper">

                <div class="nla-section" data-section="svg-fig" style="display: none;">
                    <div class="nla-section-header">Figure</div>
                    <div class="nla-section-body">
                        <div class="nla-svg-figure"></div>
                    </div>
                </div>

                <div class="nla-section" data-section="image" style="display: none;">
                    <div class="nla-section-header">Figure</div>
                    <div class="nla-section-body">
                        <div class="nla-figure"></div>
                    </div>
                </div>

                <div class="nla-container">
                    <div class="nla-question" style="display: none;">
                        <div class="nla-question-text"></div>
                    </div>
                    <div class="nla-svg-container"></div>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root           = host.querySelector('.nla-wrapper');
        this._svgFigSection  = root.querySelector('[data-section="svg-fig"]');
        this._imageFigSection= root.querySelector('[data-section="image"]');
        this._svgFigureEl    = root.querySelector('.nla-svg-figure');
        this._imageFigureEl  = root.querySelector('.nla-figure');
        this._questionWrap   = root.querySelector('.nla-question');
        this._questionEl     = root.querySelector('.nla-question-text');
        this._svgContainer   = root.querySelector('.nla-svg-container');
    }

    clear() {
        this.setQuestion('');
        this.setSvgFigure(null);
        this.setImageFigure(null);
        this._svgContainer.innerHTML = '';
        this._svg = null;
        this._arcsGroup = null;
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        if (question) {
            this._questionEl.innerHTML = question;          // ← innerHTML for rich content
            this._questionWrap.style.display = '';
        } else {
            this._questionEl.innerHTML = '';
            this._questionWrap.style.display = 'none';
        }
    }

    setSvgFigure(svgContent) {
        if (svgContent) {
            this._svgFigSection.style.display = '';
            this._svgFigureEl.innerHTML = svgContent;
        } else {
            this._svgFigSection.style.display = 'none';
            this._svgFigureEl.innerHTML = '';
        }
    }

    setImageFigure(imgUrl) {
        if (imgUrl) {
            this._imageFigSection.style.display = '';
            this._imageFigureEl.innerHTML = `<img src="${imgUrl}" alt="figure" />`;
        } else {
            this._imageFigSection.style.display = 'none';
            this._imageFigureEl.innerHTML = '';
        }
    }

    // ── Number line SVG ───────────────────────────────────────

    setLogicalWidth(width) {
        this._logicalWidth = width || 600;
    }

    renderSvg() {
        this._svgContainer.innerHTML = '';
        this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this._svg.setAttribute('viewBox', `0 0 ${this._logicalWidth} ${this._logicalHeight}`);
        this._svg.setAttribute('width', '100%');
        this._svg.setAttribute('height', this._logicalHeight);
        this._svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        this._svg.setAttribute('role', 'img');
        this._svg.setAttribute('tabindex', '0');
        this._svg.setAttribute('aria-label', 'Number line question');
        this._svg.classList.add('nla-svg');
        this._svgContainer.appendChild(this._svg);
    }

    renderBaseLine(points) {
        const y  = this._geometry.getPointY(this._logicalHeight);
        const x1 = this._geometry.getPointX(0, points.length, this._logicalWidth, this._pointRadius);
        const x2 = this._geometry.getPointX(points.length - 1, points.length, this._logicalWidth, this._pointRadius);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', '#333');
        line.setAttribute('stroke-width', '2');
        this._svg.appendChild(line);
    }

    // Returns array of circle elements
    renderPoints(points) {
        const y       = this._geometry.getPointY(this._logicalHeight);
        const total   = points.length;
        const ptEls   = [];

        points.forEach((pt, i) => {
            const x = this._geometry.getPointX(i, total, this._logicalWidth, this._pointRadius);

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.classList.add('nla-point');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', this._pointRadius);
            circle.setAttribute('data-index', i);
            circle.setAttribute('tabindex', '0');
            circle.setAttribute('role', 'button');
            circle.setAttribute('aria-label', `Number point ${pt}`);
            this._svg.appendChild(circle);
            ptEls.push(circle);

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', y + 30);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '16px');
            text.setAttribute('fill', '#222');
            text.textContent = pt;
            this._svg.appendChild(text);
        });

        return ptEls;
    }

    // ── Arcs ──────────────────────────────────────────────────

    drawArcs(userResponse, points) {
        if (this._arcsGroup?.parentNode === this._svg) {
            this._svg.removeChild(this._arcsGroup);
        }
        this._arcsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this._arcsGroup.classList.add('nla-arcs-group');

        const total = points.length;
        const y     = this._geometry.getPointY(this._logicalHeight);

        userResponse.forEach(([p1, p2]) => {
            const x1 = this._geometry.getPointX(p1, total, this._logicalWidth, this._pointRadius);
            const x2 = this._geometry.getPointX(p2, total, this._logicalWidth, this._pointRadius);

            const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d      = (p1 === p2)
                ? this._geometry.buildSelfLoopPath(x1, y)
                : this._geometry.buildArcPath(x1, y, x2);

            pathEl.setAttribute('d', d);
            pathEl.setAttribute('stroke', 'blue');
            pathEl.setAttribute('stroke-width', '3');
            pathEl.setAttribute('fill', 'none');
            pathEl.setAttribute('pointer-events', 'none');
            this._arcsGroup.appendChild(pathEl);
        });

        this._svg.appendChild(this._arcsGroup);
    }

    // ── Point highlight ───────────────────────────────────────

    setPointActive(pointEls, index, active) {
        if (!pointEls[index]) return;
        pointEls[index].classList.toggle('nla-point-active', active);
    }

    // ── Accessors ─────────────────────────────────────────────

    getSvgContainer() { return this._svgContainer; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — point click and keyboard events
// ──────────────────────────────────────────────────────────────

class NumberLineArcsInteractionHandler {

    constructor(pointEls, renderer, onArcToggle) {
        this._pointEls   = pointEls;
        this._renderer   = renderer;
        this._onArcToggle = onArcToggle;
        this._activePoint = null;
    }

    bind() {
        this._pointEls.forEach(pt => {
            pt.addEventListener('click',   (e) => this._handlePointClick(e));
            pt.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    pt.click();
                }
            });
        });
    }

    _handlePointClick(e) {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);

        if (this._activePoint === null) {
            this._activePoint = idx;
            this._renderer.setPointActive(this._pointEls, idx, true);
        } else {
            const first  = this._activePoint;
            const second = idx;

            this._renderer.setPointActive(this._pointEls, first, false);
            this._activePoint = null;

            // normalise order
            const p1 = Math.min(first, second);
            const p2 = Math.max(first, second);
            this._onArcToggle(p1, p2);
        }
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class NumberLineArcsComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized    = false;
        this._geometry       = new NumberLineArcsGeometry();
        this._renderer       = new NumberLineArcsRenderer(this._geometry);
        this._userResponse   = [];
        this._points         = [];
        this._pointEls       = [];
        this._resizeObserver = null;
        this._logicalWidth   = 600;
        this._logicalHeight  = 200;
        this._pointRadius    = 10;
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
        this._bindResizeObserver();
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

        this._points       = this._geometry.buildPoints(config);
        this._userResponse = Array.isArray(config.user_response)
            ? config.user_response.map(p => [...p])
            : [];

        this._updateLogicalWidth();
        this._renderer.setLogicalWidth(this._logicalWidth);

        this._renderer.clear();
        this._renderer.setQuestion(config.question);
        this._renderer.setSvgFigure(config.svg_content);
        this._renderer.setImageFigure(config.img_url);
        this._renderer.renderSvg();
        this._renderer.renderBaseLine(this._points);
        this._pointEls = this._renderer.renderPoints(this._points);
        this._renderer.drawArcs(this._userResponse, this._points);

        const handler = new NumberLineArcsInteractionHandler(
            this._pointEls,
            this._renderer,
            (p1, p2) => this._handleArcToggle(p1, p2)
        );
        handler.bind();
    }

    // ── Arc toggle logic ──────────────────────────────────────

    _handleArcToggle(p1, p2) {
        const existing = this._userResponse.findIndex(
            pair => pair[0] === p1 && pair[1] === p2
        );
        if (existing !== -1) {
            this._userResponse.splice(existing, 1);
        } else {
            this._userResponse.push([p1, p2]);
        }
        this._renderer.drawArcs(this._userResponse, this._points);
        this.emitAnswerChanged();
    }

    // ── Resize handling ───────────────────────────────────────

    _bindResizeObserver() {
        this._resizeObserver = new ResizeObserver(() => {
            const prev = this._logicalWidth;
            this._updateLogicalWidth();
            if (this._logicalWidth !== prev) {
                this._renderer.setLogicalWidth(this._logicalWidth);
                const config = this.parseConfigAttribute();
                if (config) {
                    this._renderer.renderSvg();
                    this._renderer.renderBaseLine(this._points);
                    this._pointEls = this._renderer.renderPoints(this._points);
                    this._renderer.drawArcs(this._userResponse, this._points);
                    const handler = new NumberLineArcsInteractionHandler(
                        this._pointEls,
                        this._renderer,
                        (p1, p2) => this._handleArcToggle(p1, p2)
                    );
                    handler.bind();
                }
            }
        });
        this._resizeObserver.observe(this);
    }

    _updateLogicalWidth() {
        const w = this.offsetWidth;
        if (w) this._logicalWidth = Math.round(w);
    }

    // ── User Interaction / Events ─────────────────────────────

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.nla-section-header');
        if (!header) return;
        const section = header.closest('.nla-section');
        if (section) section.classList.toggle('nla-collapsed');
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
            console.warn('NumberLineArcsComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || (!config.points && !config.number_line)) {
            console.warn('NumberLineArcsComponent: missing points or number_line config');
            return false;
        }
        return true;
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return this._userResponse.map(p => [...p]);
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this._resizeObserver?.disconnect();
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML       = '';
        this._initialized    = false;
        this._userResponse   = [];
        this._points         = [];
        this._pointEls       = [];
        this._toggleHandler  = null;
        this._resizeObserver = null;
        this._renderer       = new NumberLineArcsRenderer(this._geometry);
    }
}

customElements.define('number-line-arcs', NumberLineArcsComponent);