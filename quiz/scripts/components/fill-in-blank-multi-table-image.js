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
    // Initialize user_responses from config or create empty array
    if (Array.isArray(this._config.user_response)) {
      this._userResponses = [...this._config.user_response];
    } else {
      // Create empty responses for each row
      this._userResponses = this._config.rows?.map(() => ['', '']) || [];
    }
  }

  render() {
    const headings = this._config.column_headings || {
      image: "Image",
      count: "Count",
      word: "Number Name"
    };

    this.innerHTML = `
      <div class="tifib-table-container">
        <table class="tifib-table">
          <thead>
            <tr>
              <th>${headings.image}</th>
              <th>${headings.count}</th>
              <th>${headings.word}</th>
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
                <td>
                  <input type="text" 
                         class="tifib-input-field" 
                         data-row="${index}" 
                         data-col="0"
                         value="${this._userResponses[index]?.[0] || ''}"
                         placeholder="${headings.count}">
                </td>
                <td>
                  <input type="text" 
                         class="tifib-input-field" 
                         data-row="${index}" 
                         data-col="1"
                         value="${this._userResponses[index]?.[1] || ''}"
                         placeholder="${headings.word}">
                </td>
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