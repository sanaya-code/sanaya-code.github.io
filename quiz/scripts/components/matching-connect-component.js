class MatchingConnectionComponent extends HTMLElement {
  constructor() {
      super();
      this.lhsElements = [];
      this.rhsElements = [];
      this.matches = [];
      this.svg = null;
      this.lineColors = [];
  }

  connectedCallback() {
      this.render();
  }

  get config() {
      try {
          return JSON.parse(this.getAttribute("config"));
      } catch {
          return null;
      }
  }

  render() {
      const config = this.config;
      if (!config || !config.pairs) return;

      const userResponse = Array.isArray(config.user_response)
          ? config.user_response
          : Array(config.pairs.length).fill(null);

      const shuffledRHS = [...config.pairs.map(p => p.right)]
          .map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value);

      this.lineColors = this.generateColorPalette(config.pairs.length);

      this.innerHTML = `
          <div class="connect-container">
              ${config.pairs.map((pair, index) => `
                  <div class="connect-row" data-index="${index}">
                      <div class="connect-item connect-lhs" data-index="${index}">${pair.left}</div>
                      <div class="connect-item connect-rhs" data-value="${shuffledRHS[index]}">${shuffledRHS[index]}</div>
                  </div>
              `).join("")}
              <svg class="connect-svg"></svg>
          </div>
      `;

      this.svg = this.querySelector("svg");
      this.lhsElements = Array.from(this.querySelectorAll(".connect-lhs"));
      this.rhsElements = Array.from(this.querySelectorAll(".connect-rhs"));
      this.matches = Array(config.pairs.length).fill(null);

      userResponse.forEach((rhsValue, lhsIndex) => {
          if (rhsValue) {
              const rhsEl = this.rhsElements.find(el => el.textContent === rhsValue);
              if (rhsEl) {
                  this.makeConnection(lhsIndex, rhsEl);
              }
          }
      });

      this.lhsElements.forEach(lhs => {
          lhs.addEventListener("click", () => {
              this.lhsElements.forEach(el => el.classList.remove("selected"));
              lhs.classList.add("selected");
          });
      });

      this.rhsElements.forEach(rhs => {
          rhs.addEventListener("click", () => {
              const selectedLHS = this.querySelector(".connect-lhs.selected");
              if (!selectedLHS) return;

              const lhsIndex = parseInt(selectedLHS.getAttribute("data-index"));
              this.makeConnection(lhsIndex, rhs);
              selectedLHS.classList.remove("selected");
          });
      });
  }

  makeConnection(lhsIndex, rhsElement) {
      const rhsValue = rhsElement.textContent;

      // Remove existing connection to this RHS
      this.matches = this.matches.map(val => (val === rhsValue ? null : val));
      this.matches[lhsIndex] = rhsValue;

      this.drawLines();
  }

  drawLines() {
      const svg = this.svg;
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      const svgRect = svg.getBoundingClientRect();

      this.matches.forEach((rhsValue, lhsIndex) => {
          if (!rhsValue) return;

          const lhs = this.lhsElements[lhsIndex];
          const rhs = this.rhsElements.find(el => el.textContent === rhsValue);
          if (!lhs || !rhs) return;

          const lhsRect = lhs.getBoundingClientRect();
          const rhsRect = rhs.getBoundingClientRect();

          const x1 = lhsRect.right - svgRect.left;
          const y1 = lhsRect.top + lhsRect.height / 2 - svgRect.top;
          const x2 = rhsRect.left - svgRect.left;
          const y2 = rhsRect.top + rhsRect.height / 2 - svgRect.top;

          const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
          line.setAttribute("x1", x1);
          line.setAttribute("y1", y1);
          line.setAttribute("x2", x2);
          line.setAttribute("y2", y2);
          line.setAttribute("stroke", this.lineColors[lhsIndex]);
          line.setAttribute("stroke-width", 2);

          svg.appendChild(line);
      });
  }

  generateColorPalette(n) {
    const fixedColors = [
        "#e6194b", // red
        "#3cb44b", // green
        "#ffe119", // yellow
        "#4363d8", // blue
        "#f58231", // orange
        "#911eb4"  // purple
    ];

    if (n <= fixedColors.length) {
        return fixedColors.slice(0, n);
    }

    const extraColors = Array.from({ length: n - fixedColors.length }, () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 50%)`;
    });

    return [...fixedColors, ...extraColors];
}


  getUserAnswer() {
      return this.matches;
  }
}

customElements.define("matching-connection", MatchingConnectionComponent);
