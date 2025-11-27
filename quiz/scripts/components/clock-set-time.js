class ClockSetTime extends HTMLElement {
    constructor() {
      super();
      this.config = null;
      this.selectedHand = null; // "hour" or "minute"
      this.svg = null;
      this.center = { x: 0, y: 0 };
      this.handLines = { hour: null, minute: null };
      this.handMarkers = {}; // ADD THIS LINE
      this.clockPoints = {}; // Precomputed points for numbers and midpoints
    }
  
    static get observedAttributes() {
      return ["config"];
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === "config") {
        try {
          this.config = JSON.parse(newValue);
          if (!this.config.user_response) {
            this.config.user_response = { hour: null, minute: null };
          }
          this.render();
        } catch (e) {
          console.error("Invalid JSON in config:", e);
        }
      }
    }
  
    getUserAnswer() {
      return this.config.user_response;
    }
  
    render() {
      if (!this.config) return;
  
      this.innerHTML = "";
  
      // Question
      const questionEl = document.createElement("div");
      questionEl.textContent = this.config.question;
      questionEl.style.marginBottom = "10px";
      this.appendChild(questionEl);
  
      // Buttons
      const buttonsDiv = document.createElement("div");
      buttonsDiv.style.marginBottom = "10px";
  
      const hourBtn = document.createElement("button");
      hourBtn.textContent = "Hour Hand";
      hourBtn.onclick = () => (this.selectedHand = "hour");
  
      const minuteBtn = document.createElement("button");
      minuteBtn.textContent = "Minute Hand";
      minuteBtn.onclick = () => (this.selectedHand = "minute");
  
      buttonsDiv.appendChild(hourBtn);
      buttonsDiv.appendChild(minuteBtn);
      this.appendChild(buttonsDiv);
  
      // SVG clock
      const radius = this.config.clock.radius || 120;
      const size = radius * 2 + 40;
  
      this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      this.svg.setAttribute("width", "100%");
      this.svg.setAttribute("height", `${size}px`);
      this.svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
      this.svg.style.border = "1px solid #ccc";
      this.svg.style.background = "#fdfdfd";
      this.svg.style.borderRadius = "50%";
      this.appendChild(this.svg);
  
      this.center = { x: size / 2, y: size / 2 };
  
      // Draw outer circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", this.center.x);
      circle.setAttribute("cy", this.center.y);
      circle.setAttribute("r", radius);
      circle.setAttribute("fill", "#fff");
      circle.setAttribute("stroke", "#000");
      this.svg.appendChild(circle);
  
      this.precomputeClockPoints(radius);
  
      this.drawNumbers();
  
      this.createClickSectors(); // Create invisible detection sectors
        // Numbers already have their own click handlers
        this.restoreHandsFromResponse(); // Restore existing hands
    }
  
    // Add this method after precomputeClockPoints()
createClickSectors() {
    // Remove existing sectors if any
    const existingSectors = this.svg.querySelectorAll('.click-sector');
    existingSectors.forEach(sector => sector.remove());
  
    // Create 24 invisible sectors (each 15° = 360°/24)
    for (let i = 0; i < 24; i++) {
      const sectorAngle = (i * Math.PI / 12) - Math.PI / 2; // Start from 12 o'clock
      const sector = document.createElementNS("http://www.w3.org/2000/svg", "path");
      
      // Sector path: center -> outer arc -> back to center (15° wedge)
      const outerRadius = this.config.clock.radius * 0.9;
      const startX = this.center.x + Math.cos(sectorAngle) * outerRadius;
      const startY = this.center.y + Math.sin(sectorAngle) * outerRadius;
      const endAngle = sectorAngle + Math.PI / 12;
      const endX = this.center.x + Math.cos(endAngle) * outerRadius;
      const endY = this.center.y + Math.sin(endAngle) * outerRadius;
      
      const pathData = `M ${this.center.x} ${this.center.y} L ${startX} ${startY} 
                       A ${outerRadius} ${outerRadius} 0 0 1 ${endX} ${endY} Z`;
      
      sector.setAttribute("d", pathData);
      sector.setAttribute("fill", "transparent");
      sector.setAttribute("stroke", "none");
      sector.setAttribute("class", "click-sector");
      sector.dataset.value = (i % 24) / 2; // 0, 0.5, 1, 1.5, ..., 11.5, 12
      sector.addEventListener("click", (e) => this.onSectorClick(e));
      this.svg.appendChild(sector);
    }
  }
  
    // Precompute number points and midpoints with correct wrapping
    precomputeClockPoints(radius) {
      this.clockPoints = {};
      const numbers = this.config.clock.numbers || [];
  
      // Number positions - 12 at top
      numbers.forEach((num) => {
        const angle = ((num % 12) / 12) * 2 * Math.PI - Math.PI / 2;
        const x = this.center.x + Math.cos(angle) * radius * 0.85;
        const y = this.center.y + Math.sin(angle) * radius * 0.85;
        this.clockPoints[num] = { x, y };
      });
  
      // Midpoints between numbers, correcting the wrap-around
      numbers.forEach((num, i) => {
        const nextNum = i === numbers.length - 1 ? numbers[0] : numbers[i + 1];
        const x = (this.clockPoints[num].x + this.clockPoints[nextNum].x) / 2;
        const y = (this.clockPoints[num].y + this.clockPoints[nextNum].y) / 2;
  
        // Midpoint values wrap from 12.5 -> 0.5 (mod 12)
        let midValue = num + 0.5;
        if (midValue > 12) midValue -= 12;
        this.clockPoints[midValue] = { x, y };
      });
    }
  
    // Draw the numbers with click handlers to stop event bubbling to SVG
    drawNumbers() {
      const numbers = this.config.clock.numbers || [];
      numbers.forEach((num) => {
        const point = this.clockPoints[num];
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", point.x);
        text.setAttribute("y", point.y + 5);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-size", "16");
        text.setAttribute("cursor", "pointer");
        text.textContent = num;
        text.dataset.num = num;
        text.addEventListener("click", (e) => this.onNumberClick(e));
        this.svg.appendChild(text);
      });
    }
  
    onNumberClick(e) {
      e.stopPropagation(); // Prevent click from bubbling to SVG
      if (!this.selectedHand) return;
  
      const num = parseFloat(e.target.dataset.num);
      if (!num) return;
  
      this.storeAndDrawHand(num);
    }
  
    o// Replace onSvgClick with this and remove the old SVG click listener
