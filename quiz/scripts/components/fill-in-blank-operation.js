class FillInBlankOperation extends HTMLElement {
  constructor() {
      super();
      this.selectedChoice = null;   // stores currently selected choice
      this.config = null;
  }

  connectedCallback() {
      this.render();
  }

  static get observedAttributes() {
      return ["config"];
  }

  attributeChangedCallback() {
      this.render();
  }

  setConfig(json) {
      this.setAttribute("config", JSON.stringify(json));
  }

  getConfig() {
      try {
          return JSON.parse(this.getAttribute("config"));
      } catch (e) {
          return null;
      }
  }

  render() {
      this.config = this.getConfig();
      if (!this.config) return;

      const operation = this.config;

      const html = `
          <div class="fibopr-container">
              ${this.renderRow(operation.editable_answer.first_row, operation.initial_answer.first_row, "first_row")}
              ${this.renderRow(operation.editable_answer.second_row, operation.initial_answer.second_row, "second_row")}
              ${this.renderRow(operation.editable_answer.third_row, operation.initial_answer.third_row, "third_row")}
              ${this.renderRow(operation.editable_answer.fourth_row, operation.initial_answer.fourth_row, "fourth_row")}

              <div class="fibopr-choices">
                  ${operation.choices.map(c => `
                      <button class="fibopr-choice" data-value="${c}">${c}</button>
                  `).join("")}
              </div>
          </div>
      `;

      this.innerHTML = html;

      this.attachChoiceHandlers();
      this.attachBoxHandlers();
  }

  /* Render one row */
  renderRow(editableArr, valueArr, rowName) {
      return `
          <div class="fibopr-row" data-row="${rowName}">
              ${valueArr.map((val, i) => `
                  <div 
                      class="fibopr-box ${editableArr[i] ? "editable" : ""}"
                      data-row="${rowName}"
                      data-index="${i}">
                      ${val}
                  </div>
              `).join("")}
          </div>
      `;
  }

  /* Choice click: highlight only */
  attachChoiceHandlers() {
      const choices = this.querySelectorAll(".fibopr-choice");

      choices.forEach(btn => {
          btn.addEventListener("click", () => {
              // remove old selection
              choices.forEach(c => c.classList.remove("selected"));

              // add new selection
              btn.classList.add("selected");

              // store selected value
              this.selectedChoice = btn.getAttribute("data-value");
          });
      });
  }

  /* Box click: fill only if a choice is selected */
  attachBoxHandlers() {
    const boxes = this.querySelectorAll(".fibopr-box");

    boxes.forEach(box => {

        /* CLICK → fill only if choice is selected */
        if (box.classList.contains("editable")) {
          box.addEventListener("click", () => {
              if (!this.selectedChoice) return;

              box.textContent = this.selectedChoice;
              box.classList.add("filled");

              const row = box.getAttribute("data-row");
              const index = box.getAttribute("data-index");

              if (!this.config.user_response[row]) {
                  this.config.user_response[row] = [];
              }

              this.config.user_response[row][index] = this.selectedChoice;

              /* ==== UN-HIGHLIGHT CHOICE AFTER FILL ==== */
              const choices = this.querySelectorAll(".fibopr-choice");
              choices.forEach(c => c.classList.remove("selected"));
              this.selectedChoice = null;

              this.dispatchEvent(
                  new CustomEvent("input-change", { detail: this.getUserAnswer() })
              );
          });
        }


        /* DOUBLE-CLICK → toggle strike-out (for ALL boxes) */
        box.addEventListener("dblclick", () => {
            box.classList.toggle("striked");
        });
    });
}

  getUserAnswer() {
      return this.config.user_response || {};
  }
}

customElements.define("fill-in-blank-operation", FillInBlankOperation);

/*

<script>
      // Test the FourRowDigitOperation component
      function testFourRowDigitOperation() {

        const testConfig = {
          "type": "fill_in_blank_operation",
          "id": "op_001",

          "operation": {
            "name": "subtraction",
            "symbol": "-"
          },

          "editable_answer": {
            "first_row":  [true, true, true],
            "second_row": [false, false],
            "third_row":  [false, false, false],
            "fourth_row": [true, true, true]
          },

          "initial_answer": {
            "first_row":  ["", "", ""],
            "second_row": ["3", "7"],
            "third_row":  ["-", "1", "9"],
            "fourth_row": ["", "", ""]
          },

          "correct_answer": {
            "first_row":  ["", "2", "17"],
            "second_row": ["3", "7"],
            "third_row":  ["-", "1", "9"],
            "fourth_row": ["", "1", "8"]
          },

          "user_response": {
            "first_row":  ["", "", ""],
            "fourth_row": ["", "", ""]
          },

          "choices": ["1", "2", "17", "8", "13", "6", "5"],

          "scoring_method": "exact",
          "case_sensitive": false,

          "metadata": {
            "difficulty": "easy",
            "points": 5,
            "tags": ["math", "subtraction", "place-value", "borrow"]
          }
        };

        const component = document.createElement("fill-in-blank-operation");
        component.setAttribute("config", JSON.stringify(testConfig));

        const container = document.getElementById("test-container");
        container.innerHTML = "";
        container.appendChild(component);

        // Log changes
        component.addEventListener("input-change", (e) => {
          console.log("Updated:", e.detail);
        });
      }

      // Run the test
      testFourRowDigitOperation();
    </script>


*/