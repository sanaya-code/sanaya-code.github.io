class SelectTwoQuantities extends HTMLElement {
    constructor() {
      super();
      this._config = {};
      this._userResponse = {};
    }
  
    static get observedAttributes() {
      return ["config"];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "config" && newValue) {
        this._setConfig(newValue);
        this.render();
      }
    }
  
    connectedCallback() {
      if (!this.innerHTML.trim() && this.hasAttribute("config")) {
        this._setConfig(this.getAttribute("config"));
        this.render();
      }
    }
  
    _setConfig(configStr) {
      this._config = JSON.parse(configStr);
      // Copy previous user response or start empty
      this._userResponse = { ...this._config.user_response };
    }
  
    render() {
      const { question, quantities } = this._config;
      const { required_selections } = this._config;
  
      this.innerHTML = `
        <div class="stq-container">
          <div class="stq-question">${question}</div>
          <div class="stq-quantities">
            ${quantities
              .map(
                (q) => `
                  <div class="stq-quantity" data-id="${q.id}">
                    ${q.value}
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="stq-instructions">
            ${required_selections
              .map(
                (sel) =>
                  `<div><strong>${sel.label}</strong> → ${sel.highlight_style.type} (${sel.highlight_style.value})</div>`
              )
              .join("")}
          </div>
        </div>
      `;
  
      this._applyHighlights();
      this._attachListeners();
    }
  
    _applyHighlights() {
      const { required_selections } = this._config;
      const quantityEls = this.querySelectorAll(".stq-quantity");
  
      // Reset all highlights first
      quantityEls.forEach((el) => {
        el.className = "stq-quantity";
        el.innerHTML = this._config.quantities.find(
          (q) => q.id === el.dataset.id
        ).value;
      });
  
      // Apply highlights for selected answers
      required_selections.forEach((sel) => {
        const selectedId = this._userResponse[sel.key];
        if (!selectedId) return;
  
        const selectedEl = this.querySelector(
          `.stq-quantity[data-id="${selectedId}"]`
        );
        if (selectedEl) {
          const { type, value } = sel.highlight_style;
          if (type === "color") {
            selectedEl.classList.add(`highlight-color-${value}`);
          } else if (type === "shape") {
            selectedEl.classList.add(`highlight-shape-${value}`);
          } else if (type === "mark" && value === "tick") {
            selectedEl.innerHTML += ` ✓`;
          }
        }
      });
    }
  
    _attachListeners() {
      const { required_selections } = this._config;
      const quantityEls = this.querySelectorAll(".stq-quantity");
  
      quantityEls.forEach((el) => {
        el.addEventListener("click", () => {
          const id = el.dataset.id;
  
          // Find first unfilled slot or toggle if already selected
          let updated = false;
  
          for (const sel of required_selections) {
            if (this._userResponse[sel.key] === id) {
              // deselect this choice
              this._userResponse[sel.key] = "";
              updated = true;
              break;
            }
          }
  
          if (!updated) {
            for (const sel of required_selections) {
              if (!this._userResponse[sel.key]) {
                this._userResponse[sel.key] = id;
                break;
              }
            }
          }
  
          this._applyHighlights();
          this._emitChange();
        });
      });
    }
  
    _emitChange() {
      this.dispatchEvent(
        new CustomEvent("input-change", {
          detail: { user_response: { ...this._userResponse } },
        })
      );
    }
  
    getUserAnswer() {
      return { ...this._userResponse };
    }
  }
  
  customElements.define("multi-select-two", SelectTwoQuantities);
  

  /*

  <link rel="stylesheet" href="../styles/multi-select-two.css" />

  <multi-select-two id="q1"></multi-select-two>


  <script src="../scripts/components/multi-select-two.js"></script>
  <script src="../scripts/utils/quiz_evaluators/MultiSelectTwo.js"></script>
  <script>
    const config = {
      type: "multi_select_two",
      id: "18",
      question: "Highlight the largest and smallest numbers.",
      quantities: [
        { id: "1", value: 12 },
        { id: "2", value: 45 },
        { id: "3", value: 7 },
        { id: "4", value: 28 },
        { id: "5", value: 33 },
      ],
      required_selections: [
        {
          label: "Smallest",
          key: "smallest",
          highlight_style: { type: "color", value: "green" },
        },
        {
          label: "Greatest",
          key: "greatest",
          highlight_style: { type: "mark", value: "square" },
        },
      ],
      available_highlight_styles: [
        { type: "shape", value: "circle", description: "Encircle the selection" },
        { type: "shape", value: "square", description: "Square border" },
        { type: "color", value: "red", description: "Fill background with red" },
        { type: "color", value: "green", description: "Fill background with green" },
        { type: "mark", value: "tick", description: "Tick mark next to selection" },
      ],
      correct_answer: { smallest: "3", greatest: "2" },
      user_response: { smallest: "", greatest: "" },
      explanation: "7 is the smallest number and 45 is the greatest number in the list.",
      difficulty: "medium",
      tags: ["math", "number_comparison"],
      points: 2,
      time_limit: 45,
    };

    const comp = document.getElementById("q1");
    comp.setAttribute("config", JSON.stringify(config));

    comp.addEventListener("input-change", (e) => {
      console.log("Updated response:", e.detail.user_response);
    });

    // Example evaluation after 5 seconds
    setTimeout(() => {
      const userAnswer = comp.getUserAnswer();
      console.log("User Answer:", userAnswer);
      console.log(
        "Correct?",
        SelectTwoQuantitiesEvaluator.checkAnswer(config, userAnswer)
      );
      console.log(
        "Formatted User Answer:",
        SelectTwoQuantitiesEvaluator.formatUserAnswer(config, userAnswer)
      );
      console.log(
        "Correct Answer:",
        SelectTwoQuantitiesEvaluator.formatCorrectAnswer(config)
      );
    }, 5000);
  </script>

  */