class MatchingDragComponent extends HTMLElement {
  constructor() {
    super();
    this._config = null;
    this._questionTextEl = null;
    this._svgFigureEl = null;
    this._imageFigureEl = null;
    this._pairsContainer = null;
    this._optionsContainer = null;
    this._dropTargets = [];
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
    if (!this.querySelector('.matching-question')) {
      this.innerHTML = `
        <div class="question-type matching-question" style="display: block;">
          <div class="question-text matching-question-text"></div>
          <div class="svg-figure matching-svg-figure" style="display: none;"></div>
          <div class="figure matching-figure" style="display: none;"></div>
          <div class="matching-container matching-pairs"></div>
          <div class="answer-bank matching-options" style="margin-top: 1em;"></div>
        </div>
      `;
    }

    this._questionTextEl = this.querySelector('.matching-question-text');
    this._svgFigureEl = this.querySelector('.matching-svg-figure');
    this._imageFigureEl = this.querySelector('.matching-figure');
    this._pairsContainer = this.querySelector('.matching-pairs');
    this._optionsContainer = this.querySelector('.matching-options');
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
      this.addPairs(config.pairs || [], config.distractors || [], config.user_response || []);
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

  addPairs(pairs, distractors, user_response) {
    this._pairsContainer.innerHTML = '';
    this._optionsContainer.innerHTML = '';
    this._dropTargets = [];

    const allOptions = [...pairs.map(p => p.right), ...distractors];

    allOptions.forEach((optionText) => {
      const opt = document.createElement('div');
      opt.className = 'draggable-option';
      opt.draggable = true;
      opt.textContent = optionText;
      opt.dataset.value = optionText;
      opt.style.cssText = `
        border: 1px solid #ccc;
        padding: 4px 8px;
        margin: 4px;
        display: inline-block;
        cursor: grab;
      `;
      opt.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', optionText);
      });
      this._optionsContainer.appendChild(opt);
    });

    pairs.forEach((pair, idx) => {
      const pairDiv = document.createElement('div');
      pairDiv.className = 'matching-pair';
      pairDiv.style.cssText = 'display: flex; align-items: center; margin-bottom: 10px;';

      const leftDiv = document.createElement('div');
      leftDiv.className = 'matching-left';
      leftDiv.textContent = pair.left;
      leftDiv.style.minWidth = '150px';

      const dropZone = document.createElement('div');
      dropZone.className = 'drop-zone';
      dropZone.dataset.index = idx;
      dropZone.style.cssText = `
        flex: 1;
        min-height: 30px;
        border: 2px dashed #ccc;
        margin-left: 1em;
        padding: 4px 8px;
        background: #f9f9f9;
      `;

      dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.style.background = '#e0f7fa';
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.style.background = '#f9f9f9';
      });

      dropZone.addEventListener('drop', e => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        dropZone.textContent = data;
        dropZone.dataset.value = data;
        dropZone.style.background = '#f9f9f9';
      });

      if (user_response[idx]) {
        dropZone.textContent = user_response[idx];
        dropZone.dataset.value = user_response[idx];
      }

      this._dropTargets.push(dropZone);

      pairDiv.appendChild(leftDiv);
      pairDiv.appendChild(dropZone);
      this._pairsContainer.appendChild(pairDiv);
    });
  }

  getUserAnswer() {
    return this._dropTargets.map(el => el.dataset.value || "");
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
    if (this._optionsContainer) this._optionsContainer.innerHTML = '';
  }
}

customElements.define('matching-drag-drop', MatchingDragComponent);


/* 


<matching-drag-drop id="match-test" config='{
  "question": "Match the inventors with their inventions.",
  "svg_content": null,
  "img_url": null,
  "pairs": [
    { "left": "Thomas Edison", "right": "Light Bulb" },
    { "left": "Alexander Graham Bell", "right": "Telephone" },
    { "left": "Nikola Tesla", "right": "AC Current" }
  ],
  "distractors": ["Radio", "Steam Engine"],
  "user_response": ["", "", ""]
}'></matching-drag-drop>


function test() {
    const testConfig = {
      question: "Match the inventors with their inventions.",
      svg_content: null,
      img_url: null,
      pairs: [
        { left: "Thomas Edison", right: "Light Bulb" },
        { left: "Alexander Graham Bell", right: "Telephone" },
        { left: "Nikola Tesla", right: "AC Current" }
      ],
      distractors: ["Radio", "Steam Engine"],
      user_response: ["", "", ""]
    };
  
    const el = document.createElement('matching-drag-drop');
    el.setAttribute('id', 'test-matching');
    el.setAttribute('config', JSON.stringify(testConfig));
    document.getElementById("quiz").appendChild(el);
  
    // Log user answer after a delay (simulate wait for interaction)
    setTimeout(() => {
      const answers = el.getUserAnswer();
      console.log("User Answers:", answers);
      alert("User Answers: " + answers);
    }, 5000); // wait 5 seconds for testing drag & drop
  }

test();  


*/
