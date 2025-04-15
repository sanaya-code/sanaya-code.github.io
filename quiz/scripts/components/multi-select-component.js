class MultiSelectComponent extends HTMLElement {
  constructor() {
    super();
    this.optionsRendered = false;
  }

  connectedCallback() {
    this.ensureStructure();
    this.updateFromConfig();
  }

  static get observedAttributes() {
    return ['config'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'config') {
      this.ensureStructure();
      this.updateFromConfig();
    }
  }

  ensureStructure() {
    if (!this.container) {
      this.innerHTML = `
        <div class="question-type" style="display: block;">
          <div class="question-text"></div>
          <div class="svg-figure" style="display: none;"></div>
          <div class="figure" style="display: none;"></div>
          <div class="options-container"></div>
        </div>
      `;
      this.container = this.querySelector('.question-type');
      this.questionText = this.querySelector('.question-text');
      this.svgFigure = this.querySelector('.svg-figure');
      this.imageFigure = this.querySelector('.figure');
      this.optionsContainer = this.querySelector('.options-container');
    }
  }

  updateFromConfig() {
    const configStr = this.getAttribute('config');
    if (!configStr) return;

    try {
      const config = JSON.parse(configStr);

      this.config = config;

      this.addQunStatement(config);
      this.addSvg(config);
      this.addImg(config);
      this.renderOptions(config);
      this.updateUserResponse(config);
    } catch (err) {
      console.error('Invalid config JSON in <multi-select>: ', err);
    }
  }

  renderOptions(config) {
    this.optionsContainer.innerHTML = '';
    if (Array.isArray(config.options)) {
      config.options.forEach(opt => this.addOption(opt));
      this.optionsRendered = true;
    }
  }

  addOption(opt) {
    const optionHTML = `
      <div class="option">
        <input type="checkbox" 
               name="multi-select" 
               id="multi-${opt.id}" 
               value="${opt.id}" 
        >
        <label for="multi-${opt.id}">${opt.text}</label>
      </div>
    `;
    this.optionsContainer.insertAdjacentHTML('beforeend', optionHTML);
  }

  addQunStatement(config) {
    this.questionText.textContent = config.question || '';
  }

  addImg(config) {
    if (config.img_url) {
      this.imageFigure.innerHTML = `<img src="${config.img_url}" alt="figure image">`;
      this.imageFigure.style.display = 'block';
    } else {
      this.imageFigure.style.display = 'none';
      this.imageFigure.innerHTML = '';
    }
  }

  addSvg(config) {
    if (config.svg_content) {
      this.svgFigure.innerHTML = config.svg_content;
      this.svgFigure.style.display = 'block';
    } else {
      this.svgFigure.style.display = 'none';
      this.svgFigure.innerHTML = '';
    }
  }

  updateUserResponse(config) {
    const selected = config.user_response;

    if (!this.optionsRendered || !Array.isArray(selected)) return;

    const checkboxes = this.optionsContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = selected.includes(cb.value);
    });
  }

  getUserAnswer() {
    const selected = [];
    const checkboxes = this.optionsContainer.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(cb => selected.push(cb.value));
    return selected;
  }

  disconnectedCallback() {
    this.innerHTML = '';
    this.optionsRendered = false;
  }
}

customElements.define('multi-select', MultiSelectComponent);


/*

<multi-select
  config='{
    "question": "Which of the following are programming languages?",
    "svg_content": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 130 130\"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }.line-blue { stroke: blue; stroke-width: 1.5; fill: none; }.point { font-family: Arial; font-size: 10px; font-weight: bold; }.angle-fill { fill: rgba(100,200,255,0.3); stroke: none; }.point-marker { fill: red; r: 2; }.angle-label { font-size: 10px; }</style><path class=\"angle-fill\" d=\"M 10 110 L 90 110 L 79.28 70 Z\"/><path class=\"angle-fill\" d=\"M 10 110 L 79.28 70 L 50 40.72 Z\"/><line x1=\"10\" y1=\"110\" x2=\"90\" y2=\"110\" class=\"line\"/><line x1=\"10\" y1=\"110\" x2=\"79.28\" y2=\"70\" class=\"line-blue\"/><line x1=\"10\" y1=\"110\" x2=\"50\" y2=\"40.72\" class=\"line\"/><circle cx=\"10\" cy=\"110\" r=\"2\" class=\"point-marker\"/><text x=\"05\" y=\"120\" class=\"point\">O</text><circle cx=\"90\" cy=\"110\" r=\"2\" class=\"point-marker\"/><text x=\"93\" y=\"113\" class=\"point\">C</text><circle cx=\"79.28\" cy=\"70\" r=\"2\" class=\"point-marker\"/><text x=\"82.28\" y=\"73\" class=\"point\">B</text><circle cx=\"50\" cy=\"40.72\" r=\"2\" class=\"point-marker\"/><text x=\"53\" y=\"43.72\" class=\"point\">A</text><text x=\"50\" y=\"100\" class=\"angle-label\">15°</text></svg>",
    "img_url": "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",       
    "options": [
        { "id": "A", "text": "Python", "correct": true },
        { "id": "B", "text": "HTML", "correct": false },
        { "id": "C", "text": "Java", "correct": true },
        { "id": "D", "text": "CSS", "correct": false }
    ],
    "user_response": ["A", "C"]
  }'>
</multi-select>


function test() {
    // Create the <multi-select> element
    const multiSelect = document.createElement('multi-select');

    // Build config object
    const config = {
      question: "Which of the following are programming languages?",
      svg_content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }.line-blue { stroke: blue; stroke-width: 1.5; fill: none; }.point { font-family: Arial; font-size: 10px; font-weight: bold; }.angle-fill { fill: rgba(100,200,255,0.3); stroke: none; }.point-marker { fill: red; r: 2; }.angle-label { font-size: 10px; }</style><path class="angle-fill" d="M 10 110 L 90 110 L 79.28 70 Z"/><path class="angle-fill" d="M 10 110 L 79.28 70 L 50 40.72 Z"/><line x1="10" y1="110" x2="90" y2="110" class="line"/><line x1="10" y1="110" x2="79.28" y2="70" class="line-blue"/><line x1="10" y1="110" x2="50" y2="40.72" class="line"/><circle cx="10" cy="110" r="2" class="point-marker"/><text x="05" y="120" class="point">O</text><circle cx="90" cy="110" r="2" class="point-marker"/><text x="93" y="113" class="point">C</text><circle cx="79.28" cy="70" r="2" class="point-marker"/><text x="82.28" y="73" class="point">B</text><circle cx="50" cy="40.72" r="2" class="point-marker"/><text x="53" y="43.72" class="point">A</text><text x="50" y="100" class="angle-label">15°</text></svg>`,
      img_url: "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
      options: [
        { id: "A", text: "Python", correct: true },
        { id: "B", text: "HTML", correct: false },
        { id: "C", text: "Java", correct: true },
        { id: "D", text: "CSS", correct: false }
      ],
      user_response: ["A", "C"]
    };

    // Set the config as an attribute (as string)
    multiSelect.setAttribute('config', JSON.stringify(config));

    // Add to the page
    document.getElementById("quiz").appendChild(multiSelect);

    // Test getting the answer after user selects
    setTimeout(() => {
      const answer = multiSelect.getUserAnswer();
      console.log("User selected options:", answer);
    }, 5000); // waits 5 seconds before checking selected options
  }

  // Run the test
  test();


*/