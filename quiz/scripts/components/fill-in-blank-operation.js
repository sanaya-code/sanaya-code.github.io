class FillInBlankOperation extends HTMLElement {
    constructor() {
        super();
        this._responses = {
            first_row: [],
            second_row: [],
            third_row: [],
            fourth_row: []
        };
        this.selectedChoice = null;
        this.config = null;
    }

    static get observedAttributes() {
        return ["config"];
    }

    connectedCallback() {
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    getConfig() {
        try {
            return JSON.parse(this.getAttribute("config"));
        } catch (e) {
            return null;
        }
    }

    /* Clone user_response safely (supports null, undefined, wrong shape) */
    _initializeResponses() {
        const ur = this.config.user_response || {};

        // Build empty structure
        const empty = {
            first_row: ["", "", ""],
            second_row: ["", ""],
            third_row: ["", "", ""],
            fourth_row: ["", "", ""]
        };

        // Deep clone (prefer user data when valid)
        this._responses = {
            first_row: Array.isArray(ur.first_row) ? [...ur.first_row] : [...empty.first_row],
            second_row: Array.isArray(ur.second_row) ? [...ur.second_row] : [...empty.second_row],
            third_row: Array.isArray(ur.third_row) ? [...ur.third_row] : [...empty.third_row],
            fourth_row: Array.isArray(ur.fourth_row) ? [...ur.fourth_row] : [...empty.fourth_row]
        };
    }

    render() {
        this.config = this.getConfig();
        if (!this.config) return;

        // Important: build local response copy
        this._initializeResponses();

        const html = `
            <div class="fibopr-container">
                ${this.renderRow("first_row")}
                ${this.renderRow("second_row")}
                ${this.renderRow("third_row")}
                ${this.renderRow("fourth_row")}

                <div class="fibopr-choices">
                    ${this.config.choices
                        .map(
                            c => `
                        <button class="fibopr-choice" data-value="${c}">${c}</button>
                    `
                        )
                        .join("")}
                </div>
            </div>
        `;

        this.innerHTML = html;

        this.attachChoiceHandlers();
        this.attachBoxHandlers();
    }

    /* Unified row rendering */
    renderRow(rowName) {
        const editableArr = this.config.editable_answer[rowName];
        const valueArr = this.config.initial_answer[rowName];

        return `
            <div class="fibopr-row" data-row="${rowName}">
                ${valueArr
                    .map(
                        (val, i) => `
                    <div 
                        class="fibopr-box ${editableArr[i] ? "editable" : ""}"
                        data-row="${rowName}"
                        data-index="${i}">
                        ${this._responses[rowName][i] || val || ""}
                    </div>
                `
                    )
                    .join("")}
            </div>
        `;
    }

    /* ===== CHOICE CLICK ===== */
    attachChoiceHandlers() {
        const choices = this.querySelectorAll(".fibopr-choice");

        choices.forEach(btn => {
            btn.addEventListener("click", () => {
                choices.forEach(c => c.classList.remove("selected"));
                btn.classList.add("selected");
                this.selectedChoice = btn.getAttribute("data-value");
            });
        });
    }

    /* ===== BOX CLICK + DOUBLE CLICK ===== */
    attachBoxHandlers() {
        const boxes = this.querySelectorAll(".fibopr-box");

        boxes.forEach(box => {
            const row = box.getAttribute("data-row");
            const index = parseInt(box.getAttribute("data-index"));

            /* CLICK → fill only if choice is selected */
            if (box.classList.contains("editable")) {
                box.addEventListener("click", () => {
                    if (!this.selectedChoice) return;

                    box.textContent = this.selectedChoice;
                    box.classList.add("filled");

                    // update local response store
                    this._responses[row][index] = this.selectedChoice;

                    // unhighlight choice
                    const choices = this.querySelectorAll(".fibopr-choice");
                    choices.forEach(c => c.classList.remove("selected"));
                    this.selectedChoice = null;

                    this.dispatchEvent(
                        new CustomEvent("input-change", {
                            detail: this.getUserAnswer()
                        })
                    );
                });
            }

            /* DOUBLE-CLICK → toggle strike-out */
            box.addEventListener("dblclick", () => {
                box.classList.toggle("striked");
            });
        });
    }

    /* ===== RETURN SAFE USER RESPONSE ===== */
    getUserAnswer() {
        return this._responses;
    }
}

customElements.define("fill-in-blank-operation", FillInBlankOperation);
