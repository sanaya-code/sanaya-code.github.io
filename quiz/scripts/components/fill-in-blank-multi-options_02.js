class OptionsFillInBlankComponent extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._currentInput = null;
    this._responses = [];
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

  setup() {
    if (!this._initialized) {
      this.innerHTML = `
        <div class="fibmo-question-type">
          <div class="fibmo-question"></div>
          <div class="fibmo-svg" style="display:none;"></div>
          <div class="fibmo-img" style="display:none;"></div>
          <div class="fibmo-options"></div>
          <div class="fibmo-choices" style="display:none;"></div>
        </div>
      `;
      this._questionEl = this.querySelector(".fibmo-question");
      this._svgEl = this.querySelector(".fibmo-svg");
      this._imgEl = this.querySelector(".fibmo-img");
      this._optionsEl = this.querySelector(".fibmo-options");
      this._choicesEl = this.querySelector(".fibmo-choices");
      this._initialized = true;
    }

    try {
      this._config = JSON.parse(this.getAttribute("config") || "{}");
      this._responses = [...(this._config.user_response || this._config.options.map(() => ""))];

      this.renderQuestion();
      this.renderOptions();
      this.addSvg(this._config);
      this.addImg(this._config);
      this.renderChoices();
    } catch (err) {
      console.warn("Invalid config:", err);
    }
  }

  renderQuestion() {
    this._questionEl.textContent = this._config.question || "";
  }

  renderOptions() {
    this._optionsEl.innerHTML = "";
    const options = this._config.options || [];

    options.forEach((opt, i) => {
      const container = document.createElement("div");
      container.className = "fibmo-option";

      const label = document.createElement("span");
      label.className = "mfib-option-label";
      label.textContent = `${String.fromCharCode(97 + i)}) `;

      const parts = opt.text.split(/____+/g);
      const frag = document.createDocumentFragment();

      parts.forEach((text, j) => {
        frag.appendChild(document.createTextNode(text));
        if (j === 0) {
          const span = document.createElement("span");
          span.className = "fibmo-blank" + (this._responses[i] ? " filled" : "");
          span.dataset.index = i;
          span.textContent = this._responses[i] || "___";
          span.addEventListener("click", () => this.handleBlankClick(i, span));
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

  handleBlankClick(index, span) {
    if (this._activeChoice) {
      // Insert chosen value
      this._responses[index] = this._activeChoice;
      span.textContent = this._activeChoice;
      span.classList.add("filled");
      this.clearActiveChoice();
    } else {
      // Switch to editable input
      this.activateInput(index, span);
    }
  }

  activateInput(index, span) {
    if (this._currentInput) {
      this.commitCurrentInput();
    }

    const input = document.createElement("input");
    input.type = "text";
    input.className = "fibmo-input";
    input.value = this._responses[index] || "";
    input.dataset.index = index;

    input.addEventListener("blur", () => {
      this.commitInput(input);
    });

    span.replaceWith(input);
    input.focus();
    this._currentInput = input;
  }

  commitCurrentInput() {
    if (!this._currentInput) return;
    this.commitInput(this._currentInput);
  }

  commitInput(input) {
    const index = parseInt(input.dataset.index, 10);
    const value = input.value.trim();
    this._responses[index] = value;

    const span = document.createElement("span");
    span.className = "fibmo-blank" + (value ? " filled" : "");
    span.dataset.index = index;
    span.textContent = value || "___";
    span.addEventListener("click", () => this.handleBlankClick(index, span));

    input.replaceWith(span);
    this._currentInput = null;
  }

  clearActiveChoice() {
    this._choicesEl.querySelectorAll(".fibmo-choice").forEach((c) =>
      c.classList.remove("active")
    );
    this._activeChoice = null;
  }

  getUserAnswer() {
    this.commitCurrentInput();
    return this._responses;
  }
}

customElements.define("options-fill-in-blank", OptionsFillInBlankComponent);

/*


    {
      "type": "old_options_fill_in_blank",
      "id": "004x",
      "question": "Fill in the blanks in the following statements:",
      "svg_content": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'><defs><marker id='arrow' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'><polygon points='0 0, 10 3.5, 0 7' fill='black'></polygon></marker><marker id='dot' markerWidth='5' markerHeight='5' refX='2.5' refY='2.5' orient='auto'><circle cx='2.5' cy='2.5' r='2.5' fill='black'></circle></marker></defs><line x1='30' y1='50' x2='70' y2='50' stroke='black' stroke-width='2'></line><circle cx='30' cy='50' r='3' fill='black'></circle><circle cx='70' cy='50' r='3' fill='black'></circle><text x='25' y='50' text-anchor='end' dominant-baseline='middle' font-size='12' fill='black'>A</text><text x='75' y='50' text-anchor='start' dominant-baseline='middle' font-size='12' fill='black'>B</text><line x1='100' y1='30' x2='100' y2='70' stroke='black' stroke-width='2' marker-end='url(#arrow)' marker-start='url(#dot)'></line><line x1='130' y1='50' x2='170' y2='50' stroke='black' stroke-width='2' stroke-dasharray='5,5'></line></svg>",
      "img_url": "data/school/c1_miriam/images/front_behind_01.jpg",
      "options": [
        {
          "id": "01",
          "text": "Sides in triangle ____ .",
          "correct_answer": "3",
          "acceptable_answers": ["three", "3"],
          "hint": "Freezing point of water"
        },
        {
          "id": "02",
          "text": "Sides in square is ____.",
          "correct_answer": "4",
          "acceptable_answers": ["4"],
          "hint": "City of lights"
        },
        {
          "id": "03",
          "text": "Sides in pentegaon is ____ .",
          "correct_answer": "5",
          "acceptable_answers": ["five", "5"],
          "hint": "Basic geometry"
        }
      ],
      "user_response": ["", "", ""],
      "choices": ["0", "1", "2", "3", "4", "5", "6"],
      "case_sensitive": false,
      "difficulty": "easy",
      "tags": ["gk", "science", "maths"],
      "points": 3,
      "scoring_method": "exact",
      "scoring_method_01": "partial",
      "feedback": {
        "full_credit": "Great job! All answers are correct.",
        "partial_credit": "Some answers are correct. Try again.",
        "none": "None of the blanks are correct."
      }
    },

*/


  /*

function testOptionsFillInBlank() {
  const el = document.createElement('options-fill-in-blank');

  const configObj = {
    type: "options_fill_in_blank",
    id: "Q101",
    question: "Fill the blanks in each option below:",
    svg_content: "<svg width='100' height='50'><circle cx='25' cy='25' r='20' fill='skyblue' /></svg>",
    img_url: "https://via.placeholder.com/150",
    options: [
      { label: "a", text: "The capital of France is ____.", correct_answer: "Paris", acceptable_answers: ["paris"], hint: "City of lights" },
      { label: "b", text: "Water boils at ____ degrees Celsius.", correct_answer: "100", acceptable_answers: ["100", "one hundred"], hint: "Triple-digit boiling point" },
      { label: "c", text: "The square root of 9 is ____.", correct_answer: "3", acceptable_answers: ["three"], hint: "Single-digit result" }
    ],
    user_response: ["", "", ""],
    case_sensitive: false,
    difficulty: "easy",
    tags: ["gk", "science", "math"],
    points: 3,
    scoring_method: "exact",
    feedback: {
      full_credit: "Well done!",
      partial_credit: "You got some correct!",
      none: "Try again!"
    }
  };

  el.setAttribute('config', JSON.stringify(configObj));
  document.body.appendChild(el);

  // Wait 5 seconds, then log the responses
  setTimeout(() => {
    const answers = el.getUserAnswer();
    console.log("User responses:", answers);
  }, 5000);
}


  */