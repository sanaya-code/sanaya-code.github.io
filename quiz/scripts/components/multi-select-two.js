class SelectTwoQuantities extends HTMLElement {
    constructor() {
      super();
      this._config = {};
      this._userResponse = {};
    }
  
    static get observedAttributes() {
      return ["config"];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "config" && newValue) {
        this._setConfig(newValue);
        this.render();
      }
    }
  
    connectedCallback() {
      if (!this.innerHTML.trim() && this.hasAttribute("config")) {
        this._setConfig(this.getAttribute("config"));
        this.render();
      }
    }
  
    _setConfig(configStr) {
      this._config = JSON.parse(configStr);
      // Copy previous user response or start empty
      this._userResponse = { ...this._config.user_response };
    }
  
    render() {
      const { question, quantities } = this._config;
      const { required_selections } = this._config;
  
      this.innerHTML = `
        <div class="stq-container">
          <div class="stq-question">${question}</div>
          <div class="stq-quantities">
            ${quantities
              .map(
                (q) => `
                  <div class="stq-quantity" data-id="${q.id}">
                    ${q.value}
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="stq-instructions">
            ${required_selections
              .map(
                (sel) =>
                  `<div><strong>${sel.label}</strong> → ${sel.highlight_style.type} (${sel.highlight_style.value})</div>`
              )
              .join("")}
          </div>
        </div>
      `;
  
      this._applyHighlights();
      this._attachListeners();
    }
  
    _applyHighlights() {
      const { required_selections } = this._config;
      const quantityEls = this.querySelectorAll(".stq-quantity");
  
      // Reset all highlights first
      quantityEls.forEach((el) => {
        el.className = "stq-quantity";
        el.innerHTML = this._config.quantities.find(
          (q) => q.id === el.dataset.id
        ).value;
      });
  
      // Apply highlights for selected answers
      required_selections.forEach((sel) => {
        const selectedId = this._userResponse[sel.key];
        if (!selectedId) return;
  
        const selectedEl = this.querySelector(
          `.stq-quantity[data-id="${selectedId}"]`
        );
        if (selectedEl) {
          const { type, value } = sel.highlight_style;
          if (type === "color") {
            selectedEl.classList.add(`highlight-color-${value}`);
          } else if (type === "shape") {
            selectedEl.classList.add(`highlight-shape-${value}`);
          } else if (type === "mark" && value === "tick") {
            selectedEl.innerHTML += ` ✓`;
          }
        }
      });
    }
  
    _attachListeners() {
      const { required_selections } = this._config;
      const quantityEls = this.querySelectorAll(".stq-quantity");
  
      quantityEls.forEach((el) => {
        el.addEventListener("click", () => {
          const id = el.dataset.id;
  
          // Find first unfilled slot or toggle if already selected
          let updated = false;
  
          for (const sel of required_selections) {
            if (this._userResponse[sel.key] === id) {
              // deselect this choice
              this._userResponse[sel.key] = "";
              updated = true;
              break;
            }
          }
  
          if (!updated) {
            for (const sel of required_selections) {
              if (!this._userResponse[sel.key]) {
                this._userResponse[sel.key] = id;
                break;
              }
            }
          }
  
          this._applyHighlights();
          this._emitChange();
        });
      });
    }
  
    _emitChange() {
      this.dispatchEvent(
        new CustomEvent("input-change", {
          detail: { user_response: { ...this._userResponse } },
        })
      );
    }
  
    getUserAnswer() {
      return { ...this._userResponse };
    }
  }
  
  customElements.define("select-two-quantities", SelectTwoQuantities);
  