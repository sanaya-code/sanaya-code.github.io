class FillInBlankOperation extends HTMLElement {
    constructor() {
        super();

        // Stores filled numbers
        this._responses = {
            first_row: [],
            second_row: [],
            third_row: [],
            fourth_row: []
        };

        // Stores strike-out states
        this._strike = {
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

    /* -----------------------------
       Initialize _responses & _strike
    ------------------------------ */
    _initializeState() {
        const ur = this.config.user_response || {};

        // Fallback empty rows based on initial_answer row lengths
        const initial = this.config.initial_answer;

        const emptyResponses = {
            first_row: initial.first_row.map(() => ""),
            second_row: initial.second_row.map(() => ""),
            third_row: initial.third_row.map(() => ""),
            fourth_row: initial.fourth_row.map(() => "")
        };

        const emptyStrike = {
            first_row: initial.first_row.map(() => false),
            second_row: initial.second_row.map(() => false),
            third_row: initial.third_row.map(() => false),
            fourth_row: initial.fourth_row.map(() => false)
        };

        /* ------- Build _responses ------- */
        this._responses = {
            first_row: Array.isArray(ur.first_row) ? [...ur.first_row] : [...emptyResponses.first_row],
            second_row: Array.isArray(ur.second_row) ? [...ur.second_row] : [...emptyResponses.second_row],
            third_row: Array.isArray(ur.third_row) ? [...ur.third_row] : [...emptyResponses.third_row],
            fourth_row: Array.isArray(ur.fourth_row) ? [...ur.fourth_row] : [...emptyResponses.fourth_row]
        };

        /* ------- Build _strike ------- */
        this._strike = {
            first_row: Array.isArray(ur.strike_first_row) ? [...ur.strike_first_row] : [...emptyStrike.first_row],
            second_row: Array.isArray(ur.strike_second_row) ? [...ur.strike_second_row] : [...emptyStrike.second_row],
            third_row: Array.isArray(ur.strike_third_row) ? [...ur.strike_third_row] : [...emptyStrike.third_row],
            fourth_row: Array.isArray(ur.strike_fourth_row) ? [...ur.strike_fourth_row] : [...emptyStrike.fourth_row]
        };
    }

    /* --------------------------
       RENDER
    --------------------------- */
    render() {
        this.config = this.getConfig();
        if (!this.config) return;

        this._initializeState(); // Important!

        const html = `
            <div class="fibopr-container">
                ${this.renderRow("first_row")}
                ${this.renderRow("second_row")}
                ${this.renderRow("third_row")}
                ${this.renderRow("fourth_row")}

                <div class="fibopr-choices">
                    ${this.config.choices
                        .map(c => `<button class="fibopr-choice" data-value="${c}">${c}</button>`)
                        .join("")}
                </div>
            </div>
        `;

        this.innerHTML = html;

        this.attachChoiceHandlers();
        this.attachBoxHandlers();
    }

    /* --------------------------
       Render ONE row
    --------------------------- */
    renderRow(rowName) {
        const editableArr = this.config.editable_answer[rowName];
        const initialArr = this.config.initial_answer[rowName];

        return `
            <div class="fibopr-row" data-row="${rowName}">
                ${initialArr
                    .map((initialVal, i) => {
                        const displayVal =
                            this._responses[rowName][i] !== ""
                                ? this._responses[rowName][i]
                                : initialVal || "";

                        const strikeClass = this._strike[rowName][i] ? "striked" : "";

                        return `
                        <div 
                            class="fibopr-box ${editableArr[i] ? "editable" : ""} ${strikeClass}"
                            data-row="${rowName}"
                            data-index="${i}">
                            ${displayVal}
                        </div>`;
                    })
                    .join("")}
            </div>
        `;
    }

    /* --------------------------
       CHOICE CLICK
    --------------------------- */
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

    /* --------------------------
       BOX CLICK + STRIKE
    --------------------------- */
    attachBoxHandlers() {
        const boxes = this.querySelectorAll(".fibopr-box");

        boxes.forEach(box => {
            const row = box.getAttribute("data-row");
            const index = parseInt(box.getAttribute("data-index"));

            /* --- Click to fill value --- */
            if (box.classList.contains("editable")) {
                box.addEventListener("click", () => {
                    // if (!this.selectedChoice) return;
                    if (this.selectedChoice === null) return;

                    box.textContent = this.selectedChoice;
                    box.classList.add("filled");

                    console.log(this.selectedChoice)
                    this._responses[row][index] = this.selectedChoice;

                    // Unselect choice
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

            /* --- Double click to strike toggle --- */
            box.addEventListener("dblclick", () => {
                box.classList.toggle("striked");

                this._strike[row][index] = !this._strike[row][index];

                this.dispatchEvent(
                    new CustomEvent("input-change", {
                        detail: this.getUserAnswer()
                    })
                );
            });
        });
    }

    /* --------------------------
       RETURN USER ANSWER
    --------------------------- */
    getUserAnswer() {
        return {
            first_row: this._responses.first_row,
            second_row: this._responses.second_row,
            third_row: this._responses.third_row,
            fourth_row: this._responses.fourth_row,

            strike_first_row: this._strike.first_row,
            strike_second_row: this._strike.second_row,
            strike_third_row: this._strike.third_row,
            strike_fourth_row: this._strike.fourth_row
        };
    }
}

customElements.define("fill-in-blank-operation", FillInBlankOperation);
