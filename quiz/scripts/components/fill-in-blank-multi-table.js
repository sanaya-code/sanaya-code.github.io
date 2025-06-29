class TableFillInBlankComponent extends HTMLElement {
    constructor() {
      super();
      this._initialized = false;
      this._responses = [];
    }
  
    static get observedAttributes() {
      return ['config'];
    }
  
    connectedCallback() {
      this.setup();
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'config') {
        this.setup();
      }
    }
  
    setup() {
      if (!this._initialized) {
        this.innerHTML = `
          <div class="tabfib-container">
            <h3 class="tabfib-title"></h3>
            <table class="tabfib-table"></table>
          </div>
        `;
        this._titleEl = this.querySelector('.tabfib-title');
        this._tableEl = this.querySelector('.tabfib-table');
        this._initialized = true;
      }
  
      try {
        this._config = JSON.parse(this.getAttribute('config') || '{}');
        this._responses = this._config.user_response || [];
        this.renderTable();
      } catch (err) {
        console.warn("Invalid config:", err);
      }
    }
  
    renderTable() {
      const colLabels = this._config.column_labels || [];
      const rowLabels = this._config.row_labels || [];
      const data = this._config.data || [];
  
      this._titleEl.textContent = this._config.title || '';
      this._tableEl.innerHTML = '';
  
      // Build header
      const thead = document.createElement('thead');
      const headerRow = document.createElement('tr');
      headerRow.innerHTML = `<th></th>`; // top-left empty corner
      colLabels.forEach(label => {
        const th = document.createElement('th');
        th.textContent = label;
        headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      this._tableEl.appendChild(thead);
  
      // Build body
      const tbody = document.createElement('tbody');
      data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        const rowLabel = document.createElement('th');
        rowLabel.textContent = rowLabels[rowIndex] || '';
        tr.appendChild(rowLabel);
  
        row.forEach((cell, colIndex) => {
          const td = document.createElement('td');
  
          if (cell.value === '____') {
            const input = document.createElement('input');
            input.type = 'text';
            input.dataset.row = rowIndex;
            input.dataset.col = colIndex;
            input.value = this._responses?.[rowIndex]?.[colIndex] || '';
            input.className = 'tabfib-input';
            input.addEventListener('input', (e) => {
              this.updateUserResponse(rowIndex, colIndex, e.target.value);
            });
            td.appendChild(input);
          } else {
            td.textContent = cell.value;
          }
  
          tr.appendChild(td);
        });
  
        tbody.appendChild(tr);
      });
  
      this._tableEl.appendChild(tbody);
    }
  
    updateUserResponse(row, col, value) {
      if (!this._responses[row]) this._responses[row] = [];
      this._responses[row][col] = value;
    }
  
    getUserAnswer() {
      // Commit any in-progress input before returning
      const inputs = this.querySelectorAll('.tabfib-input');
      inputs.forEach(input => {
        const row = parseInt(input.dataset.row, 10);
        const col = parseInt(input.dataset.col, 10);
        const value = input.value.trim();
        if (!this._responses[row]) this._responses[row] = [];
        this._responses[row][col] = value;
      });
      return this._responses;
    }
}

    
customElements.define('table-fill-in-the-blank', TableFillInBlankComponent);

/*

<script>
  function testTableFillInBlank() {
    const config = {
      type: "table_fill_in_the_blank",
      id: "T002",
      title: "Complete the Multiplication Table",
      column_labels: ["2", "3", "4"],
      row_labels: ["1", "2", "3"],
      data: [
        [
          { value: "2" },
          { value: "____", correct_answer: "3", acceptable_answers: ["3"] },
          { value: "____", correct_answer: "4", acceptable_answers: ["4"] }
        ],
        [
          { value: "____", correct_answer: "2", acceptable_answers: ["2"] },
          { value: "6" },
          { value: "____", correct_answer: "8", acceptable_answers: ["8"] }
        ],
        [
          { value: "____", correct_answer: "3", acceptable_answers: ["3"] },
          { value: "____", correct_answer: "6", acceptable_answers: ["6"] },
          { value: "12" }
        ]
      ],
      user_response: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
      ],
      case_sensitive: false,
      points: 6,
      scoring_method: "partial",
      feedback: {
        full_credit: "Perfect! All blanks are correctly filled.",
        partial_credit: "Some answers are correct. Review the table.",
        none: "No correct entries. Please try again."
      }
    };

    const el = document.createElement('table-fill-in-the-blank');
    el.setAttribute('config', JSON.stringify(config));
    document.body.appendChild(el);

    // Optional: Log user input after 5 seconds
    setTimeout(() => {
      const responses = el.getUserAnswer();
      console.log("User responses:", responses);
    }, 5000);
  }

  // Call the function to run the test
  testTableFillInBlank();
</script>



*/