class MatchingConnectComponent extends HTMLElement {
    constructor() {
        super();

        // DOM and state
        this.lhsElements = [];
        this.rhsElements = [];
        this.matches = [];
        this.lineColors = [];
        this.svg = null;

        // Interaction state
        this.focusSide = 'lhs';
        this.focusIndex = 0;
        this.selectedLHSIndex = null;
        this._boundKeyDownHandler = this.handleKeyDown.bind(this);
    }

    static get observedAttributes() {
        return ["config"];
    }

    connectedCallback() {
        this.setAttribute('tabindex', '0');
        this.updateFromConfig();
        window.addEventListener("resize", this.handleResize.bind(this));
        document.addEventListener("keydown", this._boundKeyDownHandler);
    }

    disconnectedCallback() {
        window.removeEventListener("resize", this.handleResize.bind(this));
        document.removeEventListener("keydown", this._boundKeyDownHandler);
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === "config" && oldVal !== newVal) {
            this.updateFromConfig();
        }
    }

    get config() {
        try {
            return JSON.parse(this.getAttribute("config"));
        } catch {
            return null;
        }
    }

    // ------------------- Initialization -------------------
    updateFromConfig() {
        const config = this.config;
        if (!config || !Array.isArray(config.pairs)) return;

        this.renderLayout(config);
        this.initElements(config);
        this.setupEventListeners();
        this.applyInitialUserResponse(config);
        this.drawLines();
    }

    renderLayout(config) {
        this.innerHTML = `
            <div class="question-text">${config.question || ""}</div>
            ${this.renderMedia(config)}
            <div class="options-container">
                <div class="connect-container" data-mode="lhs">
                    ${this.renderConnectRows(config)}
                    <svg class="connect-svg"></svg>
                </div>
            </div>
        `;
    }

    renderMedia(config) {
        return [
            config.svg_content ? `<div class="svg-figure">${config.svg_content}</div>` : "",
            config.img_url ? `<div class="figure"><img src="${config.img_url}" alt="figure" /></div>` : ""
        ].join("");
    }

    renderConnectRows(config) {
        return config.pairs.map((pair, index) => `
            <div class="connect-row" data-index="${index}">
                <div class="connect-item connect-lhs" data-index="${index}" tabindex="0">${pair.left}</div>
                <div class="connect-item connect-rhs" data-value="" tabindex="0">${pair.right}</div>
            </div>
        `).join("");
    }

    initElements(config) {
        const container = this.querySelector(".connect-container");
        this.svg = container.querySelector("svg");
        this.lineColors = this.generateColorPalette(config.pairs.length);

        this.lhsElements = Array.from(container.querySelectorAll(".connect-lhs"));
        this.rhsElements = this.initRhsElements(container, config);
        this.matches = Array(config.pairs.length).fill(null);

        // Initial focus
        if (this.lhsElements.length > 0) {
            this.lhsElements[0].focus();
        }
    }

    initRhsElements(container, config) {
        const shuffled = this.shuffleArray(config.pairs.map(p => p.right));
        const rhsElements = Array.from(container.querySelectorAll(".connect-rhs"));
        rhsElements.forEach((el, idx) => {
            el.textContent = shuffled[idx];
            el.setAttribute("data-value", shuffled[idx]);
        });
        return rhsElements;
    }

    setupEventListeners() {
        this.lhsElements.forEach(lhs => {
            lhs.addEventListener("click", () => {
                const index = parseInt(lhs.getAttribute("data-index"));
                this.selectedLHSIndex = this.selectedLHSIndex === index ? null : index;
                this.focusSide = 'lhs';
                this.focusIndex = index;
                this.updateSelection();
                this.updateFocus();
            });
        });

        this.rhsElements.forEach(rhs => {
            rhs.addEventListener("click", () => {
                if (this.selectedLHSIndex !== null) {
                    this.makeConnection(this.selectedLHSIndex, rhs);
                    this.selectedLHSIndex = null;
                    this.updateSelection();
                }
            });
        });
    }

    applyInitialUserResponse(config) {
        const userResponse = Array.isArray(config.user_response)
            ? config.user_response
            : Array(config.pairs.length).fill(null);

        userResponse.forEach((rhsVal, lhsIndex) => {
            if (rhsVal) {
                const rhsEl = this.rhsElements.find(r => r.textContent === rhsVal);
                if (rhsEl) this.makeConnection(lhsIndex, rhsEl);
            }
        });
    }

    // ------------------- Interaction -------------------
    handleKeyDown(e) {
        if (!this.lhsElements.length || !this.rhsElements.length) return;

        if (e.key === 'a') {
            this.handleNavigation();
        } else if (e.key === ' ') {
            this.handleSelection();
        } else {
            return;
        }

        e.preventDefault();
        this.updateFocus();
        this.updateModeIndicator();
    }

    handleNavigation() {
        if (this.selectedLHSIndex === null) {
            this.focusSide = 'lhs';
            this.focusIndex = (this.focusIndex + 1) % this.lhsElements.length;
        } else {
            this.focusSide = 'rhs';
            this.focusIndex = (this.focusIndex + 1) % this.rhsElements.length;
        }
    }

    handleSelection() {
        if (this.focusSide === 'lhs') {
            const newIndex = this.focusIndex;
            this.selectedLHSIndex = this.selectedLHSIndex === newIndex ? null : newIndex;
            this.updateSelection();
            if (this.selectedLHSIndex !== null) {
                this.focusSide = 'rhs';
                this.focusIndex = 0;
            }
        } else if (this.focusSide === 'rhs' && this.selectedLHSIndex !== null) {
            this.makeConnection(this.selectedLHSIndex, this.rhsElements[this.focusIndex]);
            this.selectedLHSIndex = null;
            this.focusSide = 'lhs';
            this.focusIndex = 0;
            this.updateSelection();
        }
    }

    updateFocus() {
        this.lhsElements.forEach((el, i) => {
            el.classList.toggle('focused', this.focusSide === 'lhs' && i === this.focusIndex);
            if (this.focusSide === 'lhs' && i === this.focusIndex) el.focus();
        });

        this.rhsElements.forEach((el, i) => {
            el.classList.toggle('focused', this.focusSide === 'rhs' && i === this.focusIndex);
            if (this.focusSide === 'rhs' && i === this.focusIndex) el.focus();
        });
    }

    updateSelection() {
        this.lhsElements.forEach((el, i) => {
            el.classList.toggle('selected', i === this.selectedLHSIndex);
        });
    }

    updateModeIndicator() {
        const container = this.querySelector(".connect-container");
        if (container) {
            container.setAttribute("data-mode", this.focusSide);
        }
    }

    // ------------------- Connection Logic -------------------
    makeConnection(lhsIndex, rhsElement) {
        const rhsValue = rhsElement.textContent;
        this.matches = this.matches.map(val => val === rhsValue ? null : val);
        this.matches[lhsIndex] = rhsValue;
        this.drawLines();
    }

    getUserAnswer() {
        return this.matches;
    }

    // ------------------- Drawing Lines -------------------
    drawLines() {
        if (!this.svg) return;
        this.clearSvg();

        const svgRect = this.svg.getBoundingClientRect();
        this.matches.forEach((rhsVal, lhsIndex) => {
            if (!rhsVal) return;
            const lhsEl = this.lhsElements[lhsIndex];
            const rhsEl = this.rhsElements.find(r => r.textContent === rhsVal);
            if (lhsEl && rhsEl) {
                const coords = this.getLineCoords(lhsEl, rhsEl, svgRect);
                this.drawLine(coords, this.lineColors[lhsIndex]);
            }
        });
    }

    clearSvg() {
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
    }

    getLineCoords(lhsEl, rhsEl, svgRect) {
        const lhs = lhsEl.getBoundingClientRect();
        const rhs = rhsEl.getBoundingClientRect();
        return {
            x1: lhs.right - svgRect.left,
            y1: lhs.top + lhs.height / 2 - svgRect.top,
            x2: rhs.left - svgRect.left,
            y2: rhs.top + rhs.height / 2 - svgRect.top
        };
    }

    drawLine({ x1, y1, x2, y2 }, color) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", 2);
        this.svg.appendChild(line);
    }

    // ------------------- Utilities -------------------
    shuffleArray(array) {
        return array
            .map(val => ({ val, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(o => o.val);
    }

    generateColorPalette(n) {
        const base = ["#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4"];
        const extra = Array.from({ length: Math.max(0, n - base.length) }, () => {
            const hue = Math.floor(Math.random() * 360);
            return `hsl(${hue}, 70%, 50%)`;
        });
        return [...base, ...extra].slice(0, n);
    }

    handleResize() {
        this.drawLines();
    }
}

customElements.define("matching-connection", MatchingConnectComponent);

/**
 * MATCHING CONNECTION COMPONENT (<matching-connection>)
 * 
 * A matching game where users connect left-side items to right-side matches.
 * 
 * KEYBOARD CONTROLS:
 * - Press 'A' key to navigate between items:
 *   1. First press moves through left column items
 *   2. When left item is selected (with Space), 'A' moves through right column
 *   3. Press Space on right item to complete connection
 * - Colored lines automatically appear for matched pairs
 * 
 * CONFIGURATION:
 * Set up the game using the 'config' attribute with JSON format:
 * 
 * REQUIRED JSON STRUCTURE:
 * {
 *   "question": "Match items",      // Displayed question text
 *   "pairs": [                     // Items to match
 *     {"left": "TextA", "right": "Text1"},
 *     {"left": "TextB", "right": "Text2"}
 *   ],
 *   "img_url": "image.png"         // Optional image (or use "svg_content")
 * }
 * 
 * FEATURES:
 * - Left items stay fixed, right items shuffle automatically
 * - Works with both mouse/touch and keyboard
 * - Responsive design adapts to screen size
 */



/*
 Json structure

 {
      "type": "matching_connection",
      "id": "009",
      "question": "Match the following software with their categories:",
      "svg_content": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'><defs><marker id='arrow' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'><polygon points='0 0, 10 3.5, 0 7' fill='black'></polygon></marker><marker id='dot' markerWidth='5' markerHeight='5' refX='2.5' refY='2.5' orient='auto'><circle cx='2.5' cy='2.5' r='2.5' fill='black'></circle></marker></defs><line x1='30' y1='50' x2='70' y2='50' stroke='black' stroke-width='2'></line><circle cx='30' cy='50' r='3' fill='black'></circle><circle cx='70' cy='50' r='3' fill='black'></circle><text x='25' y='50' text-anchor='end' dominant-baseline='middle' font-size='12' fill='black'>A</text><text x='75' y='50' text-anchor='start' dominant-baseline='middle' font-size='12' fill='black'>B</text><line x1='100' y1='30' x2='100' y2='70' stroke='black' stroke-width='2' marker-end='url(#arrow)' marker-start='url(#dot)'></line><line x1='130' y1='50' x2='170' y2='50' stroke='black' stroke-width='2' stroke-dasharray='5,5'></line></svg>",
      "img_url": "https://media.baamboozle.com/uploads/images/156912/1647154273_67713.png",
      "pairs": [
        { "left": "Language", "right": "Java" },
        { "left": "Image Editor", "right": "Gimp" },
        { "left": "Operating System", "right": "Linux" },
        { "left": "Database", "right": "MySQL" }
      ],
      "user_response": ""
}
 
 */

