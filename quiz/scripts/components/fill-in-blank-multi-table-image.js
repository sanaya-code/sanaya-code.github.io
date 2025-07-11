class TableImageFillInTheBlank extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._userResponses = [];
  }

  static get observedAttributes() {
    return ['config'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'config') {
      this._config = JSON.parse(newValue || '{}');
      this.initializeUserResponses();
      this.render();
    }
  }

  initializeUserResponses() {
    const colCount = this._config.columns || 2;
    if (Array.isArray(this._config.user_response)) {
      this._userResponses = this._config.user_response.map(row => [...row]);
    } else {
      this._userResponses = this._config.rows?.map(() => Array(colCount).fill("")) || [];
    }
  }

  render() {
    const headings = this._config.column_headings || {
      image: "Image",
      count: "Count",
      word: "Number Name"
    };
  
    const columns = this._config.columns || 2;
  
    this.innerHTML = `
      <div class="tifib-question-text">${this._config.question}</div>
      <div class="tifib-table-container">
        <table class="tifib-table">
          <thead>
            <tr>
              <th>${headings.image}</th>
              ${columns >= 1 ? `<th>${headings.count}</th>` : ''}
              ${columns >= 2 ? `<th>${headings.word}</th>` : ''}
            </tr>
          </thead>
          <tbody>
            ${this._config.rows?.map((row, index) => `
              <tr>
                <td class="tifib-image-cell">
                  <div class="tifib-image-wrapper">
                    ${row.svg_content ? row.svg_content : 
                      `<img src="${row.img_url}" alt="${row.alt_text || ''}" style="height:38px">`}
                  </div>
                </td>
  
                ${columns >= 1 ? `
                <td>
                  <input type="text" 
                         class="tifib-input-field" 
                         data-row="${index}" 
                         data-col="0"
                         value="${this._userResponses[index]?.[0] || ''}"
                         placeholder="${headings.count}">
                </td>` : ''}
  
                ${columns >= 2 ? `
                <td>
                  <input type="text" 
                         class="tifib-input-field" 
                         data-row="${index}" 
                         data-col="1"
                         ${columns < 3 ? 'disabled' : ''}
                         value="${this._userResponses[index]?.[1] || ''}"
                         placeholder="${headings.word}">
                </td>` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  
    this.addEventListeners();
  }
  

  addEventListeners() {
    this.querySelectorAll('.tifib-input-field').forEach(input => {
      input.addEventListener('input', (e) => {
        const rowIndex = parseInt(e.target.dataset.row);
        const colIndex = parseInt(e.target.dataset.col);
        
        // Initialize row if not exists
        if (!this._userResponses[rowIndex]) {
          this._userResponses[rowIndex] = ['', ''];
        }
        
        // Update the value
        this._userResponses[rowIndex][colIndex] = e.target.value;
        
        this.dispatchEvent(new CustomEvent('input-change', {
          detail: { 
            user_response: this._userResponses,
            row: rowIndex,
            col: colIndex,
            value: e.target.value
          }
        }));
      });
    });
  }

  getUserAnswer() {
    return this._userResponses;
  }

  // Optional: Update the config with current responses
  updateConfig() {
    this._config.user_response = this._userResponses;
    this.setAttribute('config', JSON.stringify(this._config));
  }
}

customElements.define('table-image-fill-in-the-blank', TableImageFillInTheBlank);


/*


<script>
      // Function to test the TableImageFillInTheBlank component
      function testTableImageFillInBlankComponent() {
        // Test data
        const testQuestion = {
          "type": "table_image_fill_in_the_blank",
          "id": "test-001",
          "question": "Complete the table with counts and number names:",
          "column_headings": {
            "image": "Visual",
            "count": "Count (Digit)",
            "word": "Number Name"
          },
          "rows": [
            {
              "svg_content": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 38' preserveAspectRatio='xMidYMid meet'><rect width='300' height='38' fill='#f9f9f9'/><circle cx='30' cy='19' r='12' fill='#ff5252' stroke='#d32f2f'/><circle cx='90' cy='19' r='12' fill='#ff5252' stroke='#d32f2f'/><circle cx='150' cy='19' r='12' fill='#ff5252' stroke='#d32f2f'/><circle cx='210' cy='19' r='12' fill='#ff5252' stroke='#d32f2f'/><circle cx='270' cy='19' r='12' fill='#ff5252' stroke='#d32f2f'/></svg>",
              "alt_text": "Five apples",
              "field1": {"acceptable_answers": ["5"]},
              "field2": {"acceptable_answers": ["five"]}
            },
            {
              "svg_content": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 38' preserveAspectRatio='xMidYMid meet'><rect width='300' height='38' fill='#f9f9f9'/><path d='M30,28 L90,28 L90,8 L120,8 L120,28 L180,28' fill='#8d6e63' stroke='#5d4037'/><path d='M120,28 L180,28 L180,8 L210,8 L210,28 L270,28' fill='#8d6e63' stroke='#5d4037'/></svg>",
              "alt_text": "Two chairs",
              "field1": {"acceptable_answers": ["2"]},
              "field2": {"acceptable_answers": ["two"]}
            }
          ],
          "user_response": [
            ["5", "five"],
            ["", ""]
          ],
          "validation": {
            "case_sensitive": false,
            "scoring_method": "partial"
          }
        };
      
        // Create component instance
        const component = document.createElement('table-image-fill-in-the-blank');
        component.setAttribute('config', JSON.stringify(testQuestion));
        
        // Add to DOM
        const container = document.getElementById('test-container') || document.body;
        container.innerHTML = '';
        container.appendChild(component);
      
        // Log user responses when they change
        component.addEventListener('input-change', (e) => {
          console.log('User response updated:', e.detail.user_response);
        });
      }
      
      // Call the test function
      testTableImageFillInBlankComponent();
      </script>


*/
