// ──────────────────────────────────────────────────────────────
// Geometry Helper — pure math, zero DOM, zero events
// ──────────────────────────────────────────────────────────────

class ClockSetTimeGeometry {

    // Returns { x, y } for a clock number position
    getNumberPosition(num, radius, center) {
        const angle = ((num % 12) / 12) * 2 * Math.PI - Math.PI / 2;
        return {
            x: center.x + Math.cos(angle) * radius * 0.85,
            y: center.y + Math.sin(angle) * radius * 0.85,
        };
    }

    // Returns map of { value → {x, y} } for all numbers and midpoints
    buildClockPoints(numbers, radius, center) {
        const points = {};

        numbers.forEach(num => {
            points[num] = this.getNumberPosition(num, radius, center);
        });

        numbers.forEach((num, i) => {
            const next = i === numbers.length - 1 ? numbers[0] : numbers[i + 1];
            let midValue = num + 0.5;
            if (midValue > 12) midValue -= 12;
            points[midValue] = {
                x: (points[num].x + points[next].x) / 2,
                y: (points[num].y + points[next].y) / 2,
            };
        });

        return points;
    }

    // Returns { endX, endY } for a hand endpoint given lengthRatio
    getHandEndpoint(point, center, lengthRatio) {
        const dx       = point.x - center.x;
        const dy       = point.y - center.y;
        const fullLen  = Math.sqrt(dx * dx + dy * dy);
        const handLen  = fullLen * lengthRatio * 1.15;
        return {
            endX: center.x + (dx / fullLen) * handLen,
            endY: center.y + (dy / fullLen) * handLen,
        };
    }

    // Returns SVG path string for a 15° sector wedge
    getSectorPath(index, center, outerRadius) {
        const sectorAngle = (index * Math.PI / 12) - Math.PI / 2;
        const endAngle    = sectorAngle + Math.PI / 12;
        const sx = center.x + Math.cos(sectorAngle) * outerRadius;
        const sy = center.y + Math.sin(sectorAngle) * outerRadius;
        const ex = center.x + Math.cos(endAngle)    * outerRadius;
        const ey = center.y + Math.sin(endAngle)    * outerRadius;
        return `M ${center.x} ${center.y} L ${sx} ${sy} A ${outerRadius} ${outerRadius} 0 0 1 ${ex} ${ey} Z`;
    }

    // Converts sector index to clock value (0 → 12)
    sectorIndexToValue(index) {
        const val = (index % 24) / 2;
        return val === 0 ? 12 : val;
    }
}


// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class ClockSetTimeRenderer {

    constructor(geometry) {
        this._geometry  = geometry;
        this._svg       = null;
        this._center    = { x: 0, y: 0 };
        this._handLines = { hour: null, minute: null };
        this._handMarkers = {};
        this._clockPoints = {};
    }

    createStructure(host) {
        if (host.querySelector('.cst-wrapper')) return;
        host.innerHTML = `
            <div class="cst-wrapper">

                <div class="cst-section" data-section="svg-fig" style="display: none;">
                    <div class="cst-section-header">Figure</div>
                    <div class="cst-section-body">
                        <div class="cst-svg-figure"></div>
                    </div>
                </div>

                <div class="cst-question"></div>
                <div class="cst-buttons"></div>
                <div class="cst-clock-container"></div>

            </div>
        `;
    }

    cacheElements(host) {
        const root            = host.querySelector('.cst-wrapper');
        this._svgFigSection   = root.querySelector('[data-section="svg-fig"]');
        this._svgFigEl        = root.querySelector('.cst-svg-figure');
        this._questionEl      = root.querySelector('.cst-question');
        this._buttonsEl       = root.querySelector('.cst-buttons');
        this._clockContainer  = root.querySelector('.cst-clock-container');
    }

    clear() {
        this._questionEl.innerHTML   = '';
        this._buttonsEl.innerHTML    = '';
        this._clockContainer.innerHTML = '';
        this._handLines   = { hour: null, minute: null };
        this._handMarkers = {};
        this._svg         = null;
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.innerHTML = question;              // ← innerHTML for rich content
    }

    // ── Buttons ───────────────────────────────────────────────

    // Returns { hourBtn, minuteBtn }
    renderButtons() {
        this._buttonsEl.innerHTML = '';

        const hourBtn   = document.createElement('button');
        hourBtn.className = 'cst-btn';
        hourBtn.textContent = 'Hour Hand';

        const minuteBtn = document.createElement('button');
        minuteBtn.className = 'cst-btn';
        minuteBtn.textContent = 'Minute Hand';

        this._buttonsEl.appendChild(hourBtn);
        this._buttonsEl.appendChild(minuteBtn);
        return { hourBtn, minuteBtn };
    }

    setActiveButton(selectedHand) {
        this._buttonsEl.querySelectorAll('.cst-btn').forEach(btn => btn.classList.remove('cst-btn-active'));
        if (selectedHand === 'hour')   this._buttonsEl.querySelector('.cst-btn:first-child').classList.add('cst-btn-active');
        if (selectedHand === 'minute') this._buttonsEl.querySelector('.cst-btn:last-child').classList.add('cst-btn-active');
    }

    // ── Clock SVG ─────────────────────────────────────────────

    renderClock(clockConfig) {
        this._clockContainer.innerHTML = '';
        const radius = clockConfig.radius || 120;
        const size   = radius * 2 + 40;

        this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this._svg.setAttribute('width', '100%');
        this._svg.setAttribute('height', `${size}px`);
        this._svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        this._svg.classList.add('cst-svg');
        this._clockContainer.appendChild(this._svg);

        this._center = { x: size / 2, y: size / 2 };

        // Outer circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', this._center.x);
        circle.setAttribute('cy', this._center.y);
        circle.setAttribute('r', radius);
        circle.setAttribute('fill', '#fff');
        circle.setAttribute('stroke', '#000');
        this._svg.appendChild(circle);

        // Center dot
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', this._center.x);
        dot.setAttribute('cy', this._center.y);
        dot.setAttribute('r', 4);
        dot.setAttribute('fill', '#333');
        this._svg.appendChild(dot);

        this._clockPoints = this._geometry.buildClockPoints(
            clockConfig.numbers || [],
            radius,
            this._center
        );

        return { svg: this._svg, center: this._center, clockPoints: this._clockPoints };
    }

    // Renders number text elements, returns them for event binding
    renderNumbers(numbers) {
        const numEls = [];
        numbers.forEach(num => {
            const point = this._clockPoints[num];
            const text  = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', point.x);
            text.setAttribute('y', point.y + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '16');
            text.setAttribute('cursor', 'pointer');
            text.textContent = num;
            text.dataset.num  = num;
            this._svg.appendChild(text);
            numEls.push(text);
        });
        return numEls;
    }

    // Renders 24 invisible click sectors, returns them for event binding
    renderSectors(radius) {
        const outerRadius = radius * 0.9;
        const sectorEls   = [];
        for (let i = 0; i < 24; i++) {
            const sector = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            sector.setAttribute('d', this._geometry.getSectorPath(i, this._center, outerRadius));
            sector.setAttribute('fill', 'transparent');
            sector.setAttribute('stroke', 'none');
            sector.dataset.index = i;
            this._svg.appendChild(sector);
            sectorEls.push(sector);
        }
        return sectorEls;
    }

    // ── Hand drawing ──────────────────────────────────────────

    drawHand(handType, value, clockConfig) {
        const point = this._clockPoints[value];
        if (!point) return;

        const color       = clockConfig[handType + '_hand'].color;
        const strokeWidth = handType === 'hour' ? 4 : 2;
        const lengthRatio = clockConfig[handType + '_hand'].length_ratio;
        const { endX, endY } = this._geometry.getHandEndpoint(point, this._center, lengthRatio);

        // Remove old hand
        if (this._handLines[handType]?.parentNode === this._svg) {
            this._svg.removeChild(this._handLines[handType]);
        }

        this._ensureArrowMarker(handType, color);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', this._center.x);
        line.setAttribute('y1', this._center.y);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', strokeWidth);
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('marker-end', `url(#cst-arrow-${handType})`);
        this._svg.appendChild(line);
        this._handLines[handType] = line;
    }

    _ensureArrowMarker(handType, color) {
        if (this._handMarkers[handType]) return;

        let defs = this._svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            this._svg.insertBefore(defs, this._svg.firstChild);
        }

        const markerSize = handType === 'hour' ? 6 : 10;
        const marker     = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id',          `cst-arrow-${handType}`);
        marker.setAttribute('markerWidth',  markerSize);
        marker.setAttribute('markerHeight', markerSize);
        marker.setAttribute('refX',         markerSize * 0.9);
        marker.setAttribute('refY',         markerSize * 0.3);
        marker.setAttribute('orient',       'auto');
        marker.setAttribute('markerUnits',  'strokeWidth');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M 0,0 L ${markerSize},${markerSize * 0.3} L 0,${markerSize * 0.6} Z`);
        path.setAttribute('fill', color);
        marker.appendChild(path);
        defs.appendChild(marker);
        this._handMarkers[handType] = marker;
    }

    getClockPoints() { return this._clockPoints; }
    getSvg()         { return this._svg; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — button, number, sector clicks
// ──────────────────────────────────────────────────────────────

class ClockSetTimeInteractionHandler {

    constructor(hourBtn, minuteBtn, numberEls, sectorEls, geometry, onHandSet) {
        this._hourBtn      = hourBtn;
        this._minuteBtn    = minuteBtn;
        this._numberEls    = numberEls;
        this._sectorEls    = sectorEls;
        this._geometry     = geometry;
        this._onHandSet    = onHandSet;
        this._selectedHand = null;
    }

    bind() {
        this._hourBtn.addEventListener('click',   () => this._selectHand('hour'));
        this._minuteBtn.addEventListener('click',  () => this._selectHand('minute'));
        this._numberEls.forEach(el  => el.addEventListener('click',  (e) => this._handleNumberClick(e)));
        this._sectorEls.forEach(el  => el.addEventListener('click',  (e) => this._handleSectorClick(e)));
    }

    _selectHand(hand) {
        this._selectedHand = hand;
        this._onHandSet('select', hand);
    }

    _handleNumberClick(e) {
        e.stopPropagation();
        if (!this._selectedHand) return;
        const num = parseFloat(e.target.dataset.num);
        if (!num) return;
        this._onHandSet(this._selectedHand, num);
    }

    _handleSectorClick(e) {
        e.stopPropagation();
        if (!this._selectedHand) return;
        const index = parseInt(e.target.dataset.index);
        const value = this._geometry.sectorIndexToValue(index);
        this._onHandSet(this._selectedHand, value);
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class ClockSetTimeComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized  = false;
        this._geometry     = new ClockSetTimeGeometry();
        this._renderer     = new ClockSetTimeRenderer(this._geometry);
        this._userResponse = { hour: null, minute: null };
        this._clockConfig  = null;
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

        this._clockConfig  = config.clock;
        this._userResponse = config.user_response
            ? { ...config.user_response }
            : { hour: null, minute: null };

        const { hourBtn, minuteBtn } = this._renderer.renderButtons();
        const { clockPoints }        = this._renderer.renderClock(config.clock);
        const numberEls              = this._renderer.renderNumbers(config.clock.numbers || []);
        const sectorEls              = this._renderer.renderSectors(config.clock.radius || 120);

        const handler = new ClockSetTimeInteractionHandler(
            hourBtn,
            minuteBtn,
            numberEls,
            sectorEls,
            this._geometry,
            (type, value) => this._handleHandSet(type, value)
        );
        handler.bind();

        // Restore saved hands
        if (this._userResponse.hour   !== null) this._renderer.drawHand('hour',   this._userResponse.hour,   this._clockConfig);
        if (this._userResponse.minute !== null) this._renderer.drawHand('minute', this._userResponse.minute, this._clockConfig);
    }

    // ── State ─────────────────────────────────────────────────

    _handleHandSet(type, value) {
        if (type === 'select') {
            this._renderer.setActiveButton(value);
            return;
        }
        this._userResponse[type] = value;
        this._renderer.drawHand(type, value, this._clockConfig);
        this.emitAnswerChanged();
    }

    // ── User Interaction / Events ─────────────────────────────

    bindToggleEvent() {
        this._toggleHandler = (e) => this._handleSectionToggle(e);
        this.addEventListener('click', this._toggleHandler);
    }

    _handleSectionToggle(e) {
        const header = e.target.closest('.cst-section-header');
        if (!header) return;
        const section = header.closest('.cst-section');
        if (section) section.classList.toggle('cst-collapsed');
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
            console.warn('ClockSetTimeComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !config.clock) {
            console.warn('ClockSetTimeComponent: missing clock config');
            return false;
        }
        return true;
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return { ...this._userResponse };
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._toggleHandler = null;
        this._userResponse  = { hour: null, minute: null };
        this._renderer      = new ClockSetTimeRenderer(this._geometry);
    }
}

customElements.define('clock-set-time', ClockSetTimeComponent);