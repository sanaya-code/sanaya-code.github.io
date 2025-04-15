class OrderingComponent extends HTMLElement {

  constructor() {
    super();
    this.currentDraggedItem = null;
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
    this.innerHTML = `
      <div class="question-type" style="display: block;">
        <div class="question-text"></div>
        <div class="svg-figure" style="display: flex;"></div>
        <div class="figure" style="display: flex;"></div>
        <div class="ordering-container"></div>
      </div>
    `;

    this._questionTextEl = this.querySelector('.question-text');
    this._svgFigureEl = this.querySelector('.svg-figure');
    this._imageFigureEl = this.querySelector('.figure');
    this._itemsContainerEl = this.querySelector('.ordering-container');
  }

  updateFromConfig() {
    const config = JSON.parse(this.getAttribute('config'));

    this.addQunStatement(config.question);
    this.addSvg(config.svg_content);
    this.addImg(config.img_url);

    this.addAllItems(config);

    if (Array.isArray(config.user_response)) {
      this.setAnswer(config.user_response);
    }
  }

  addQunStatement(question) {
    this._questionTextEl.textContent = question || '';
  }

  addSvg(svg_content) {
    if (svg_content) {
      this._svgFigureEl.style.display = 'flex';
      this._svgFigureEl.innerHTML = svg_content;
    } else {
      this._svgFigureEl.style.display = 'none';
      this._svgFigureEl.innerHTML = '';
    }
  }

  addImg(img_url) {
    if (img_url) {
      this._imageFigureEl.style.display = 'flex';
      this._imageFigureEl.innerHTML = `<img src="${img_url}" alt="figure" />`;
    } else {
      this._imageFigureEl.style.display = 'none';
      this._imageFigureEl.innerHTML = '';
    }
  }

  addAllItems(config) {
    this._itemsContainerEl.innerHTML = '';
    if (Array.isArray(config.items)) {
      config.items.forEach(item => {
        this.addItem(item.id, item.text);
      });
    }
  }

  addItem(item_id, item_text) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'ordering-item';
    itemDiv.draggable = true;
    itemDiv.dataset.id = item_id;
    itemDiv.textContent = item_text;

    itemDiv.addEventListener('dragstart', this.handleDragStart.bind(this));
    itemDiv.addEventListener('dragover', this.handleDragOver.bind(this));
    itemDiv.addEventListener('drop', this.handleDrop.bind(this));
    itemDiv.addEventListener('dragend', this.handleDragEnd.bind(this));

    this._itemsContainerEl.appendChild(itemDiv);
  }

  setAnswer(orderedIds) {
    const idToItem = {};
    Array.from(this._itemsContainerEl.children).forEach(item => {
      idToItem[item.dataset.id] = item;
    });

    this._itemsContainerEl.innerHTML = '';

    orderedIds.forEach(id => {
      if (idToItem[id]) {
        this._itemsContainerEl.appendChild(idToItem[id]);
      }
    });
  }

  getUserAnswer() {
    return Array.from(this._itemsContainerEl.children).map(item => item.dataset.id);
  }

  cleanup() {
    this.innerHTML = '';
    this._questionTextEl = null;
    this._svgFigureEl = null;
    this._imageFigureEl = null;
    this._itemsContainerEl = null;
    this.currentDraggedItem = null;
  }

  handleDragStart(e) {
    this.currentDraggedItem = e.target;
    e.dataTransfer.effectAllowed = 'move';
    e.target.classList.add('dragging');
  }

  handleDragOver(e) {
    e.preventDefault();
    const target = e.target.closest('.ordering-item');
    if (!target || target === this.currentDraggedItem) return;

    const bounding = target.getBoundingClientRect();
    const offset = e.clientY - bounding.top;

    const insertBefore = offset < bounding.height / 2;
    const container = this._itemsContainerEl;

    if (insertBefore) {
      container.insertBefore(this.currentDraggedItem, target);
    } else {
      container.insertBefore(this.currentDraggedItem, target.nextSibling);
    }
  }

  handleDrop(e) {
    e.preventDefault();
  }

  handleDragEnd(e) {
    e.target.classList.remove('dragging');
    this.currentDraggedItem = null;
  }
}

