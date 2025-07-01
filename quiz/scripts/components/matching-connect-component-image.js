class ImagePropertyMatching extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._selectedImage = null;
    this._connections = new Map();
    this._connectionColors = [];
    this._currentColorIndex = 0;
  }

  static get observedAttributes() {
    return ['config'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'config') {
      this._config = JSON.parse(newValue || '{}');
      this.initializeConnections();
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  initializeConnections() {
    this._connectionColors = this._config.validation?.line_colors || 
      ['#FF5733', '#33FF57', '#3357FF', '#F333FF'];
    this._currentColorIndex = 0;
    this._connections = new Map();

    if (Array.isArray(this._config.user_response)) {
      this._config.user_response.forEach(connection => {
        this._connections.set(connection.image_index, {
          property: connection.property,
          color: this.getNextColor()
        });
      });
    }
  }

  getNextColor() {
    const color = this._connectionColors[this._currentColorIndex];
    this._currentColorIndex = 
      (this._currentColorIndex + 1) % this._connectionColors.length;
    return color;
  }

  render() {
    const headings = this._config.column_headings || {
      image: "Image",
      empty: "",
      property: "Properties"
    };

    this.innerHTML = `
      <div class="ipm-question-text">${this._config.question}</div>
      <div class="ipm-table-container">
        <table class="ipm-table">
          <thead>
            <tr>
              <th>${headings.image}</th>
              <th>${headings.empty}</th>
              <th>${headings.property}</th>
            </tr>
          </thead>
          <tbody>
            ${this._config.properties_column?.map((prop, index) => `
              <tr class="ipm-row">
                <td class="ipm-image-cell">
                  ${index < this._config.rows.length ? `
                    <div class="ipm-image-wrapper" data-image-index="${this._config.rows[index].image_index}">
                      ${this._config.rows[index].svg_content || 
                        `<img src="${this._config.rows[index].img_url}" alt="${this._config.rows[index].alt_text || ''}">`}
                    </div>
                  ` : ''}
                </td>
                <td class="ipm-input-cell"></td>
                <td class="ipm-input-cell">
                  <div class="ipm-property" data-property="${prop}">${prop}</div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <svg class="ipm-connections-layer" xmlns="http://www.w3.org/2000/svg"></svg>
      </div>
    `;

    this.addEventListeners();
    this.drawConnections();
  }

  addEventListeners() {
    this.querySelectorAll('.ipm-image-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        const imageIndex = parseInt(wrapper.dataset.imageIndex);
        this.handleImageClick(imageIndex, wrapper);
      });
    });

    this.querySelectorAll('.ipm-property').forEach(prop => {
      prop.addEventListener('click', () => this.handlePropertyClick(prop));
    });
  }

  handleImageClick(imageIndex, wrapper) {
    this.querySelectorAll('.ipm-image-wrapper.selected').forEach(el => {
      el.classList.remove('selected');
    });

    wrapper.classList.add('selected');
    this._selectedImage = imageIndex;
  }

  handlePropertyClick(propertyElement) {
    if (!this._selectedImage) return;

    const property = propertyElement.dataset.property;
    const allowMultiple = this._config.validation?.allow_multiple_connections !== false;

    if (this._connections.has(this._selectedImage)) {
      this._connections.delete(this._selectedImage);
    }

    if (!allowMultiple) {
      for (const [imgIndex, conn] of this._connections) {
        if (conn.property === property) {
          this._connections.delete(imgIndex);
          break;
        }
      }
    }

    this._connections.set(this._selectedImage, {
      property: property,
      color: this.getNextColor()
    });

    this.updateUserResponse();
    this.drawConnections();
    this._selectedImage = null;
    this.querySelector('.ipm-image-wrapper.selected')?.classList.remove('selected');
  }

  drawConnections() {
    const svg = this.querySelector('.ipm-connections-layer');
    svg.innerHTML = '';

    this._connections.forEach((conn, imageIndex) => {
      const imageWrapper = this.querySelector(`.ipm-image-wrapper[data-image-index="${imageIndex}"]`);
      const propertyEl = this.querySelector(`.ipm-property[data-property="${conn.property}"]`);

      if (imageWrapper && propertyEl) {
        const imageRect = imageWrapper.getBoundingClientRect();
        const propRect = propertyEl.getBoundingClientRect();
        const containerRect = svg.getBoundingClientRect();

        const startX = imageRect.right - containerRect.left;
        const startY = imageRect.top + imageRect.height/2 - containerRect.top;
        const endX = propRect.left - containerRect.left;
        const endY = propRect.top + propRect.height/2 - containerRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const curveStrength = Math.min(50, (endX - startX) * 0.3);
        const pathData = `M ${startX} ${startY} 
                         C ${startX + curveStrength} ${startY}, 
                           ${endX - curveStrength} ${endY}, 
                           ${endX} ${endY}`;
        
        line.setAttribute('d', pathData);
        line.setAttribute('stroke', conn.color);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('fill', 'none');
        line.setAttribute('class', 'ipm-connection-line');

        svg.appendChild(line);
      }
    });
  }

  updateUserResponse() {
    this._config.user_response = Array.from(this._connections.entries()).map(([imageIndex, conn]) => ({
      image_index: imageIndex,
      property: conn.property
    }));
    this.setAttribute('config', JSON.stringify(this._config));
  }

  getUserAnswer() {
    return Array.from(this._connections.entries()).map(([imageIndex, conn]) => ({
      image_index: imageIndex,
      property: conn.property
    }));
  }
}


customElements.define('matching-connection-image', ImagePropertyMatching);
