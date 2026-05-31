// ──────────────────────────────────────────────────────────────
// Geometry Helper — pure math, zero DOM, zero events
// ──────────────────────────────────────────────────────────────

class ImagePropertyMatchingGeometry {

    constructor(lineColors) {
        this._lineColors    = lineColors || ['#FF5733', '#33FF57', '#3357FF', '#F333FF'];
        this._colorIndex    = 0;
    }

    resetColorIndex() {
        this._colorIndex = 0;
    }

    getNextColor() {
        const color = this._lineColors[this._colorIndex];
        this._colorIndex = (this._colorIndex + 1) % this._lineColors.length;
        return color;
    }

    buildCurvePath(startX, startY, endX, endY) {
        const curve = Math.min(50, (endX - startX) * 0.3);
        return `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`;
    }

    getConnectionCoords(imageWrapper, propertyEl, svgRect) {
        const imageRect = imageWrapper.getBoundingClientRect();
        const propRect  = propertyEl.getBoundingClientRect();
        return {
            startX: imageRect.right  - svgRect.left,
            startY: imageRect.top    + imageRect.height / 2 - svgRect.top,
            endX:   propRect.left    - svgRect.left,
            endY:   propRect.top     + propRect.height / 2 - svgRect.top,
        };
    }
}


// ──────────────────────────────────────────────────────────────
// Renderer — owns all DOM creation and updates
// ──────────────────────────────────────────────────────────────

class ImagePropertyMatchingRenderer {

    createStructure(host) {
        if (host.querySelector('.ipm-wrapper')) return;
        host.innerHTML = `
            <div class="ipm-wrapper">

                <div class="ipm-section" data-section="svg" style="display: none;">
                    <div class="ipm-section-header">Figure</div>
                    <div class="ipm-section-body">
                        <div class="ipm-svg-figure"></div>
                    </div>
                </div>

                <div class="ipm-section" data-section="image" style="display: none;">
                    <div class="ipm-section-header">Figure</div>
                    <div class="ipm-section-body">
                        <div class="ipm-figure"></div>
                    </div>
                </div>

                <div class="ipm-question-text"></div>

                <div class="ipm-table-container">
                    <table class="ipm-table">
                        <thead>
                            <tr>
                                <th class="ipm-th-image"></th>
                                <th class="ipm-th-empty"></th>
                                <th class="ipm-th-property"></th>
                            </tr>
                        </thead>
                        <tbody class="ipm-tbody"></tbody>
                    </table>
                    <svg class="ipm-connections-layer" xmlns="http://www.w3.org/2000/svg"></svg>
                </div>

            </div>
        `;
    }

    cacheElements(host) {
        const root           = host.querySelector('.ipm-wrapper');
        this._svgSection     = root.querySelector('[data-section="svg"]');
        this._imageSection   = root.querySelector('[data-section="image"]');
        this._svgFigureEl    = root.querySelector('.ipm-svg-figure');
        this._imageFigureEl  = root.querySelector('.ipm-figure');
        this._questionEl     = root.querySelector('.ipm-question-text');
        this._thImage        = root.querySelector('.ipm-th-image');
        this._thEmpty        = root.querySelector('.ipm-th-empty');
        this._thProperty     = root.querySelector('.ipm-th-property');
        this._tbody          = root.querySelector('.ipm-tbody');
        this._svgCanvas      = root.querySelector('.ipm-connections-layer');
    }

    clear() {
        this.setQuestion('');
        this.setSvgFigure(null);
        this.setImageFigure(null);
        this._tbody.innerHTML = '';
        this.clearConnections();
    }

    // ── UI Rendering Helpers ──────────────────────────────────

