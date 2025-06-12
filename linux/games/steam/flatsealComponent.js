class FlatsealRenderer {
    constructor(settings) {
      this.settings = settings;
    }
  
    static renderBoolean(val) {
      return `<span class="${val}">${val}</span>`;
    }
  
    renderSection(title, dataArray, isPath = false) {
      if (!Array.isArray(dataArray)) return "<p>Invalid data</p>";
  
      const headers = Object.keys(dataArray[0]);
      const table = `
        <div class="section">
          <h3>${title}</h3>
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${dataArray.map(item => `
                <tr>
                  ${headers.map(h => {
                    const val = item[h];
                    if (typeof val === "boolean") {
                      return `<td>${FlatsealRenderer.renderBoolean(val)}</td>`;
                    } else if (Array.isArray(val)) {
                      return `<td>${val.map(v => `<li>${v}</li>`).join("")}</td>`;
                    }
                    return `<td>${val}</td>`;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
      return table;
    }
  
    renderAll() {
      let html = "";
      for (const [sectionName, data] of Object.entries(this.settings)) {
        const title = sectionName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        html += this.renderSection(title, data);
      }
      return html;
    }
  }