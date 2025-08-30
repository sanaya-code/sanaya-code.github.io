class MultiSelectCircle extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._userResponse = [];
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
    this._userResponse = Array.isArray(this._config.user_response)
      ? [...this._config.user_response]
      : [];
  }

  render() {
    const { question, options } = this._config;

    this.innerHTML = `
      <div class="msc-container">
        <div class="msc-question">${question}</div>
        <div class="msc-options">
          ${options
            .map(
              opt => `
                <div class="msc-option ${this._userResponse.includes(opt.id) ? "selected" : ""}" 
                     data-id="${opt.id}">
                  ${opt.text}
                </div>`
            )
            .join("")}
        </div>
      </div>
    `;

    this._attachListeners();
  }

  _attachListeners() {
    const max = this._config.maximum_selections || Infinity;
    this.querySelectorAll(".msc-option").forEach(option => {
      option.addEventListener("click", () => {
        const id = option.dataset.id;

        this._userResponse = this._userResponse.includes(id)
          ? this._userResponse.filter(v => v !== id) // deselect
          : (this._userResponse.length < max
              ? [...this._userResponse, id] // select
              : this._userResponse);

        this.render();
        this.emitChange();
      });
    });
  }

  emitChange() {
    this.dispatchEvent(
      new CustomEvent("input-change", {
        detail: { user_response: this.getUserAnswer() },
      })
    );
  }

  /** Simplified getter */
  getUserAnswer() {
    return this._userResponse;
  }
}

customElements.define("multi-select-circle", MultiSelectCircle);
