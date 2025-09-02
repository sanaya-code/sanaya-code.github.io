class NumberLineArcs extends HTMLElement {
  constructor() {
    super();

    this.data = null;
    this.svg = null;
    this.arcsGroup = null;
    this.pointsElems = [];
    this.userResponse = [];
    this.activePoint = null;

    this.logicalWidth = 600; // initial default width
    this.logicalHeight = 200;
    this.pointRadius = 10;
    this.resizeObserver = null;
  }

  static get observedAttributes() {
    return ['config'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'config' && oldValue !== newValue) {
      this.data = JSON.parse(newValue);
      this.preparePoints();
      this.userResponse = this.data.user_response || [];
      this.updateLogicalWidth();
      this.render();
      this.drawUserResponseArcs();
    }
  }

  connectedCallback() {
    if (!this.data) {
      try {
        this.data = JSON.parse(this.getAttribute('config'));
      } catch {
        this.data = {};
      }
    }
    this.preparePoints();
    this.userResponse = this.data.user_response || [];

    this.updateLogicalWidth();
    this.render();
    this.drawUserResponseArcs();

    this.resizeObserver = new ResizeObserver(() => {
      const prevWidth = this.logicalWidth;
      this.updateLogicalWidth();
      if (this.logicalWidth !== prevWidth) {
        this.render();
        this.drawUserResponseArcs();
      }
    });
    this.resizeObserver.observe(this);
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  // Updates logicalWidth dynamically based on current container width rounded
  updateLogicalWidth() {
    const width = this.offsetWidth;
    if (width && width !== this.logicalWidth) {
      this.logicalWidth = Math.round(width);
    }
  }

  preparePoints() {
    if (Array.isArray(this.data.points) && this.data.points.length > 0) {
      // Use provided points array
    } else if (this.data.number_line) {
      const { start, end, step } = this.data.number_line;
      this.data.points = [];
      for (let i = start; i <= end; i += step) {
        this.data.points.push(i);
      }
    } else {
      this.data.points = [];
    }
  }

  getPointX(index) {
    const totalPoints = this.data.points.length;
    if (totalPoints === 0) return this.logicalWidth / 2;
    if (totalPoints === 1) return this.logicalWidth / 2;
    const usableWidth = this.logicalWidth - 2 * this.pointRadius;
    return this.pointRadius + (usableWidth * index) / (totalPoints - 1);
  }

  getPointY() {
    return this.logicalHeight * 0.8;
  }

  render() {
    this.innerHTML = `
      <style>
        @import "${this.getAttribute('css-url')}";
      </style>
      <div class="number-line-container">
        ${
          this.data.question
            ? `<div class="number-line-question"><div class="number-line-question-text">${this.data.question}</div></div>`
            : ''
        }
        <svg class="number-line-svg" viewBox="0 0 ${this.logicalWidth} ${this.logicalHeight}" width="100%" height="${this.logicalHeight}" preserveAspectRatio="xMidYMid meet" role="img" tabindex="0" aria-label="Number line question"></svg>
      </div>
    `;

    this.svg = this.querySelector('svg.number-line-svg');
    this.svg.innerHTML = '';

    this.drawBaseLine();
    this.drawPoints();
    this.attachListeners();
  }

  drawBaseLine() {
    const y = this.getPointY();
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', this.getPointX(0));
    line.setAttribute('y1', y);
    line.setAttribute('x2', this.getPointX(this.data.points.length - 1));
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#333');
    line.setAttribute('stroke-width', '2');
    this.svg.appendChild(line);
  }

  drawPoints() {
    const y = this.getPointY();
    this.pointsElems = [];

    this.data.points.forEach((pt, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.classList.add('number-point');
      circle.setAttribute('cx', this.getPointX(i));
      circle.setAttribute('cy', y);
      circle.setAttribute('r', this.pointRadius);
      circle.setAttribute('data-index', i);
      circle.setAttribute('tabindex', 0);
      circle.setAttribute('role', 'button');
      circle.setAttribute('aria-label', `Number point ${pt}`);
      circle.style.fill = 'orange';
      circle.style.stroke = 'black';

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', this.getPointX(i));
      text.setAttribute('y', y + 30);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('font-size', '16px');
      text.setAttribute('fill', '#222');
      text.textContent = pt;

      this.svg.appendChild(circle);
      this.svg.appendChild(text);

      this.pointsElems.push(circle);
    });
  }

  attachListeners() {
    this.pointsElems.forEach((point) => {
      point.addEventListener('click', this.handlePointClick.bind(this));
      point.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          point.click();
        }
      });
    });
  }

  handlePointClick(event) {
    const idx = parseInt(event.target.getAttribute('data-index'), 10);

    if (this.activePoint === null) {
      this.activePoint = idx;
      this.highlightPoint(idx, true);
    } else {
      const first = this.activePoint;
      const second = idx;
      this.toggleArcOrLoop(first, second);

      this.highlightPoint(first, false);
      this.activePoint = null;
    }
  }

  highlightPoint(index, highlight) {
    if (this.pointsElems && this.pointsElems[index]) {
      this.pointsElems[index].style.fill = highlight ? 'green' : 'orange';
    }
  }

  toggleArcOrLoop(p1, p2) {
    if (p1 > p2) [p1, p2] = [p2, p1];

    let foundIndex = -1;
    this.userResponse.forEach((pair, i) => {
      if (pair[0] === p1 && pair[1] === p2) foundIndex = i;
    });

    if (foundIndex !== -1) {
      this.userResponse.splice(foundIndex, 1);
    } else {
      this.userResponse.push([p1, p2]);
    }

    this.drawUserResponseArcs();
    this.dispatchInputChange();
  }

  dispatchInputChange() {
    this.dispatchEvent(
      new CustomEvent('input-change', {
        detail: { userResponse: this.userResponse },
        bubbles: true,
        composed: true,
      })
    );
  }

  drawUserResponseArcs() {
    if (this.arcsGroup && this.svg.contains(this.arcsGroup)) {
      this.svg.removeChild(this.arcsGroup);
    }

    this.arcsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    this.arcsGroup.classList.add('arcs-group');

    this.userResponse.forEach(([p1, p2]) => {
      if (p1 === p2) {
        this.arcsGroup.appendChild(this.createSelfLoop(p1));
      } else {
        this.arcsGroup.appendChild(this.createArc(p1, p2));
      }
    });

    this.svg.appendChild(this.arcsGroup);
  }

  createArc(p1, p2) {
    const x1 = this.getPointX(p1);
    const x2 = this.getPointX(p2);
    const y = this.getPointY();
  
    const dx = x2 - x1;
    const dy = 0; // points lie on horizontal line, so dy=0
    const chordLength = Math.hypot(dx, dy);
  
    // Radius twice the chord length
    const radius = chordLength;
  
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  
    // SVG arc path:
    // 'A rx ry x-axis-rotation large-arc-flag sweep-flag x y'
    // Since circle radius = rx = ry = radius, x-axis-rotation=0
    // large-arc-flag=0 since arc < 180 deg, sweep-flag=1 for arc above line
  
    const d = `M ${x1} ${y} A ${radius} ${radius} 0 0 1 ${x2} ${y}`;
  
    path.setAttribute('d', d);
    path.setAttribute('stroke', 'blue');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('pointer-events', 'none');
  
    return path;
  }  

  createSelfLoop(p) {
    const x = this.getPointX(p);
    const y = this.getPointY();
    const radius = 15;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    const d = `
      M ${x} ${y}
      m 0 -${radius}
      a ${radius} ${radius} 0 1 1 0 ${2 * radius}
      a ${radius} ${radius} 0 1 1 0 -${2 * radius}`;

    path.setAttribute('d', d.trim());
    path.setAttribute('stroke', 'blue');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('pointer-events', 'none');

    return path;
  }

  getUserAnswer() {
    return [...this.userResponse];
  }
}

customElements.define('number-line-arcs', NumberLineArcs);
