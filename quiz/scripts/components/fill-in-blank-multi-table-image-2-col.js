class TableImageFillInTheBlankTwoCol extends HTMLElement {
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
      if (Array.isArray(this._config.user_response)) {
        this._userResponses = [...this._config.user_response];
      } else {
        this._userResponses = this._config.rows?.map(() => "") || [];
      }
    }
  
    render() {
      const headings = this._config.column_headings || {
        image: "Image",
        count: "Answer"
      };
  
      this.innerHTML = `
        <div class="tifib-2c-question-text">${this._config.question}</div>
        <div class="tifib-2c-table-container">
          <table class="tifib-2c-table">
            <thead>
              <tr>
                <th>${headings.image}</th>
                <th>${headings.count}</th>
              </tr>
            </thead>
            <tbody>
              ${this._config.rows?.map((row, index) => `
                <tr>
                  <td class="tifib-2c-image-cell">
                    <div class="tifib-2c-image-wrapper">
                      ${row.svg_content ? row.svg_content :
                        `<img src="${row.img_url}" alt="${row.alt_text || ''}" style="height:38px">`}
                    </div>
                  </td>
                  <td>
                    <input type="text" 
                           class="tifib-2c-input-field" 
                           data-row="${index}" 
                           value="${this._userResponses[index] || ''}"
                           placeholder="${headings.count}">
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
      this.querySelectorAll('.tifib-2c-input-field').forEach(input => {
        input.addEventListener('input', (e) => {
          const rowIndex = parseInt(e.target.dataset.row);
          this._userResponses[rowIndex] = e.target.value;
  
          this.dispatchEvent(new CustomEvent('input-change', {
            detail: {
              user_response: this._userResponses,
              row: rowIndex,
              value: e.target.value
            }
          }));
        });
      });
    }
  
    getUserAnswer() {
      return this._userResponses;
    }
  
    updateConfig() {
      this._config.user_response = this._userResponses;
      this.setAttribute('config', JSON.stringify(this._config));
    }
}
  
customElements.define('table-image-fill-in-the-blank-2-col', TableImageFillInTheBlankTwoCol);
  