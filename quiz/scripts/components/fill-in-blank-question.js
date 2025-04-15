class FillInBlankComponent extends HTMLElement {
  constructor() {
    super();
    this._initialized = false;
  }

  static get observedAttributes() {
    return ['config'];
  }

  connectedCallback() {
    this.createStructure();
    this.updateFromConfig();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.createStructure();
    if (name === 'config') {
      this.updateFromConfig();
    }
  }

  createStructure() {
    if (this._initialized) return;

    this.innerHTML = `
      <div class="question-type fill-question">
        <div class="question-text"></div>
        <div class="svg-figure" style="display: none;"></div>
        <div class="figure" style="display: none;"></div>
        <div class="fill-blank-container">
          <input type="text" class="text-answer" placeholder="Type your answer here">
        </div>
      </div>
    `;

    this._questionEl = this.querySelector('.question-text');
    this._svgEl = this.querySelector('.svg-figure');
    this._figureEl = this.querySelector('.figure');
    this._answerInput = this.querySelector('.text-answer');

    this._initialized = true;
  }

  updateFromConfig() {
    let config = {};
    try {
      config = JSON.parse(this.getAttribute('config') || '{}');
    } catch (e) {
      console.warn('Invalid config JSON:', e);
      return;
    }

    this.addQunStatement(config);
    this.addSvg(config);
    this.addImg(config);

    if (this._answerInput) {
      this._answerInput.value = config.user_response || '';
    }
  }

  addQunStatement(config) {
    this._questionEl.textContent = config.question;
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

  addSvg(config) {
    if (config.svg_content) {
      this._svgEl.style.display = '';
      this._svgEl.innerHTML = config.svg_content;
    } else {
      this._svgEl.style.display = 'none';
      this._svgEl.innerHTML = '';
    }
  }

  getUserAnswer() {
    return this._answerInput ? this._answerInput.value : '';
  }

  disconnectedCallback() {
    this.cleanup();
  }

  cleanup() {
    this.innerHTML = '';
    this._initialized = false;
    this._questionEl = null;
    this._svgEl = null;
    this._figureEl = null;
    this._answerInput = null;
  }
}

customElements.define('fill-in-blank', FillInBlankComponent);



/*

<fill-in-blank
  config='{
    "question": "Name the largest ocean on Earth.",
    "svg_content": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 130 130\"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }.line-blue { stroke: blue; stroke-width: 1.5; fill: none; }.point { font-family: Arial; font-size: 10px; font-weight: bold; }.angle-fill { fill: rgba(100,200,255,0.3); stroke: none; }.point-marker { fill: red; r: 2; }.angle-label { font-size: 10px; }</style><path class=\"angle-fill\" d=\"M 10 110 L 90 110 L 79.28 70 Z\"/><path class=\"angle-fill\" d=\"M 10 110 L 79.28 70 L 50 40.72 Z\"/><line x1=\"10\" y1=\"110\" x2=\"90\" y2=\"110\" class=\"line\"/><line x1=\"10\" y1=\"110\" x2=\"79.28\" y2=\"70\" class=\"line-blue\"/><line x1=\"10\" y1=\"110\" x2=\"50\" y2=\"40.72\" class=\"line\"/><circle cx=\"10\" cy=\"110\" r=\"2\" class=\"point-marker\"/><text x=\"05\" y=\"120\" class=\"point\">O</text><circle cx=\"90\" cy=\"110\" r=\"2\" class=\"point-marker\"/><text x=\"93\" y=\"113\" class=\"point\">C</text><circle cx=\"79.28\" cy=\"70\" r=\"2\" class=\"point-marker\"/><text x=\"82.28\" y=\"73\" class=\"point\">B</text><circle cx=\"50\" cy=\"40.72\" r=\"2\" class=\"point-marker\"/><text x=\"53\" y=\"43.72\" class=\"point\">A</text><text x=\"50\" y=\"100\" class=\"angle-label\">15°</text></svg>",
    "img_url": "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
    "user_response": "Pacific"
  }'>
</fill-in-blank>

function test() {
    const fillBlankEl = document.createElement('fill-in-blank');
  
    const configObj = {
      question: "Name the largest ocean on Earth.",
      svg_content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }.line-blue { stroke: blue; stroke-width: 1.5; fill: none; }.point { font-family: Arial; font-size: 10px; font-weight: bold; }.angle-fill { fill: rgba(100,200,255,0.3); stroke: none; }.point-marker { fill: red; r: 2; }.angle-label { font-size: 10px; }</style><path class="angle-fill" d="M 10 110 L 90 110 L 79.28 70 Z"/><path class="angle-fill" d="M 10 110 L 79.28 70 L 50 40.72 Z"/><line x1="10" y1="110" x2="90" y2="110" class="line"/><line x1="10" y1="110" x2="79.28" y2="70" class="line-blue"/><line x1="10" y1="110" x2="50" y2="40.72" class="line"/><circle cx="10" cy="110" r="2" class="point-marker"/><text x="05" y="120" class="point">O</text><circle cx="90" cy="110" r="2" class="point-marker"/><text x="93" y="113" class="point">C</text><circle cx="79.28" cy="70" r="2" class="point-marker"/><text x="82.28" y="73" class="point">B</text><circle cx="50" cy="40.72" r="2" class="point-marker"/><text x="53" y="43.72" class="point">A</text><text x="50" y="100" class="angle-label">15°</text></svg>`,
      img_url: "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
      user_response: "Pacific"
    };
  
    fillBlankEl.setAttribute('config', JSON.stringify(configObj));
    document.getElementById("quiz").appendChild(fillBlankEl);
  
    setTimeout(() => {
      const userAnswer = fillBlankEl.getUserAnswer();
      console.log("User's answer is:", userAnswer);
    }, 5000);
  }
  
  test();
  



*/