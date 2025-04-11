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
      if (!this.querySelector('#matching-question')) {
        this.innerHTML = `
          <div class="question-type" id="matching-question" style="display: block;">
            <div class="question-text" id="matching-question-text"></div>
            <div class="svg-figure" id="matching-svg-figure" style="display: none;"></div>
            <div class="figure" id="matching-figure" style="display: none;"></div>
            <div class="matching-container" id="matching-pairs"></div>
          </div>
        `;
      }

      this._questionTextEl = this.querySelector('#matching-question-text');
      this._svgFigureEl = this.querySelector('#matching-svg-figure');
      this._imageFigureEl = this.querySelector('#matching-figure');
      this._pairsContainer = this.querySelector('#matching-pairs');
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
      this._questionTextEl.textContent = question || '';
    }

    addSvg(svg_content) {
      if (svg_content) {
        this._svgFigureEl.style.display = '';
        this._svgFigureEl.innerHTML = svg_content;
      } else {
        this._svgFigureEl.style.display = 'none';
        this._svgFigureEl.innerHTML = '';
      }
    }

    addImg(img_url) {
      if (img_url) {
        this._imageFigureEl.style.display = '';
        this._imageFigureEl.innerHTML = `<img src="${img_url}" alt="figure" />`;
      } else {
        this._imageFigureEl.style.display = 'none';
        this._imageFigureEl.innerHTML = '';
      }
    }

    addAllPairs(pairs, distractors, user_response) {
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
      return JSON.stringify(Array.from(selects).map(s => s.value));
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

customElements.define('matching-question', MatchingComponent);


/*



<matching-question id="match-test"
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
</matching-question>









*/