class OptionsFillInBlankComponent extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._currentInput = null;
    this._responses = [];         // now 2D: [optionIndex][blankIndex]
    this._activeChoice = null;
  }

  static get observedAttributes() {
    return ["config"];
  }

  connectedCallback() {
    this.setup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "config") {
      this.setup();
    }
  }

  // Add this method to determine blank type class
  getBlankTypeClass(blankType) {
    if (blankType === 'box') {
      return 'fib-blank-box';
    }
    return 'fib-blank-underline'; // default/current behavior
  }


  setup() {
    if (!this._initialized) {
      this.innerHTML = `
        <div class="fibmo-question-type">
          <div class="fibmo-question"></div>
          <div class="fibmo-svg" style="display:none;"></div>
          <div class="fibmo-img-new" style="display:none;"></div>
          <div class="fibmo-options"></div>
          <div class="fibmo-choices" style="display:none;"></div>
        </div>
      `;
      this._questionEl = this.querySelector(".fibmo-question");
      this._svgEl = this.querySelector(".fibmo-svg");
      this._imgEl = this.querySelector(".fibmo-img-new");
      this._optionsEl = this.querySelector(".fibmo-options");
      this._choicesEl = this.querySelector(".fibmo-choices");
      this._initialized = true;
    }

    try {
      this._config = JSON.parse(this.getAttribute("config") || "{}");

      // Initialize 2D responses array based on config.user_response or option text blanks
      this._initializeResponses();

      this.renderQuestion();
      this.renderOptions();
      this.addSvg(this._config);
      this.addImg(this._config);
      this.renderChoices();
    } catch (err) {
      console.warn("Invalid config:", err);
    }
  }

  /* Build a 2D _responses array:
     - If config.user_response is provided and shaped correctly, use it
     - Otherwise auto-create arrays for each option based on number of "____" blanks in option.text
  */
  _initializeResponses() {
    const opts = this._config.options || [];
    const userResp = Array.isArray(this._config.user_response) ? this._config.user_response : null;

    this._responses = opts.map((opt, optIndex) => {
      // Count blanks by splitting on /____+/ (same logic as render)
      const parts = (opt.text || "").split(/____+/g);
      const blanksCount = Math.max(0, parts.length - 1);

      if (userResp && Array.isArray(userResp[optIndex])) {
        // If provided response for this option and matches length, use it; otherwise normalize
        const provided = userResp[optIndex];
        const arr = Array(blanksCount).fill("");
        for (let i = 0; i < blanksCount; i++) {
          arr[i] = typeof provided[i] !== "undefined" ? provided[i] : "";
        }
        return arr;
      } else {
        // Create empty response array for this option
        return Array(blanksCount).fill("");
      }
    });
  }

  renderQuestion() {
    this._questionEl.textContent = this._config.question || "";
  }

  renderOptions() {
    this._optionsEl.innerHTML = "";
    const options = this._config.options || [];

    options.forEach((opt, optIndex) => {
      const container = document.createElement("div");
      container.className = "fibmo-option";

      const label = document.createElement("span");
      label.className = "mfib-option-label";
      label.textContent = `${String.fromCharCode(97 + optIndex)}) `;

      // Split text by blanks (one or more underscores sequence)
      const parts = (opt.text || "").split(/____+/g);
      const frag = document.createDocumentFragment();

      // For each segment, append text and (if not last) a blank span
      parts.forEach((textPart, partIndex) => {
        // add the text node
        frag.appendChild(document.createTextNode(textPart || ""));

        // if not the last segment, add a blank span
        if (partIndex < parts.length - 1) {
          const blankIndex = partIndex; // zero based
          const span = document.createElement("span");
          // span.className = "fibmo-blank";
          span.className = "fibmo-blank " + this.getBlankTypeClass(this._config.blank_type);

          // apply filled class if there is a response present
          const value = (this._responses[optIndex] && this._responses[optIndex][blankIndex]) || "";
          if (value !== "") span.classList.add("filled");

          span.dataset.option = String(optIndex);
          span.dataset.blank = String(blankIndex);
          span.textContent = value || "___";
          if(this.getBlankTypeClass(this._config.blank_type) == "fib-blank-box")
          {
            span.textContent = value || "\u00A0\u00A0\u00A0\u00A0\u00A0";
          }          
          // click handler for this specific blank
          span.addEventListener("click", (ev) => this.handleBlankClick(optIndex, blankIndex, span));
          frag.appendChild(span);
        }
      });

      container.appendChild(label);
      container.appendChild(frag);
      this._optionsEl.appendChild(container);
    });
  }

  addSvg(config) {
    if (config.svg_content) {
      this._svgEl.style.display = "";
      this._svgEl.innerHTML = config.svg_content;
    } else {
      this._svgEl.style.display = "none";
      this._svgEl.innerHTML = "";
    }
  }

  addImg(config) {
    if (config.img_url) {
      this._imgEl.style.display = "";
      this._imgEl.innerHTML = `<img src="${config.img_url}" alt="figure" />`;
    } else {
      this._imgEl.style.display = "none";
      this._imgEl.innerHTML = "";
    }
  }

  renderChoices() {
    if (this._config.choices && this._config.choices.length > 0) {
      this._choicesEl.style.display = "";
      this._choicesEl.innerHTML = this._config.choices
        .map((ch) => `<span class="fibmo-choice" data-value="${ch}">${ch}</span>`)
        .join("");

      this.bindChoiceEvents();
    } else {
      this._choicesEl.style.display = "none";
      this._choicesEl.innerHTML = "";
    }
  }

  bindChoiceEvents() {
    this._choicesEl.querySelectorAll(".fibmo-choice").forEach((choice) => {
      choice.addEventListener("click", () => {
        this.clearActiveChoice();
        choice.classList.add("active");
        this._activeChoice = choice.dataset.value;
      });
    });
  }

  /**
   * Handle click on a specific blank (optionIndex, blankIndex)
   * If an active choice exists => fill that blank with choice
   * Otherwise switch to inline input for that blank
   */
  handleBlankClick(optionIndex, blankIndex, spanEl) {
    // If there is an active choice, fill this blank with it
    if (this._activeChoice) {
      // ensure _responses shape
      if (!Array.isArray(this._responses[optionIndex])) {
        this._responses[optionIndex] = [];
      }
      this._responses[optionIndex][blankIndex] = this._activeChoice;

      // update UI
      spanEl.textContent = this._activeChoice;
      spanEl.classList.add("filled");

      // clear active choice after use
      this.clearActiveChoice();
    } else {
      // activate input for this blank
      this.activateInput(optionIndex, blankIndex, spanEl);
    }
  }

  /**
   * Replace blank span with input for editing that specific blank
   */
  activateInput(optionIndex, blankIndex, spanEl) {
    // commit any existing input first
    if (this._currentInput) {
      this.commitCurrentInput();
    }

    const value = (this._responses[optionIndex] && this._responses[optionIndex][blankIndex]) || "";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "fibmo-input";
    input.value = value;
    input.dataset.option = String(optionIndex);
    input.dataset.blank = String(blankIndex);

    // When losing focus, commit value back to responses and replace with span
    input.addEventListener("blur", () => {
      this.commitInput(input);
    });

    // also commit on Enter key
    input.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        input.blur(); // triggers commitInput via blur handler
      } else if (ev.key === "Escape") {
        // cancel editing: restore previous span without change
        this.commitCurrentInput(); // commitCurrentInput handles replace
      }
    });

    // replace the span element with input
    spanEl.replaceWith(input);
    input.focus();
    this._currentInput = input;
  }

  commitCurrentInput() {
    if (!this._currentInput) return;
    this.commitInput(this._currentInput);
  }

  /**
   * Commit input value back to _responses and recreate span for the blank
   */
  commitInput(inputEl) {
    const optionIndex = parseInt(inputEl.dataset.option, 10);
    const blankIndex = parseInt(inputEl.dataset.blank, 10);
    const value = inputEl.value.trim();

    // ensure shape
    if (!Array.isArray(this._responses[optionIndex])) {
      this._responses[optionIndex] = [];
    }
    this._responses[optionIndex][blankIndex] = value;

    // create a new span to replace input
    const span = document.createElement("span");
    // span.className = "fibmo-blank" + (value ? " filled" : "");
    span.className = "fibmo-blank " + this.getBlankTypeClass(this._config.blank_type) + (value ? " filled" : "");
    span.dataset.option = String(optionIndex);
    span.dataset.blank = String(blankIndex);
    span.textContent = value || "___";
    if(this.getBlankTypeClass(this._config.blank_type) == "fib-blank-box")
    {
      span.textContent = value || "\u00A0\u00A0\u00A0\u00A0\u00A0";
    }          
    span.addEventListener("click", (ev) => this.handleBlankClick(optionIndex, blankIndex, span));

    inputEl.replaceWith(span);
    this._currentInput = null;
  }

  clearActiveChoice() {
    this._choicesEl.querySelectorAll(".fibmo-choice").forEach((c) =>
      c.classList.remove("active")
    );
    this._activeChoice = null;
  }

  getUserAnswer() {
    // Commit any open input first
    this.commitCurrentInput();
    // Return the 2D responses array
    return this._responses;
  }
}

customElements.define("options-fill-in-blank", OptionsFillInBlankComponent);
