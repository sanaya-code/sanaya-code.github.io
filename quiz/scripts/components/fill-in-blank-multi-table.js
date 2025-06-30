class TableFillInTheBlankComponent extends HTMLElement {
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

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'config') {
      this.setup();
    }
  }

  setup() {
    if (!this._initialized) {
      this.innerHTML = `
        <div class="tabfib-container">
          <div class="tabfib-question-text"></div>
          <div class="tabfib-svg-figure" style="display: none;"></div>
          <div class="tabfib-figure" style="display: none;"></div>
          <table class="tabfib-table"></table>
        </div>
      `;
      this._questionEl = this.querySelector('.tabfib-question-text');
      this._svgEl = this.querySelector('.tabfib-svg-figure');
      this._figureEl = this.querySelector('.tabfib-figure');
      this._tableEl = this.querySelector('.tabfib-table');
      this._initialized = true;
    }

    try {
      this._config = JSON.parse(this.getAttribute('config') || '{}');
      this._responses = this._cloneResponse(this._config.user_response || []);
      this.render();
    } catch (err) {
      console.warn('Invalid config:', err);
    }
  }

  _cloneResponse(response) {
    const data = this._config?.data || [];
  
    return data.map((row, rowIndex) =>
      row.map((_, colIndex) => {
        const resRow = Array.isArray(response[rowIndex]) ? response[rowIndex] : [];
        return resRow[colIndex] || '';
      })
    );
  }
  

  render() {
    this._questionEl.textContent = this._config.question || '';
    this.addSvg(this._config);
    this.addImg(this._config);
    this.renderTable();
  }

  renderTable() {
    const data = this._config.data || [];
    const rowLabels = this._config.row_labels || [];
    const colLabels = this._config.column_labels || [];

    this._tableEl.innerHTML = '';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    headRow.appendChild(document.createElement('th')); // empty corner
    colLabels.forEach(label => {
      const th = document.createElement('th');
      th.textContent = label;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    this._tableEl.appendChild(thead);

    const tbody = document.createElement('tbody');

    data.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      const rowLabel = document.createElement('td');
      rowLabel.textContent = rowLabels[rowIndex] || '';
      tr.appendChild(rowLabel);

      row.forEach((cell, colIndex) => {
        const td = document.createElement('td');
        if (cell.value === '____') {
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'tabfib-input';
          input.dataset.row = rowIndex;
          input.dataset.col = colIndex;
          input.value = this._responses?.[rowIndex]?.[colIndex] || '';
          input.addEventListener('input', () => {
            const r = parseInt(input.dataset.row, 10);
            const c = parseInt(input.dataset.col, 10);
            this._responses[r][c] = input.value;
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

  getUserAnswer() {
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

  addSvg(config) {
    if (config.svg_content) {
      this._svgEl.style.display = '';
      this._svgEl.innerHTML = config.svg_content;
    } else {
      this._svgEl.style.display = 'none';
      this._svgEl.innerHTML = '';
    }
  }

  addImg(config) {
    if (config.img_url) {
      this._figureEl.style.display = '';
      this._figureEl.innerHTML = `<img src="${config.img_url}" alt="figure" />`;
    } else {
      this._figureEl.style.display = 'none';
      this._figureEl.innerHTML = '';
    }
  }
}

customElements.define('table-fill-in-the-blank', TableFillInTheBlankComponent);


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