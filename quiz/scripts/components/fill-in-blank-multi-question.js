class MultiFillInBlankComponent extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
    this._currentInput = null;
    this._responses = [];
  }

  static get observedAttributes() {
    return ['config'];
  }

  connectedCallback() {
    this.setup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'config') {
      this.setup();
    }
  }

  setup() {
    if (!this._initialized) {
      this.innerHTML = `
        <div class="question-type">
          <div class="svg-figure" style="display: none;"></div>
          <div class="figure" style="display: none;"></div>
          <div class="question-text"></div>
        </div>
      `;
      this._questionEl = this.querySelector('.question-text');
      this._svgEl = this.querySelector('.svg-figure');
      this._figureEl = this.querySelector('.figure');
      this._initialized = true;
    }

    try {
      this._config = JSON.parse(this.getAttribute('config') || '{}');
      this._responses = [...(this._config.user_response || [])];
      this.renderQuestion();
      this.addSvg(this._config);
      this.addImg(this._config);
    } catch (err) {
      console.warn("Invalid config:", err);
    }
  }

  renderQuestion() {
    const parts = this._config.question.split(/____+/g);
    const frag = document.createDocumentFragment();

    parts.forEach((text, i) => {
      frag.appendChild(document.createTextNode(text));
      if (i < this._config.blanks.length) {
        const span = document.createElement('span');
        span.className = 'blank-span';
        span.dataset.index = i;
        span.textContent = this._responses[i] || '____'; // Default placeholder text
        span.addEventListener('click', () => this.activateInput(i, span));
        frag.appendChild(span);
      }
    });

    this._questionEl.innerHTML = '';
    this._questionEl.appendChild(frag);
  }

  addSvg(config) {
    if (this._svgEl) {
      if (config.svg_content) {
        this._svgEl.style.display = '';
        this._svgEl.innerHTML = config.svg_content;
      } else {
        this._svgEl.style.display = 'none';
        this._svgEl.innerHTML = '';
      }
    }
  }

  addImg(config) {
    if (this._figureEl) {
      if (config.img_url) {
        this._figureEl.style.display = '';
        this._figureEl.innerHTML = `<img src="${config.img_url}" alt="figure" />`;
      } else {
        this._figureEl.style.display = 'none';
        this._figureEl.innerHTML = '';
      }
    }
  }

  activateInput(index, span) {
    if (this._currentInput) {
      this.commitCurrentInput();
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'text-answer';
    input.value = this._responses[index] || ''; // Default to empty string if no response
    input.dataset.index = index;

    input.addEventListener('blur', () => {
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

    // Update the response with the input value
    this._responses[index] = value;

    const newSpan = document.createElement('span');
    newSpan.className = 'blank-span';
    newSpan.dataset.index = index;
    newSpan.textContent = value || '____'; // Show the value or default to '____' if empty
    newSpan.addEventListener('click', () => this.activateInput(index, newSpan));

    input.replaceWith(newSpan);
    this._currentInput = null;
  }

  getUserAnswer() {
    this.commitCurrentInput();

    // Return the responses (even if some blanks are still empty)
    // console.log("return val ", this._responses);
    return this._responses;
  }
}

customElements.define('multi-fill-in-blank', MultiFillInBlankComponent);


/*

<multi-fill-in-blank
      id="multiBlankComponent"
      config='{
        "question": "The process of ____ converts water into ____, while ____ turns it back into liquid.",
        "blanks": [
          {"position": 1, "correct_answer": "evaporation", "acceptable_answers": ["evaporation", "vaporization"]},
          {"position": 2, "correct_answer": "vapor", "acceptable_answers": ["vapor", "steam", "gas"]},
          {"position": 3, "correct_answer": "condensation", "acceptable_answers": ["condensation", "liquefaction"]}
        ],
        "user_response": ["", "", ""]
      }'>
</multi-fill-in-blank>


function test() {
  const sampleConfig = {
    type: "multi_fill_in_blank",
    id: "009",
    question: "Complete the sentence: The process of ____ converts water into ____, while ____ turns it back into liquid.",
    svg_content: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'><text x='10' y='50'>Sample SVG</text></svg>",
    img_url: "",
    blanks: [
      {
        position: 1,
        correct_answer: "evaporation",
        acceptable_answers: ["evaporation", "vaporization"],
        hint: "Liquid to gas phase change"
      },
      {
        position: 2,
        correct_answer: "vapor",
        acceptable_answers: ["vapor", "steam", "gas"],
        hint: "Gaseous state of water"
      },
      {
        position: 3,
        correct_answer: "condensation",
        acceptable_answers: ["condensation", "liquefaction"],
        hint: "Gas to liquid phase change"
      }
    ],
    user_response: ["", "", ""],
    case_sensitive: false,
    difficulty: "medium",
    tags: ["science", "physics", "phase-changes"],
    points: 2,
    scoring_method: "partial",
    feedback: {
      full_credit: "All blanks filled correctly",
      partial_credit: "1-2 blanks correct",
      none: "No correct answers"
    }
  };

  const comp = document.createElement('multi-fill-in-blank');
  comp.setAttribute('config', JSON.stringify(sampleConfig));
  document.body.appendChild(comp);

  // Optional: Log responses after 10 seconds
  setTimeout(() => {
    console.log('User responses:', comp.getUserAnswer());
  }, 10000);
}



*/