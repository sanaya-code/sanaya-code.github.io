class CompareImageObjects extends HTMLElement {
  constructor() {
    super();
    this._selectedSide = null;
    this._questionEl = null;
    this._imageHolder = null;
    this._initialized = false;
  }

  static get observedAttributes() { return ['config']; }

  connectedCallback() {
    this.ensureStructure();
    this.renderFromConfig();
  }

  attributeChangedCallback() {
    if (this._initialized) {
      this.renderFromConfig();
    }
  }

  ensureStructure() {
    if (this._initialized) return;
    
    this.innerHTML = `
      <div class="icqt-question-text"></div>
      <div class="icqt-figure-wrapper">
        <div class="icqt-image-holder"></div>
      </div>
    `;
    
    this._questionEl = this.querySelector('.icqt-question-text');
    this._imageHolder = this.querySelector('.icqt-image-holder');
    this._initialized = true;
  }

  renderFromConfig() {
    try {
      const config = JSON.parse(this.getAttribute('config') || {});
      const { question, svg_content, img_url, tick_zones, user_response } = config;

      if (this._questionEl) {
        this._questionEl.textContent = question || '';
      }

      if (this._imageHolder) {
        this._imageHolder.innerHTML = '';

        if (svg_content) {
          this._imageHolder.innerHTML = svg_content;
        } else if (img_url) {
          const img = document.createElement('img');
          img.src = img_url;
          img.alt = 'Comparison image';
          this._imageHolder.appendChild(img);
        }

        Object.entries(tick_zones || {}).forEach(([side, position]) => {
          const box = document.createElement('div');
          box.className = `icqt-tick-box icqt-${position.replace('_', '-')}`;
          box.dataset.side = side;
          
          if (user_response === side) {
            box.classList.add('selected');
            this._selectedSide = side;
          }
          
          box.addEventListener('click', () => this.selectSide(side));
          this._imageHolder.appendChild(box);
        });
      }

    } catch (e) {
      console.error('Error rendering component:', e);
    }
  }

  selectSide(side) {
    if (this._selectedSide === side) return;

    this._selectedSide = side;
    const config = JSON.parse(this.getAttribute('config'));
    config.user_response = side;
    this.setAttribute('config', JSON.stringify(config));

    this.querySelectorAll('.icqt-tick-box').forEach(box => {
      box.classList.toggle('selected', box.dataset.side === side);
    });

    this.dispatchEvent(new CustomEvent('selection-changed', {
      detail: { side }
    }));
  }

  getUserAnswer() {
    return this._selectedSide;
  }
}

customElements.define('compare-image-objects', CompareImageObjects);


/*

<script>
// Function to test the CompareImageObjects component
function testCompareImageObjectsComponent() {
  // Test data
  const testQuestion = {
    "type": "image_compare_quantities_tick",
    "id": "test-002",
    "question": "Tick which side has more objects:",
    "svg_content": `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 150' width='100%'>
        <rect width='100%' height='100%' fill='#e0f7ff' />
        <line x1='150' y1='0' x2='150' y2='150' stroke='black' stroke-width='2' />
        <!-- Left side objects (6 circles) -->
        <ellipse cx='50' cy='30' rx='15' ry='20' fill='white' stroke='#aaa' />
        <ellipse cx='100' cy='30' rx='15' ry='20' fill='white' stroke='#aaa' />
        <ellipse cx='50' cy='75' rx='15' ry='20' fill='white' stroke='#aaa' />
        <ellipse cx='100' cy='75' rx='15' ry='20' fill='white' stroke='#aaa' />
        <ellipse cx='50' cy='120' rx='15' ry='20' fill='white' stroke='#aaa' />
        <ellipse cx='100' cy='120' rx='15' ry='20' fill='white' stroke='#aaa' />
        <!-- Right side objects (2 circles) -->
        <ellipse cx='200' cy='60' rx='15' ry='20' fill='white' stroke='#aaa' />
        <ellipse cx='250' cy='90' rx='15' ry='20' fill='white' stroke='#aaa' />
      </svg>
    `,
    "partition_direction": "vertical",
    "tick_zones": {
      "left": "top_left",
      "right": "top_right"
    },
    "user_response": null,
    "correct_answer": "left",
    "feedback": {
      "correct": "Correct! Left side has more objects.",
      "incorrect": "Incorrect. Left side has more objects."
    },
    "points": 1
  };

  // Create component instance
  const component = document.createElement('compare-image-objects');
  component.setAttribute('config', JSON.stringify(testQuestion));
  
  // Add to DOM
  const container = document.getElementById('test-container') || document.body;
  container.innerHTML = '';
  container.appendChild(component);

  // Log selection changes
  component.addEventListener('selection-changed', (e) => {
    console.log('User selected:', e.detail.side);
  });

  // Test evaluation after 3 seconds (simulating user selection)
  setTimeout(() => {
    // Simulate user selecting the left side
    component.selectSide('left');
    
    // Wait for the selection to be processed
    setTimeout(() => {
      const userAnswer = component.getUserAnswer();
      console.log('User answer:', userAnswer);
      
      // Test with QuizResultEvaluator
      const evaluator = new QuizResultEvaluator([testQuestion], [{ answer: userAnswer }]);
      const result = evaluator.getResultJson();
      console.log('Evaluation result:', result);
      
      alert(`Evaluation complete!\nUser selected: ${userAnswer}\nCorrect answer: ${testQuestion.correct_answer}\nIs correct: ${result.questions[0].isCorrect}`);
    }, 500);
  }, 3000);
}

// Call the test function
testCompareImageObjectsComponent();
</script>


*/