customElements.define('ordering-drag-drop', OrderingComponent);


  /* 
  
  <ordering-drag-drop
  config='{
    "question": "Arrange the historical events in the correct order.",
    "svg_content": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 130 130\"><style>.line { stroke: black; stroke-width: 1.5; fill: none; } .line-blue { stroke: blue; stroke-width: 1.5; fill: none; } .point { font-family: Arial; font-size: 10px; font-weight: bold; } .angle-fill { fill: rgba(100,200,255,0.3); stroke: none; } .point-marker { fill: red; r: 2; } .angle-label { font-size: 10px; }</style><path class=\"angle-fill\" d=\"M 10 110 L 90 110 L 79.28 70 Z\"/><path class=\"angle-fill\" d=\"M 10 110 L 79.28 70 L 50 40.72 Z\"/><line x1=\"10\" y1=\"110\" x2=\"90\" y2=\"110\" class=\"line\"/><line x1=\"10\" y1=\"110\" x2=\"79.28\" y2=\"70\" class=\"line-blue\"/><line x1=\"10\" y1=\"110\" x2=\"50\" y2=\"40.72\" class=\"line\"/><circle cx=\"10\" cy=\"110\" r=\"2\" class=\"point-marker\"/><text x=\"05\" y=\"120\" class=\"point\">O</text><circle cx=\"90\" cy=\"110\" r=\"2\" class=\"point-marker\"/><text x=\"93\" y=\"113\" class=\"point\">C</text><circle cx=\"79.28\" cy=\"70\" r=\"2\" class=\"point-marker\"/><text x=\"82.28\" y=\"73\" class=\"point\">B</text><circle cx=\"50\" cy=\"40.72\" r=\"2\" class=\"point-marker\"/><text x=\"53\" y=\"43.72\" class=\"point\">A</text><text x=\"50\" y=\"100\" class=\"angle-label\">15°</text></svg>",
    "img_url": "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
    "items": [
      { "id": "A", "text": "World War II" },
      { "id": "B", "text": "American Civil War" },
      { "id": "C", "text": "French Revolution" },
      { "id": "D", "text": "Moon Landing" }
    ],
    "user_response": ["C", "B", "A", "D"]
  }'>
</ordering-drag-drop>


  function test() {
    const orderingEl = document.createElement('ordering-drag-drop');
  
    const sampleConfig = {
      question: 'Arrange the historical events in the correct order:',
      svg_content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><style>.line { stroke: black; stroke-width: 1.5; fill: none; } .line-blue { stroke: blue; stroke-width: 1.5; fill: none; } .point { font-family: Arial; font-size: 10px; font-weight: bold; } .angle-fill { fill: rgba(100,200,255,0.3); stroke: none; } .point-marker { fill: red; r: 2; } .angle-label { font-size: 10px; }</style><path class="angle-fill" d="M 10 110 L 90 110 L 79.28 70 Z"/><path class="angle-fill" d="M 10 110 L 79.28 70 L 50 40.72 Z"/><line x1="10" y1="110" x2="90" y2="110" class="line"/><line x1="10" y1="110" x2="79.28" y2="70" class="line-blue"/><line x1="10" y1="110" x2="50" y2="40.72" class="line"/><circle cx="10" cy="110" r="2" class="point-marker"/><text x="05" y="120" class="point">O</text><circle cx="90" cy="110" r="2" class="point-marker"/><text x="93" y="113" class="point">C</text><circle cx="79.28" cy="70" r="2" class="point-marker"/><text x="82.28" y="73" class="point">B</text><circle cx="50" cy="40.72" r="2" class="point-marker"/><text x="53" y="43.72" class="point">A</text><text x="50" y="100" class="angle-label">15°</text></svg>`,
      img_url: "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
      items: [
        { id: 'A', text: 'World War II' },
        { id: 'B', text: 'American Civil War' },
        { id: 'C', text: 'French Revolution' },
        { id: 'D', text: 'Moon Landing' }
      ],
      user_response: ['C', 'B', 'A', 'D']
    };
  
    orderingEl.setAttribute('config', JSON.stringify(sampleConfig));
    document.getElementById('quiz').appendChild(orderingEl);
  
    
  }
  
  test();
  
  */