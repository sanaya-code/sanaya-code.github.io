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