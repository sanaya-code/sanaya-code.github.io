class FillInBlankMultiGraph extends HTMLElement {
  constructor() {
    super();
    this._config = {};
    this._responses = [];
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
    if (this.hasAttribute("config")) {
      this._setConfig(this.getAttribute("config"));
      this.render();
    }
  }

  _setConfig(configStr) {
    this._config = JSON.parse(configStr);
    this._responses = Array.isArray(this._config.user_response)
      ? [...this._config.user_response]
      : Array(this._config.blocks.length).fill("");
  }

  render() {
    const { question, center_label, blocks, value_choices } = this._config;

    this.innerHTML = `
      <div class="fibg-container">
        <div class="fibg-question">${question}</div>
        <div class="fibg-graph">
          <div class="fibg-center">${center_label}</div>
          ${blocks
            .map(
              (block, idx) => `
            <div class="fibg-block" data-index="${idx}">
              <span class="fibg-label">${block.a}</span>
              <span class="fibg-operator">${block.b}</span>
              <span class="fibg-selected">${this._responses[idx] || "__"}</span>
            </div>`
            )
            .join("")}
          <svg class="fibg-lines"></svg>
        </div>
        <div class="fibg-choices">
          ${value_choices
            .map(
              val => `<button class="fibg-choice" data-value="${val}">${val}</button>`
            )
            .join("")}
        </div>
      </div>
    `;

    this._positionBlocks();
    this._attachListeners();
  }

  _positionBlocks() {
    const graph = this.querySelector(".fibg-graph");
    const blocks = graph.querySelectorAll(".fibg-block");
    const svg = graph.querySelector(".fibg-lines");
    const radius = 100;
    const angleStep = (2 * Math.PI) / blocks.length;

    const centerX = graph.clientWidth / 2;
    const centerY = graph.clientHeight / 2;

    svg.innerHTML = ""; // clear old lines

    blocks.forEach((block, idx) => {
      const angle = idx * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      block.style.left = `${x - block.offsetWidth / 2}px`;
      block.style.top = `${y - block.offsetHeight / 2}px`;

      // draw a line from center to block
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", centerX);
      line.setAttribute("y1", centerY);
      line.setAttribute("x2", x);
      line.setAttribute("y2", y);
      line.setAttribute("stroke", "#aaa");
      line.setAttribute("stroke-width", "2");
      svg.appendChild(line);
    });
  }

  _attachListeners() {
    const blocks = this.querySelectorAll(".fibg-block");
    const choices = this.querySelectorAll(".fibg-choice");

    let activeIndex = null;

    // Click a block to activate it
    blocks.forEach(block => {
      block.addEventListener("click", () => {
        blocks.forEach(b => b.classList.remove("active"));
        block.classList.add("active");
        activeIndex = parseInt(block.dataset.index);
      });
    });

    // Click a choice to assign value
    choices.forEach(choice => {
      choice.addEventListener("click", () => {
        if (activeIndex === null) return;
        const value = choice.dataset.value;
        this._responses[activeIndex] = value;
        this.render();
        this._emitChange();
      });
    });
  }

  _emitChange() {
    this.dispatchEvent(
      new CustomEvent("input-change", {
        detail: { user_response: this.getUserAnswer() }
      })
    );
  }

  getUserAnswer() {
    return [...this._responses];
  }
}

customElements.define("fill-in-blank-multi-graph", FillInBlankMultiGraph);

/*



<link rel="stylesheet" href="../styles/fill-in-blank-multi-graph.css" />

<fill-in-blank-multi-graph id="practice"></fill-in-blank-multi-graph>

<script src="../scripts/components/fill-in-blank-multi-graph.js"></script>
<script src="../scripts/utils/quiz_evaluators/FillInTheBlankMutiGraph.js"></script>

  <script>
    const config = {
      type: "fill_in_blank_multi_graph",
      id: "001",
      question: "Fill in the blanks to practice addition with 3.",
      center_label: "3",
      blocks: [
        { a: 0, b: "+" },
        { a: 1, b: "+" },
        { a: 2, b: "+" },
        { a: 3, b: "+" }
      ],
      correct_answer: ["3", "4", "5", "6"],
      user_response: ["", "", "", ""]
    };

    const component = document.getElementById("practice");
    component.setAttribute("config", JSON.stringify(config));

    component.addEventListener("input-change", (e) => {
      console.log("User Response:", e.detail.user_response);

      // Evaluate
      const isCorrect = FillInTheBlankMutiGraph.checkAnswer(config, e.detail.user_response);
      console.log("Is Correct:", isCorrect);
    });
</script>


*/