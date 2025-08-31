class SelectQuantities extends HTMLElement {
  constructor() {
      super();
      this._config = {};
      this._userResponse = {};
  }

  static get observedAttributes() {
      return ['config'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'config') {
          this._config = JSON.parse(newValue || '{}');
          this._userResponse = { ...(this._config.user_response || {}) };
          this.render();
      }
  }

  render() {
      const { question, quantities, required_selections } = this._config;

      this.innerHTML = `
          <div class="sq-question">${question}</div>
          <div class="sq-quantities">
              ${quantities.map(qty => {
                  const isCircle = Object.keys(this._userResponse)
                      .find(key => this._userResponse[key] === qty.id) === required_selections[0]?.key;
                  const isSquare = Object.keys(this._userResponse)
                      .find(key => this._userResponse[key] === qty.id) === required_selections[1]?.key;
                  return `
                      <div class="sq-item ${isCircle ? 'circle-selected' : ''} ${isSquare ? 'square-selected' : ''}"
                           data-id="${qty.id}">
                          ${qty.value}
                      </div>
                  `;
              }).join('')}
          </div>
      `;

      this.addEventListeners();
  }

  addEventListeners() {
      const { required_selections } = this._config;
      const items = this.querySelectorAll('.sq-item');

      items.forEach(item => {
          item.addEventListener('click', () => {
              const id = item.dataset.id;

              // Find if already selected
              const existingKey = Object.keys(this._userResponse)
                  .find(key => this._userResponse[key] === id);

              if (existingKey) {
                  // Deselect if clicked again
                  this._userResponse[existingKey] = '';
              } else {
                  // Select in first available slot
                  const emptyKey = required_selections.find(sel => !this._userResponse[sel.key]);
                  if (emptyKey) {
                      this._userResponse[emptyKey.key] = id;
                  } else {
                      // Replace first slot if both are filled
                      this._userResponse[required_selections[0].key] = id;
                  }
              }

              this.render();
              this.emitChange();
          });
      });
  }

  emitChange() {
      this.dispatchEvent(new CustomEvent('input-change', {
          detail: { user_response: this._userResponse }
      }));
  }

  /** REQUIRED by question-wrapper-component.js */
  getUserAnswer() {
      return this._userResponse;
  }
}

customElements.define('select-quantities', SelectQuantities);

/*

    <link rel="stylesheet" href="../styles/select-quantities.css">
    <script src="scripts/components/select-quantities.js"></script>
    <script src="scripts/utils/quiz_evaluators/SelectQuantitiesEvaluator.js"></script>

    <script>
      const config = {
        type: "select_quantities",
        id: "18",
        question: "Select the smallest and largest numbers from the list.",
        quantities: [
          {"id": "1", "value": 12},
          {"id": "2", "value": 45},
          {"id": "3", "value": 7},
          {"id": "4", "value": 28},
          {"id": "5", "value": 33}
        ],
        required_selections: [
          {"label": "Smallest", "key": "smallest"},
          {"label": "Greatest", "key": "greatest"}
        ],
        user_response: {
          "smallest": "3",
          "greatest": ""
        }
      };

      // Dynamically create the component
      const component = document.createElement("select-quantities");
      component.setAttribute("config", JSON.stringify(config));

      // Append it to the body (or any container)
      document.body.appendChild(component);

      // Listen for changes
      component.addEventListener("input-change", e => {
        console.log("Updated response:", e.detail.user_response);
      });
    </script>

*/