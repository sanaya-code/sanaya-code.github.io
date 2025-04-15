class MatchingComponent extends HTMLElement {
  constructor() {
    super();
    this._config = null;

    // Cached DOM references
    this._questionTextEl = null;
    this._svgFigureEl = null;
    this._imageFigureEl = null;
    this._pairsContainer = null;
  }

  static get observedAttributes() {
    return ['config'];
  }

  connectedCallback() {
    this.ensureStructure();
    this.updateFromConfig();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'config') {
      this.ensureStructure();
      this.updateFromConfig();
    }
  }

  ensureStructure() {
    // If already initialized, skip
    if (this.querySelector('.matching-component-root')) return;

    this.innerHTML = `
      <div class="matching-component-root">
        <div class="question-type" style="display: block;">
          <div class="question-text"></div>
          <div class="svg-figure" style="display: none;"></div>
          <div class="figure" style="display: none;"></div>
          <div class="matching-container"></div>
        </div>
      </div>
    `;

    this._questionTextEl = this.querySelector('.question-text');
    this._svgFigureEl = this.querySelector('.svg-figure');
    this._imageFigureEl = this.querySelector('.figure');
    this._pairsContainer = this.querySelector('.matching-container');
  }

  updateFromConfig() {
    const raw = this.getAttribute('config');
    if (!raw) return;

    try {
      const config = JSON.parse(raw);
      this._config = config;

      this.addQunStatement(config.question);
      this.addSvg(config.svg_content);
      this.addImg(config.img_url);
      this.addAllPairs(config.pairs || [], config.distractors || [], config.user_response || []);
    } catch (e) {
      console.error('Invalid config JSON', e);
    }
  }

  addQunStatement(question) {
    if (this._questionTextEl) {
      this._questionTextEl.textContent = question || '';
    }
  }

  addSvg(svg_content) {
    if (this._svgFigureEl) {
      if (svg_content) {
        this._svgFigureEl.style.display = '';
        this._svgFigureEl.innerHTML = svg_content;
      } else {
        this._svgFigureEl.style.display = 'none';
        this._svgFigureEl.innerHTML = '';
      }
    }
  }

  addImg(img_url) {
    if (this._imageFigureEl) {
      if (img_url) {
        this._imageFigureEl.style.display = '';
        this._imageFigureEl.innerHTML = `<img src="${img_url}" alt="figure" />`;
      } else {
        this._imageFigureEl.style.display = 'none';
        this._imageFigureEl.innerHTML = '';
      }
    }
  }

  addAllPairs(pairs, distractors, user_response) {
    if (!this._pairsContainer) return;

    this._pairsContainer.innerHTML = '';
    const options = [...pairs.map(p => p.right), ...distractors];

    pairs.forEach((pair, idx) => {
      this.addPair(pair, options, user_response, idx);
    });
  }

  addPair(pair, options, user_response, idx) {
    const div = document.createElement('div');
    div.className = 'matching-pair';

    const left = document.createElement('div');
    left.className = 'matching-left';
    left.textContent = pair.left;

    const select = document.createElement('select');
    select.className = 'matching-select';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = 'Select match';
    select.appendChild(defaultOpt);

    options.forEach(optText => {
      const opt = document.createElement('option');
      opt.value = optText;
      opt.textContent = optText;
      select.appendChild(opt);
    });

    if (Array.isArray(user_response) && user_response[idx]) {
      select.value = user_response[idx];
    }

    div.appendChild(left);
    div.appendChild(select);
    this._pairsContainer.appendChild(div);
  }

  getUserAnswer() {
    const selects = this.querySelectorAll('.matching-select');
    return Array.from(selects).map(s => s.value);
  }

  disconnectedCallback() {
    if (this._questionTextEl) this._questionTextEl.textContent = '';
    if (this._svgFigureEl) {
      this._svgFigureEl.innerHTML = '';
      this._svgFigureEl.style.display = 'none';
    }
    if (this._imageFigureEl) {
      this._imageFigureEl.innerHTML = '';
      this._imageFigureEl.style.display = 'none';
    }
    if (this._pairsContainer) this._pairsContainer.innerHTML = '';
  }
}

customElements.define('matching-select', MatchingComponent);


/*

function test() {

    const mcqEl = document.createElement('matching-select');

    const configObj = {
        question: "Which planet is the largest in our solar system?",
        svg_content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }.line-blue { stroke: blue; stroke-width: 1.5; fill: none; }.point { font-family: Arial; font-size: 10px; font-weight: bold; }.angle-fill { fill: rgba(100,200,255,0.3); stroke: none; }.point-marker { fill: red; r: 2; }.angle-label { font-size: 10px; }</style><path class="angle-fill" d="M 10 110 L 90 110 L 79.28 70 Z"/><path class="angle-fill" d="M 10 110 L 79.28 70 L 50 40.72 Z"/><line x1="10" y1="110" x2="90" y2="110" class="line"/><line x1="10" y1="110" x2="79.28" y2="70" class="line-blue"/><line x1="10" y1="110" x2="50" y2="40.72" class="line"/><circle cx="10" cy="110" r="2" class="point-marker"/><text x="05" y="120" class="point">O</text><circle cx="90" cy="110" r="2" class="point-marker"/><text x="93" y="113" class="point">C</text><circle cx="79.28" cy="70" r="2" class="point-marker"/><text x="82.28" y="73" class="point">B</text><circle cx="50" cy="40.72" r="2" class="point-marker"/><text x="53" y="43.72" class="point">A</text><text x="50" y="100" class="angle-label">15°</text></svg>`,
        img_url: "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
        pairs: [
            { left: "A", right: "Earth" },
            { left: "B", right: "Mars" },
            { left: "C", right: "Jupiter" }
        ]  
    };

    // Set only the config attribute
    mcqEl.setAttribute("config", JSON.stringify(configObj));

    // Append to DOM
    document.getElementById("quiz").appendChild(mcqEl);

    // Wait and log user's answer
    setTimeout(() => {
        const userAnswer = mcqEl.getUserAnswer();
        console.log("User's answer is:", userAnswer);
    }, 5000);
}

<matching-select id="match-test"
  config='{
    "question": "Match the inventors with their inventions.",
    "svg_content": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 130 130\"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }</style><circle cx=\"65\" cy=\"65\" r=\"50\" class=\"line\"/></svg>",
    "img_url": "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
    "pairs": [
      { "left": "Thomas Edison", "right": "Light Bulb" },
      { "left": "Alexander Graham Bell", "right": "Telephone" },
      { "left": "Nikola Tesla", "right": "AC Current" }
    ],
    "distractors": ["Radio", "Steam Engine"],
    "user_response": ["Light Bulb", "", "AC Current"]
  }'>
</matching-select>









*/