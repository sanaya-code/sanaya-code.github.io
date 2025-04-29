class MatchingConnectionComponent extends HTMLElement {
  constructor() {
    super();
    this.config = null;
    this.selectedLeft = null;
    this.userResponse = [];
    this.leftItems = [];
    this.rightItems = [];
    this.shuffledRight = [];
    this.resizeObserver = null;
  }

  connectedCallback() {
    const configStr = this.getAttribute('config');
    if (configStr) {
      this.config = JSON.parse(configStr);
      this.userResponse = this.config.user_response || new Array(this.config.pairs.length).fill(null);
      this.shuffleRightItems();
      this.render();
      this.setupResizeObserver();
    }
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.redrawConnections();
    });
    this.resizeObserver.observe(this);
  }

  shuffleRightItems() {
    const rights = this.config.pairs.map(p => p.right);
    for (let i = rights.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rights[i], rights[j]] = [rights[j], rights[i]];
    }
    this.shuffledRight = rights;
  }

  render() {
    this.innerHTML = `
      <div class="connect-container">
        <div class="connect-rows-container"></div>
        <svg class="connect-svg"></svg>
      </div>
    `;

    const container = this.querySelector('.connect-rows-container');
    
    this.config.pairs.forEach((pair, index) => {
      const row = document.createElement('div');
      row.classList.add('connect-row');
      container.appendChild(row);

      const leftDiv = document.createElement('div');
      leftDiv.textContent = pair.left;
      leftDiv.classList.add('connect-item', 'left-item');
      leftDiv.dataset.index = index;
      row.appendChild(leftDiv);
      this.leftItems.push(leftDiv);

      leftDiv.addEventListener('click', () => {
        this.leftItems.forEach(item => item.classList.remove('selected'));
        leftDiv.classList.add('selected');
        this.selectedLeft = index;
      });

      const rightDiv = document.createElement('div');
      rightDiv.textContent = this.shuffledRight[index];
      rightDiv.classList.add('connect-item', 'right-item');
      rightDiv.dataset.value = this.shuffledRight[index];
      row.appendChild(rightDiv);
      this.rightItems.push(rightDiv);

      rightDiv.addEventListener('click', () => {
        if (this.selectedLeft !== null) {
          this.userResponse = this.userResponse.map((val) =>
            val === this.shuffledRight[index] ? null : val
          );
          this.userResponse[this.selectedLeft] = this.shuffledRight[index];
          this.redrawConnections();
          this.selectedLeft = null;
          this.leftItems.forEach(item => item.classList.remove('selected'));
        }
      });
    });

    this.redrawConnections();
  }

  drawConnection(lhsIndex, rhsValue) {
    const svg = this.querySelector('.connect-svg');
    const leftElem = this.leftItems[lhsIndex];
    const rightElem = this.rightItems.find(elem => elem.dataset.value === rhsValue);
    if (!leftElem || !rightElem) return;

    const leftRect = leftElem.getBoundingClientRect();
    const rightRect = rightElem.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();

    const x1 = leftRect.right - svgRect.left;
    const y1 = leftRect.top + leftRect.height / 2 - svgRect.top;
    const x2 = rightRect.left - svgRect.left;
    const y2 = rightRect.top + rightRect.height / 2 - svgRect.top;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', this.getColorForIndex(lhsIndex));
    line.setAttribute('stroke-width', '2.5');
    line.setAttribute('stroke-linecap', 'round');
    svg.appendChild(line);
  }

  redrawConnections() {
    const svg = this.querySelector('.connect-svg');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    this.userResponse.forEach((rhsValue, lhsIndex) => {
      if (rhsValue) this.drawConnection(lhsIndex, rhsValue);
    });
  }

  getColorForIndex(index) {
    const colors = ['#e74c3c', '#3498db', '#27ae60', '#8e44ad', '#f39c12'];
    return colors[index % colors.length];
  }

  getUserAnswer() {
    return this.userResponse.map(v => v || null);
  }
}

customElements.define('matching-connection', MatchingConnectionComponent);