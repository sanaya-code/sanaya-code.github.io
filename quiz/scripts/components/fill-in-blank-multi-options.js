class OptionsFillInBlankComponent extends HTMLElement {
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
          <div class="mfib-question-type">
            <div class="mfib-question-text"></div>
            <div class="mfib-svg-figure" style="display: none;"></div>
            <div class="mfib-figure" style="display: none;"></div>
            <div class="mfib-option-list"></div>
          </div>
        `;
        this._questionEl = this.querySelector('.mfib-question-text');
        this._svgEl = this.querySelector('.mfib-svg-figure');
        this._figureEl = this.querySelector('.mfib-figure');
        this._optionListEl = this.querySelector('.mfib-option-list');
        this._initialized = true;
      }
  
      try {
        this._config = JSON.parse(this.getAttribute('config') || '{}');
        this._responses = [...(this._config.user_response || [])];
        this.renderQuestion();
        this.renderOptions();
        this.addSvg(this._config);
        this.addImg(this._config);
      } catch (err) {
        console.warn("Invalid config:", err);
      }
    }
  
    renderQuestion() {
      this._questionEl.textContent = this._config.question || '';
    }
  
    renderOptions() {
      this._optionListEl.innerHTML = '';
      const options = this._config.options || [];
  
      options.forEach((opt, i) => {
        const container = document.createElement('div');
        container.className = 'mfib-option-item';
  
        const label = document.createElement('span');
        label.className = 'mfib-option-label';
        label.textContent = `${String.fromCharCode(97 + i)}) `;
        // console.log(opt.text);
        // const parts = opt.statement.split(/____+/g);
        const parts = opt.text.split(/____+/g);
        const frag = document.createDocumentFragment();
  
        parts.forEach((text, j) => {
          frag.appendChild(document.createTextNode(text));
          if (j === 0) {
            const span = document.createElement('span');
            span.className = 'mfib-blank-span';
            span.dataset.index = i;
            span.textContent = this._responses[i] || '____';
            span.addEventListener('click', () => this.activateInput(i, span));
            frag.appendChild(span);
          }
        });
  
        container.appendChild(label);
        container.appendChild(frag);
        this._optionListEl.appendChild(container);
      });
    }
  
    addSvg(config) {
      if (config.svg_content) {
        this._svgEl.style.display = '';
        this._svgEl.innerHTML = config.svg_content;
      } else {
        this._svgEl.style.display = 'none';
        this._svgEl.innerHTML = '';
      }
    }
  
    addImg(config) {
      if (config.img_url) {
        this._figureEl.style.display = '';
        this._figureEl.innerHTML = `<img src="${config.img_url}" alt="figure" />`;
      } else {
        this._figureEl.style.display = 'none';
        this._figureEl.innerHTML = '';
      }
    }
  
    activateInput(index, span) {
      if (this._currentInput) {
        this.commitCurrentInput();
      }
  
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'mfib-text-answer';
      input.value = this._responses[index] || '';
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
      this._responses[index] = value;
  
      const span = document.createElement('span');
      span.className = 'mfib-blank-span';
      span.dataset.index = index;
      span.textContent = value || '____';
      span.addEventListener('click', () => this.activateInput(index, span));
  
      input.replaceWith(span);
      this._currentInput = null;
    }
  
    getUserAnswer() {
      this.commitCurrentInput();
      return this._responses;
    }
  }
  
customElements.define('options-fill-in-blank', OptionsFillInBlankComponent);

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