onSectorClick(e) {
    e.stopPropagation();
    if (!this.selectedHand) return;
  
    const value = parseFloat(e.target.dataset.value);
    if (isNaN(value)) return;
  
    // Convert 0 -> 12
    const finalValue = value === 0 ? 12 : value;
  
    console.log(`Sector clicked: ${finalValue}`);
    this.storeAndDrawHand(finalValue);
  }
      
  
    storeAndDrawHand(snappedValue) {
      if (!this.config.user_response) {
        this.config.user_response = { hour: null, minute: null };
      }
      if (this.selectedHand === "hour") {
        this.config.user_response.hour = snappedValue;
      } else {
        this.config.user_response.minute = snappedValue;
      }
  
      const point = this.clockPoints[snappedValue];
  
      if (point) {
        this.drawHand(this.selectedHand, point);
      }
  
      this.dispatchEvent(new Event("input-change"));
    }
  
    drawHand_01(handType, point) {
      const color = this.config.clock[handType + "_hand"].color;
      const strokeWidth = handType === "hour" ? 4 : 2;
  
      // Remove old hand line
      if (this.handLines[handType]) {
        this.svg.removeChild(this.handLines[handType]);
      }
  
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", this.center.x);
      line.setAttribute("y1", this.center.y);
      line.setAttribute("x2", point.x);
      line.setAttribute("y2", point.y);
      line.setAttribute("stroke", color);
      line.setAttribute("stroke-width", strokeWidth);
      line.setAttribute("stroke-linecap", "round");
      this.svg.appendChild(line);
  
      this.handLines[handType] = line;
    }

    drawHand(handType, point) {
        const color = this.config.clock[handType + "_hand"].color;
        const strokeWidth = handType === "hour" ? 4 : 2;
        const lengthRatio = this.config.clock[handType + "_hand"].length_ratio * 1.15; // 15% longer
      
        // Safely remove old hand line if it exists and is attached
        if (this.handLines[handType] && this.handLines[handType].parentNode === this.svg) {
          this.svg.removeChild(this.handLines[handType]);
        }
        if (this.handMarkers && this.handMarkers[handType] && this.handMarkers[handType].parentNode === this.svg) {
          this.svg.removeChild(this.handMarkers[handType]);
        }
      
        // Calculate hand endpoint based on extended length_ratio
        const dx = point.x - this.center.x;
        const dy = point.y - this.center.y;
        const fullLength = Math.sqrt(dx * dx + dy * dy);
        const handLength = fullLength * lengthRatio;
        const endX = this.center.x + (dx / fullLength) * handLength;
        const endY = this.center.y + (dy / fullLength) * handLength;
      
        // Create arrow marker (smaller for hour hand)
        if (!this.handMarkers) this.handMarkers = {};
        if (!this.handMarkers[handType]) {
          const defs = this.svg.querySelector('defs') || document.createElementNS("http://www.w3.org/2000/svg", "defs");
          if (!this.svg.querySelector('defs')) this.svg.appendChild(defs);
      
          const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
          marker.setAttribute("id", `arrowhead-${handType}`);
          
          // Scale arrow size based on hand type
          const markerSize = handType === "hour" ? 6 : 10;
          marker.setAttribute("markerWidth", markerSize);
          marker.setAttribute("markerHeight", markerSize);
          marker.setAttribute("refX", markerSize * 0.9);
          marker.setAttribute("refY", markerSize * 0.3);
          marker.setAttribute("orient", "auto");
          marker.setAttribute("markerUnits", "strokeWidth");
      
          const arrowPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
          arrowPath.setAttribute("d", `M 0,0 L ${markerSize}, ${markerSize * 0.3} L 0, ${markerSize * 0.6} Z`);
          arrowPath.setAttribute("fill", color);
          marker.appendChild(arrowPath);
          defs.appendChild(marker);
          this.handMarkers[handType] = marker;
        }
      
        // Draw hand line with arrowhead
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", this.center.x);
        line.setAttribute("y1", this.center.y);
        line.setAttribute("x2", endX);
        line.setAttribute("y2", endY);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", strokeWidth);
        line.setAttribute("stroke-linecap", "round");
        line.setAttribute("marker-end", `url(#arrowhead-${handType})`);
        this.svg.appendChild(line);
      
        this.handLines[handType] = line;
      }
      
      
      
      

    // Add this method after drawHand()
restoreHandsFromResponse() {
    if (!this.config.user_response) return;
  
    // Restore hour hand
    if (this.config.user_response.hour !== null) {
      const hourValue = this.config.user_response.hour;
      const hourPoint = this.clockPoints[hourValue];
      if (hourPoint) {
        this.drawHand("hour", hourPoint);
      }
    }
  
    // Restore minute hand
    if (this.config.user_response.minute !== null) {
      const minuteValue = this.config.user_response.minute;
      const minutePoint = this.clockPoints[minuteValue];
      if (minutePoint) {
        this.drawHand("minute", minutePoint);
      }
    }
  }

  
  }
  
  
  customElements.define("clock-set-time", ClockSetTime);
  