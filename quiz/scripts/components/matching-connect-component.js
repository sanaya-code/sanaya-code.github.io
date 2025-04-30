class MatchingConnectComponent extends HTMLElement {
    constructor() {
        super();
        this.lhsElements = [];
        this.rhsElements = [];
        this.matches = [];
        this.lineColors = [];
        this.svg = null;
    }

    static get observedAttributes() {
        return ["config"];
    }

    connectedCallback() {
        this.updateFromConfig();
        window.addEventListener("resize", this.handleResize.bind(this));
    }

    disconnectedCallback() {
        window.removeEventListener("resize", this.handleResize.bind(this));
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

    updateFromConfig() {
        const config = this.config;
        if (!config || !Array.isArray(config.pairs)) return;

        this.renderBaseLayout(config);
        this.initializeElements(config);
        this.setupEventListeners();
        this.applyInitialState(config);
        this.drawLines();
    }

    renderBaseLayout(config) {
        this.innerHTML = `
            <div class="question-text">${config.question || ""}</div>
            ${this.renderOptionalMedia(config)}
            <div class="options-container">
                <div class="connect-container">
                ${this.renderConnectRows(config)}
                <svg class="connect-svg"></svg>
                </div>
            </div>
        `;
    }

    renderOptionalMedia(config) {
        return [
            config.svg_content ? `<div class="svg-figure">${config.svg_content}</div>` : "",
            config.img_url ? `<div class="figure"><img src="${config.img_url}" alt="figure" /></div>` : ""
        ].join("");
    }

    renderConnectRows(config) {
        return config.pairs.map((pair, index) => `
            <div class="connect-row" data-index="${index}">
                <div class="connect-item connect-lhs" data-index="${index}">${pair.left}</div>
                <div class="connect-item connect-rhs" data-value="">${pair.right}</div>
            </div>
        `).join("");
    }

    initializeElements(config) {
        const container = this.querySelector(".connect-container");
        this.svg = container.querySelector("svg");
        this.lineColors = this.generateColorPalette(config.pairs.length);
        
        this.lhsElements = Array.from(container.querySelectorAll(".connect-lhs"));
        this.rhsElements = this.initializeRhsElements(container, config);
        this.matches = Array(config.pairs.length).fill(null);
    }

    initializeRhsElements(container, config) {
        const shuffledRHS = this.shuffleArray(config.pairs.map(p => p.right));
        const rhsElements = Array.from(container.querySelectorAll(".connect-rhs"));
        
        rhsElements.forEach((el, idx) => {
            el.textContent = shuffledRHS[idx];
            el.setAttribute("data-value", shuffledRHS[idx]);
        });
        
        return rhsElements;
    }

    shuffleArray(array) {
        return array
            .map(val => ({ val, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(o => o.val);
    }

    setupEventListeners() {
        this.setupLhsEventListeners();
        this.setupRhsEventListeners();
    }

    setupLhsEventListeners() {
        this.lhsElements.forEach(lhs => {
            lhs.addEventListener("click", () => {
                this.lhsElements.forEach(el => el.classList.remove("selected"));
                lhs.classList.add("selected");
            });
        });
    }

    setupRhsEventListeners() {
        const container = this.querySelector(".connect-container");
        
        this.rhsElements.forEach(rhs => {
            rhs.addEventListener("click", () => {
                const selectedLHS = container.querySelector(".connect-lhs.selected");
                if (!selectedLHS) return;

                const lhsIndex = parseInt(selectedLHS.getAttribute("data-index"));
                this.makeConnection(lhsIndex, rhs);
                selectedLHS.classList.remove("selected");
            });
        });
    }

    applyInitialState(config) {
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

    makeConnection(lhsIndex, rhsElement) {
        const rhsValue = rhsElement.textContent;
        this.matches = this.matches.map(val => val === rhsValue ? null : val);
        this.matches[lhsIndex] = rhsValue;
        this.drawLines();
    }

    drawLines() {
        if (!this.svg) return;

        this.clearSvg();
        const svgRect = this.svg.getBoundingClientRect();

        this.matches.forEach((rhsValue, lhsIndex) => {
            if (!rhsValue) return;
            this.drawSingleLine(lhsIndex, rhsValue, svgRect);
        });
    }

    clearSvg() {
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
    }

    drawSingleLine(lhsIndex, rhsValue, svgRect) {
        const lhsEl = this.lhsElements[lhsIndex];
        const rhsEl = this.rhsElements.find(r => r.textContent === rhsValue);
        if (!lhsEl || !rhsEl) return;

        const { x1, y1, x2, y2 } = this.calculateLineCoordinates(lhsEl, rhsEl, svgRect);
        this.createSvgLine(x1, y1, x2, y2, this.lineColors[lhsIndex]);
    }

    calculateLineCoordinates(lhsEl, rhsEl, svgRect) {
        const lhsRect = lhsEl.getBoundingClientRect();
        const rhsRect = rhsEl.getBoundingClientRect();

        return {
            x1: lhsRect.right - svgRect.left,
            y1: lhsRect.top + lhsRect.height / 2 - svgRect.top,
            x2: rhsRect.left - svgRect.left,
            y2: rhsRect.top + rhsRect.height / 2 - svgRect.top
        };
    }

    createSvgLine(x1, y1, x2, y2, color) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", 2);
        this.svg.appendChild(line);
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

    getUserAnswer() {
        return this.matches;
    }
}

customElements.define("matching-connection", MatchingConnectComponent);