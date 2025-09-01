class CentralBlockPractice extends HTMLElement {
  constructor() {
    super();
    this._config = {};
  }

  static get observedAttributes() {
    return ['config'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'config' && newValue) {
      this._config = JSON.parse(newValue);
      this.render();
    }
  }

  connectedCallback() {
    if (this.hasAttribute('config')) {
      this._config = JSON.parse(this.getAttribute('config'));
      this.render();
    }
  }

  render() {
    const { question, center_label, blocks } = this._config;
    this.innerHTML = `
      <div class="fibmg-container">
        <h3 class="fibmg-question">${question}</h3>
        <div class="fibmg-board">
          <svg class="fibmg-lines"></svg>
          <div class="fibmg-center">${center_label}</div>
          ${blocks
            .map(
              (b, i) => `
            <div class="fibmg-block" data-index="${i}">
              <div class="fibmg-label">${b.a} ${b.b}</div>
              <input class="fibmg-input" type="text" />
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    this._positionBlocks();
  }

  _positionBlocks() {
    const board = this.querySelector('.fibmg-board');
    const center = this.querySelector('.fibmg-center');
    const blocks = this.querySelectorAll('.fibmg-block');
    const svg = this.querySelector('.fibmg-lines');

    const rect = board.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) / 2.5;

    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height);
    svg.innerHTML = '';

    blocks.forEach((block, i) => {
      const angle = (2 * Math.PI * i) / blocks.length;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      block.style.left = `${x - block.offsetWidth / 2}px`;
      block.style.top = `${y - block.offsetHeight / 2}px`;

      // Draw line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', cx);
      line.setAttribute('y1', cy);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
      svg.appendChild(line);
    });

    // Position center
    center.style.left = `${cx - center.offsetWidth / 2}px`;
    center.style.top = `${cy - center.offsetHeight / 2}px`;
  }

  getUserAnswer() {
    const answers = [];
    const blocks = this.querySelectorAll('.fibmg-block');
    blocks.forEach((block, i) => {
      const input = block.querySelector('.fibmg-input').value.trim();
      // answers[`block_${i}`] = input;
      answers[i] = input;
    });
    return answers;
  }
}

customElements.define('fill-in-blank-multi-graph', CentralBlockPractice);

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