    setQuestion(question = '') {
        this._questionEl.innerHTML = question;
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

    setImageFigure(imgUrl) {
        if (imgUrl) {
            this._imageSection.style.display = '';
            this._imageFigureEl.innerHTML = `<img src="${imgUrl}" alt="figure" />`;
        } else {
            this._imageSection.style.display = 'none';
            this._imageFigureEl.innerHTML = '';
        }
    }

    setHeadings(headings) {
        this._thImage.textContent    = headings.image    || 'Image';
        this._thEmpty.textContent    = headings.empty    || '';
        this._thProperty.textContent = headings.property || 'Properties';
    }

    // ── Table rows ────────────────────────────────────────────

    // Returns { imageWrappers: [], propertyEls: [] }
    renderRows(rows, propertiesColumn) {
        this._tbody.innerHTML = '';
        const imageWrappers = [];
        const propertyEls   = [];

        propertiesColumn.forEach((prop, index) => {
            const tr = document.createElement('tr');
            tr.className = 'ipm-row';

            // Image cell
            const tdImage = document.createElement('td');
            tdImage.className = 'ipm-image-cell';
            if (index < rows.length) {
                const row     = rows[index];
                const wrapper = document.createElement('div');
                wrapper.className = 'ipm-image-wrapper';
                wrapper.dataset.imageIndex = row.image_index;
                wrapper.innerHTML = row.svg_content
                    ? row.svg_content
                    : `<img src="${row.img_url}" alt="${row.alt_text || ''}" />`;
                tdImage.appendChild(wrapper);
                imageWrappers.push(wrapper);
            }

            // Empty cell
            const tdEmpty = document.createElement('td');
            tdEmpty.className = 'ipm-input-cell';

            // Property cell
            const tdProp = document.createElement('td');
            tdProp.className = 'ipm-input-cell';
            const propEl = document.createElement('div');
            propEl.className = 'ipm-property';
            propEl.dataset.property = prop;
            propEl.dataset.index    = index;               // ← index for matching
            propEl.innerHTML        = prop;                // ← innerHTML for rich content
            tdProp.appendChild(propEl);
            propertyEls.push(propEl);

            tr.appendChild(tdImage);
            tr.appendChild(tdEmpty);
            tr.appendChild(tdProp);
            this._tbody.appendChild(tr);
        });

        return { imageWrappers, propertyEls };
    }

    // ── Selection visual ──────────────────────────────────────

    selectImageWrapper(wrapper) {
        this.clearImageSelection();
        wrapper.classList.add('ipm-selected');
    }

    clearImageSelection() {
        this._tbody.querySelectorAll('.ipm-image-wrapper.ipm-selected')
            .forEach(el => el.classList.remove('ipm-selected'));
    }

    // ── SVG connection lines ──────────────────────────────────

    clearConnections() {
        this._svgCanvas.innerHTML = '';
    }

    drawCurve(pathData, color) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('class', 'ipm-connection-line');
        this._svgCanvas.appendChild(path);
    }

    // ── Accessors ─────────────────────────────────────────────

    getSvgCanvas()  { return this._svgCanvas; }
    getTbody()      { return this._tbody; }
}


// ──────────────────────────────────────────────────────────────
// Interaction Handler — image select + property connect
// ──────────────────────────────────────────────────────────────

class ImagePropertyMatchingInteractionHandler {

    constructor(imageWrappers, propertyEls, renderer, allowMultiple, onConnect) {
        this._imageWrappers  = imageWrappers;
        this._propertyEls    = propertyEls;
        this._renderer       = renderer;
        this._allowMultiple  = allowMultiple;
        this._onConnect      = onConnect;
        this._selectedImage  = null;
    }

    bind() {
        this._imageWrappers.forEach(wrapper => {
            wrapper.addEventListener('click', () => this._handleImageClick(wrapper));
        });
        this._propertyEls.forEach(propEl => {
            propEl.addEventListener('click', () => this._handlePropertyClick(propEl));
        });
    }

    // ── Image click ───────────────────────────────────────────

    _handleImageClick(wrapper) {
        const imageIndex = parseInt(wrapper.dataset.imageIndex);
        if (this._selectedImage === imageIndex) {
            this._selectedImage = null;
            this._renderer.clearImageSelection();
        } else {
            this._selectedImage = imageIndex;
            this._renderer.selectImageWrapper(wrapper);
        }
    }

    // ── Property click ────────────────────────────────────────

    _handlePropertyClick(propEl) {
        if (this._selectedImage === null) return;
        const propIndex = parseInt(propEl.dataset.index);   // ← index not value
        this._onConnect(this._selectedImage, propIndex, this._allowMultiple);
        this._selectedImage = null;
        this._renderer.clearImageSelection();
    }
}


// ──────────────────────────────────────────────────────────────
// Main Component — lifecycle, config, state, coordination
// ──────────────────────────────────────────────────────────────

class ImagePropertyMatchingComponent extends HTMLElement {

    constructor() {
        super();
        this._initialized  = false;
        this._geometry     = null;
        this._renderer     = new ImagePropertyMatchingRenderer();
        this._connections  = new Map();   // imageIndex → { property, color }
        this._resizeHandler = () => this._drawConnections();
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

        const lineColors  = config.validation?.line_colors ||
            ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#ffa500'];
        this._geometry    = new ImagePropertyMatchingGeometry(lineColors);
        this._connections = new Map();

        this._renderer.clear();
        this._renderer.setQuestion(config.question);
        this._renderer.setSvgFigure(config.svg_content);
        this._renderer.setImageFigure(config.img_url);
        this._renderer.setHeadings(config.column_headings || {});

        const { imageWrappers, propertyEls } = this._renderer.renderRows(
            config.rows || [],
            config.properties_column || []
        );

        const allowMultiple = config.validation?.allow_multiple_connections !== false;

        const handler = new ImagePropertyMatchingInteractionHandler(
            imageWrappers,
            propertyEls,
            this._renderer,
            allowMultiple,
            (imageIndex, property, allowMultiple) =>
                this._handleConnect(imageIndex, property, allowMultiple)
        );
        handler.bind();

        this._applyUserResponse(config.user_response || []);
    }

