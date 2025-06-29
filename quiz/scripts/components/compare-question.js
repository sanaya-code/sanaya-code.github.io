class CompareQuantitiesComponent extends HTMLElement {
    constructor() {
        super();
        this._initialized = false;
        this.currentSymbolIndex = 0;
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
        if (this._initialized) return;

        this.innerHTML = `
            <div class="cmp-qq-question-text"></div>
            <div class="cmp-qq-svg-figure" style="display: none;"></div>
            <div class="cmp-qq-figure" style="display: none;"></div>
            <div class="cmp-qq-options-container">
                <div class="cmp-qq-option cmp-qq-quantity cmp-qq-a" ></div>
                <div class="cmp-qq-option cmp-qq-symbol" title="Click to change"></div>
                <div class="cmp-qq-option cmp-qq-quantity cmp-qq-b" ></div>
            </div>
        `;

        this.questionEl = this.querySelector('.cmp-qq-question-text');
        this.svgEl = this.querySelector('.cmp-qq-svg-figure');
        this.imgEl = this.querySelector('.cmp-qq-figure');
        this.quantityAEl = this.querySelector('.cmp-qq-a');
        this.quantityBEl = this.querySelector('.cmp-qq-b');
        this.symbolEl = this.querySelector('.cmp-qq-symbol');

        this.symbolEl.addEventListener('click', () => this.toggleSymbol());

        this._initialized = true;
    }

    updateFromConfig() {
        try {
            this.config = JSON.parse(this.getAttribute('config') || '{}');
            const {
                question,
                svg_content,
                img_url,
                quantity_a,
                quantity_b,
                symbol_options,
                user_response
            } = this.config;

            this.questionEl.textContent = question || '';

            // Handle SVG
            if (svg_content) {
                this.svgEl.innerHTML = svg_content;
                this.svgEl.style.display = '';
            } else {
                this.svgEl.innerHTML = '';
                this.svgEl.style.display = 'none';
            }

            // Handle image
            if (img_url) {
                this.imgEl.innerHTML = `<img src="${img_url}" alt="Figure">`;
                this.imgEl.style.display = '';
            } else {
                this.imgEl.innerHTML = '';
                this.imgEl.style.display = 'none';
            }

            // Render quantities
            this.quantityAEl.innerHTML = `<strong>${quantity_a.label || ''}</strong> ${quantity_a.value} <br><small>${quantity_a.description || ''}</small>`;
            this.quantityBEl.innerHTML = `<strong>${quantity_b.label || ''}</strong> ${quantity_b.value} <br><small>${quantity_b.description || ''}</small>`;

            // Setup symbol
            this.symbolOptions = symbol_options || ['>', '<'];
            this.currentSymbolIndex = this.symbolOptions.indexOf(user_response) !== -1
                ? this.symbolOptions.indexOf(user_response)
                : 0;

            this.symbolEl.textContent = this.symbolOptions[this.currentSymbolIndex];

        } catch (e) {
            console.error('Invalid config JSON in <compare-quantities>', e);
        }
    }

    toggleSymbol() {
        if (!this.symbolOptions || this.symbolOptions.length === 0) return;
        this.currentSymbolIndex = (this.currentSymbolIndex + 1) % this.symbolOptions.length;
        this.symbolEl.textContent = this.symbolOptions[this.currentSymbolIndex];
        this.updateUserResponse();
    }

    updateUserResponse() {
        if (this.config) {
            this.config.user_response = this.symbolOptions[this.currentSymbolIndex];
            this.setAttribute('config', JSON.stringify(this.config));
        }
    }

    getUserAnswer() {
        return this.symbolOptions ? this.symbolOptions[this.currentSymbolIndex] : null;
    }

    disconnectedCallback() {
        this.innerHTML = '';
        this._initialized = false;
    }
}

customElements.define('compare-quantities', CompareQuantitiesComponent);

/*


<script>
  function testCompareQuantitiesComponent() {
    const sampleConfig = {
      type: "compare_quantities",
      id: "006",
      svg_content: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 100'><defs><marker id='arrow' markerWidth='10' markerHeight='7' refX='9' refY='3.5' orient='auto'><polygon points='0 0, 10 3.5, 0 7' fill='black'></polygon></marker><marker id='dot' markerWidth='5' markerHeight='5' refX='2.5' refY='2.5' orient='auto'><circle cx='2.5' cy='2.5' r='2.5' fill='black'></circle></marker></defs><line x1='30' y1='50' x2='70' y2='50' stroke='black' stroke-width='2'></line><circle cx='30' cy='50' r='3' fill='black'></circle><circle cx='70' cy='50' r='3' fill='black'></circle><text x='25' y='50' text-anchor='end' dominant-baseline='middle' font-size='12' fill='black'>A</text><text x='75' y='50' text-anchor='start' dominant-baseline='middle' font-size='12' fill='black'>B</text><line x1='100' y1='30' x2='100' y2='70' stroke='black' stroke-width='2' marker-end='url(#arrow)' marker-start='url(#dot)'></line><line x1='130' y1='50' x2='170' y2='50' stroke='black' stroke-width='2' stroke-dasharray='5,5'></line></svg>",
      img_url: "https://media.baamboozle.com/uploads/images/156912/1647154273_67713.png",
      question: "Click the correct comparison symbol",
      quantity_a: {
        label: "A",
        value: "5",
        description: "Car A's speed"
      },
      quantity_b: {
        label: "B",
        value: "8",
        description: "Car B's speed"
      },
      symbol_options: [">", "<"],
      correct_answer: "<",
      user_response: "",
      explanation: "For most values of x < 3, B (2x+5) is greater than A (3x+2), so A < B.",
      difficulty: "medium",
      tags: ["algebra", "comparison", "quantities"],
      points: 1
    };

    const el = document.createElement('compare-quantities');
    el.setAttribute('config', JSON.stringify(sampleConfig));
    document.body.appendChild(el);
  }

  // Run test
  testCompareQuantitiesComponent();
</script>







*/