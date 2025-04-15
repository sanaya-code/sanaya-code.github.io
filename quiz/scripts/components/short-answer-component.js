class ShortAnswerComponent extends HTMLElement {
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
    if (name === 'config') {
      this.createStructure();
      this.updateFromConfig();
    }
  }

  createStructure() {
    if (this._initialized) return;

    this.innerHTML = `
      <div class="question-type" style="display: block;">
        <div class="question-text"></div>
        <div class="svg-figure" style="display: none;"></div>
        <div class="figure" style="display: none;"></div>
        <div class="short-answer-container">
          <textarea class="text-answer" placeholder="Type your answer here" rows="4"></textarea>
        </div>
      </div>
    `;

    this.questionEl = this.querySelector('.question-text');
    this.svgEl = this.querySelector('.svg-figure');
    this.imgEl = this.querySelector('.figure');
    this.textarea = this.querySelector('.text-answer');

    this._initialized = true;
  }

  updateFromConfig() {
    try {
      const config = JSON.parse(this.getAttribute('config') || '{}');
      const { question, svg_content, img_url, user_response } = config;

      this.addQunStatement(question);
      this.addSvg(svg_content);
      this.addImg(img_url);

      if (this.textarea) {
        this.textarea.value = user_response || '';
      }

    } catch (e) {
      console.error('Invalid config JSON in <short-answer>', e);
    }
  }

  addImg(img_url) {
    if (img_url) {
      this.imgEl.innerHTML = `<img src="${img_url}" alt="Figure" style="max-width: 100%;">`;
      this.imgEl.style.display = '';
    } else {
      this.imgEl.innerHTML = '';
      this.imgEl.style.display = 'none';
    }
  }

  addSvg(svg_content) {
    if (svg_content) {
      this.svgEl.innerHTML = svg_content;
      this.svgEl.style.display = '';
    } else {
      this.svgEl.innerHTML = '';
      this.svgEl.style.display = 'none';
    }
  }

  addQunStatement(question) {
    this.questionEl.textContent = question || '';
  }

  getUserAnswer() {
    return this.textarea?.value || '';
  }

  disconnectedCallback() {
    this.cleanup();
  }

  cleanup() {
    this.innerHTML = '';
    this._initialized = false;
  }
}

customElements.define('short-answer', ShortAnswerComponent);


/*

<short-answer
  config='{
    "question": "Explain the greenhouse effect in brief.",
    "svg_content": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 130 130\"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }.line-blue { stroke: blue; stroke-width: 1.5; fill: none; }.point { font-family: Arial; font-size: 10px; font-weight: bold; }.angle-fill { fill: rgba(100,200,255,0.3); stroke: none; }.point-marker { fill: red; r: 2; }.angle-label { font-size: 10px; }</style><path class=\"angle-fill\" d=\"M 10 110 L 90 110 L 79.28 70 Z\"/><path class=\"angle-fill\" d=\"M 10 110 L 79.28 70 L 50 40.72 Z\"/><line x1=\"10\" y1=\"110\" x2=\"90\" y2=\"110\" class=\"line\"/><line x1=\"10\" y1=\"110\" x2=\"79.28\" y2=\"70\" class=\"line-blue\"/><line x1=\"10\" y1=\"110\" x2=\"50\" y2=\"40.72\" class=\"line\"/><circle cx=\"10\" cy=\"110\" r=\"2\" class=\"point-marker\"/><text x=\"05\" y=\"120\" class=\"point\">O</text><circle cx=\"90\" cy=\"110\" r=\"2\" class=\"point-marker\"/><text x=\"93\" y=\"113\" class=\"point\">C</text><circle cx=\"79.28\" cy=\"70\" r=\"2\" class=\"point-marker\"/><text x=\"82.28\" y=\"73\" class=\"point\">B</text><circle cx=\"50\" cy=\"40.72\" r=\"2\" class=\"point-marker\"/><text x=\"53\" y=\"43.72\" class=\"point\">A</text><text x=\"50\" y=\"100\" class=\"angle-label\">15°</text></svg>",
    "img_url": "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
    "user_response": "It traps heat in the atmosphere."
  }'>
</short-answer>


function test() {
    const shortAnswer = document.createElement('short-answer');
  
    const config = {
      question: "Explain the greenhouse effect in brief.",
      svg_content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }.line-blue { stroke: blue; stroke-width: 1.5; fill: none; }.point { font-family: Arial; font-size: 10px; font-weight: bold; }.angle-fill { fill: rgba(100,200,255,0.3); stroke: none; }.point-marker { fill: red; r: 2; }.angle-label { font-size: 10px; }</style><path class="angle-fill" d="M 10 110 L 90 110 L 79.28 70 Z"/><path class="angle-fill" d="M 10 110 L 79.28 70 L 50 40.72 Z"/><line x1="10" y1="110" x2="90" y2="110" class="line"/><line x1="10" y1="110" x2="79.28" y2="70" class="line-blue"/><line x1="10" y1="110" x2="50" y2="40.72" class="line"/><circle cx="10" cy="110" r="2" class="point-marker"/><text x="05" y="120" class="point">O</text><circle cx="90" cy="110" r="2" class="point-marker"/><text x="93" y="113" class="point">C</text><circle cx="79.28" cy="70" r="2" class="point-marker"/><text x="82.28" y="73" class="point">B</text><circle cx="50" cy="40.72" r="2" class="point-marker"/><text x="53" y="43.72" class="point">A</text><text x="50" y="100" class="angle-label">15°</text></svg>`,
      img_url: "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
      user_response: "It traps heat in the atmosphere."
    };
  
    shortAnswer.setAttribute('config', JSON.stringify(config));
  
    document.getElementById("quiz").appendChild(shortAnswer);
  
    // Log the answer after a delay
    setTimeout(() => {
      console.log("User Answer:", shortAnswer.getUserAnswer());
    }, 5000);
}

test();



*/