    // ── Connection logic ──────────────────────────────────────

    _handleConnect(imageIndex, propIndex, allowMultiple) {
        // remove existing connection from this image
        if (this._connections.has(imageIndex)) {
            this._connections.delete(imageIndex);
            this._geometry.resetColorIndex();
            // reassign colors
            const existing = new Map(this._connections);
            this._connections = new Map();
            existing.forEach((conn, idx) => {
                this._connections.set(idx, {
                    propIndex: conn.propIndex,
                    color: this._geometry.getNextColor(),
                });
            });
        }

        // if not allowing multiple, remove any existing connection to this propIndex
        if (!allowMultiple) {
            for (const [idx, conn] of this._connections) {
                if (conn.propIndex === propIndex) {
                    this._connections.delete(idx);
                    break;
                }
            }
        }

        this._connections.set(imageIndex, {
            propIndex,
            color: this._geometry.getNextColor(),
        });

        this._drawConnections();
        this.emitAnswerChanged();
    }

    _applyUserResponse(userResponse) {
        if (!Array.isArray(userResponse)) return;
        userResponse.forEach(conn => {
            if (conn.image_index !== undefined && conn.property !== undefined) {
                // find propIndex by matching dataset.property value
                const propEl = this.querySelector(`.ipm-property[data-property="${conn.property}"]`);
                if (propEl) {
                    this._connections.set(conn.image_index, {
                        propIndex: parseInt(propEl.dataset.index),
                        color: this._geometry.getNextColor(),
                    });
                }
            }
        });
        this._drawConnections();
    }

    // ── SVG drawing ───────────────────────────────────────────

    _drawConnections() {
        this._renderer.clearConnections();
        const svgRect = this._renderer.getSvgCanvas().getBoundingClientRect();

        this._connections.forEach((conn, imageIndex) => {
            const imageWrapper = this.querySelector(`.ipm-image-wrapper[data-image-index="${imageIndex}"]`);
            const propertyEl   = this.querySelector(`.ipm-property[data-index="${conn.propIndex}"]`); // ← index lookup
            if (!imageWrapper || !propertyEl) return;

            const coords   = this._geometry.getConnectionCoords(imageWrapper, propertyEl, svgRect);
            const pathData = this._geometry.buildCurvePath(
                coords.startX, coords.startY,
                coords.endX,   coords.endY
            );
            this._renderer.drawCurve(pathData, conn.color);
        });
    }

    // ── Small Utilities ───────────────────────────────────────

    parseConfigAttribute() {
        try {
            return JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('ImagePropertyMatchingComponent: invalid config JSON', e);
            return {};
        }
    }

    validateData(config) {
        if (!config || !Array.isArray(config.rows) || !Array.isArray(config.properties_column)) {
            console.warn('ImagePropertyMatchingComponent: missing rows or properties_column');
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
        const header = e.target.closest('.ipm-section-header');
        if (!header) return;
        const section = header.closest('.ipm-section');
        if (section) section.classList.toggle('ipm-collapsed');
    }

    emitAnswerChanged() {
        this.dispatchEvent(new CustomEvent('answer-changed', {
            detail: { answer: this.getUserAnswer() },
            bubbles: true,
        }));
    }

    // ── User State API ────────────────────────────────────────

    getUserAnswer() {
        return Array.from(this._connections.entries()).map(([imageIndex, conn]) => {
            // look up property value by index for evaluator compatibility
            const propEl = this.querySelector(`.ipm-property[data-index="${conn.propIndex}"]`);
            return {
                image_index: imageIndex,
                property:    propEl?.dataset.property || '',
            };
        });
    }

    // ── Internal Infrastructure ───────────────────────────────

    cleanup() {
        window.removeEventListener('resize', this._resizeHandler);
        this.removeEventListener('click', this._toggleHandler);
        this.innerHTML      = '';
        this._initialized   = false;
        this._connections   = new Map();
        this._geometry      = null;
        this._toggleHandler = null;
        this._renderer      = new ImagePropertyMatchingRenderer();
    }
}

customElements.define('matching-connection-image', ImagePropertyMatchingComponent);