class NumberLineArcs extends HTMLElement {
  constructor() {
    super();
    this.data = null;
    this.svg = null;
    this.arcsGroup = null;
    this.selectedPoints = [];
    this.userResponse = [];
    this.activePoint = null; // Track the active (highlighted) point
  }

  connectedCallback() {
    this.data = JSON.parse(this.getAttribute("config"));

    if (!this.data.points && this.data.number_line) {
      const { start, end, step } = this.data.number_line;
      this.data.points = [];
      for (let i = start; i <= end; i += step) {
        this.data.points.push(i);
      }
    }

    this.userResponse = this.data.user_response || [];
    this.render();
    this.drawUserResponseArcs();
  }

  render() {
    this.innerHTML = `
      <div class="number-line-question">
        <p class="number-line-question-text">${this.data.question || ""}</p>
      </div>
      <div class="number-line-container">
        <svg class="number-line-svg"></svg>
      </div>
    `;
    this.svg = this.querySelector(".number-line-svg");
    this.arcsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.svg.appendChild(this.arcsGroup);

    const width = 600;
    const height = 200;
    this.svg.setAttribute("width", width);
    this.svg.setAttribute("height", height);

    const startX = 50;
    const endX = width - 50;
    const y = height - 50;
    const step = (endX - startX) / (this.data.points.length - 1);

    // Draw baseline
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", startX);
    line.setAttribute("y1", y);
    line.setAttribute("x2", endX);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "black");
    this.svg.appendChild(line);

    // Draw points
    this.data.points.forEach((point, idx) => {
      const x = startX + idx * step;

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", x);
      circle.setAttribute("cy", y);
      circle.setAttribute("r", 8);
      circle.setAttribute("class", "number-point");
      circle.dataset.value = point;
      circle.addEventListener("click", () => this.handlePointClick(point));
      this.svg.appendChild(circle);

      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", x);
      label.setAttribute("y", y + 25);
      label.setAttribute("text-anchor", "middle");
      label.textContent = point;
      this.svg.appendChild(label);
    });
  }

  highlightPoint(value) {
    const circle = this.svg.querySelector(`circle[data-value='${value}']`);
    if (circle) {
      // circle.setAttribute("fill", "red");
      circle.style.fill = "red";
    }
    this.activePoint = value;
  }

  resetHighlight() {
    if (this.activePoint !== null) {
      const circle = this.svg.querySelector(`circle[data-value='${this.activePoint}']`);
      if (circle) {
        // circle.setAttribute("fill", "orange");
        circle.style.fill = "orange";
      }
      this.activePoint = null;
    }
  }

  handlePointClick(value) {
    if (this.selectedPoints.length === 0) {
      this.selectedPoints.push(value);
      this.highlightPoint(value);
    } else if (this.selectedPoints.length === 1) {
      const first = this.selectedPoints[0];
      const second = value;

      if (first === second) {
        const existingIndex = this.userResponse.findIndex(
          pair => pair[0] === first && pair[1] === first
        );
        if (existingIndex !== -1) {
          this.userResponse.splice(existingIndex, 1);
        } else {
          this.userResponse.push([first, first]);
        }
      } else {
        const existingIndex = this.userResponse.findIndex(
          pair =>
            (pair[0] === first && pair[1] === second) ||
            (pair[0] === second && pair[1] === first)
        );
        if (existingIndex !== -1) {
          this.userResponse.splice(existingIndex, 1);
        } else {
          this.userResponse.push([first, second]);
        }
      }

      this.redrawArcs();
      this.selectedPoints = [];
      this.resetHighlight();
    }
  }

  drawArc(p1, p2) {
    const width = this.svg.getAttribute("width");
    const height = this.svg.getAttribute("height");
    const startX = 50;
    const endX = width - 50;
    const y = height - 50;
    const step = (endX - startX) / (this.data.points.length - 1);

    const idx1 = this.data.points.indexOf(p1);
    const idx2 = this.data.points.indexOf(p2);

    const x1 = startX + idx1 * step;
    const x2 = startX + idx2 * step;

    if (p1 === p2) {
      const r = 10;
      const offsetY = 10;
      const loop = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      loop.setAttribute("cx", x1);
      loop.setAttribute("cy", y - offsetY);
      loop.setAttribute("r", r);
      loop.setAttribute("stroke", "red");
      loop.setAttribute("fill", "none");
      loop.setAttribute("stroke-width", 2);
      this.arcsGroup.appendChild(loop);
    } else {
      const midX = (x1 + x2) / 2;
      const arcHeight = Math.abs(x2 - x1) / 2;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", `M${x1},${y} Q${midX},${y - arcHeight} ${x2},${y}`);
      path.setAttribute("stroke", "blue");
      path.setAttribute("fill", "none");
      path.setAttribute("stroke-width", 2);
      this.arcsGroup.appendChild(path);
    }
  }

  redrawArcs() {
    this.arcsGroup.innerHTML = "";
    this.userResponse.forEach(pair => this.drawArc(pair[0], pair[1]));
  }

  drawUserResponseArcs() {
    this.redrawArcs();
  }

  getUserAnswer() {
    return this.userResponse;
  }
}

customElements.define("number-line-arcs", NumberLineArcs);
