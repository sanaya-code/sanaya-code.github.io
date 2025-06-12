class FlatsealComponent {
  constructor(containerId, settings) {
    this.container = document.getElementById(containerId);
    this.settings = settings;
  }

  render() {
    const sections = Object.entries(this.settings).map(([title, values]) => {
      const readableTitle = title.replace(/_/g, " ");
      return `
        <h3>${readableTitle}</h3>
        ${Utils.renderArrayAsTable(values)}
      `;
    }).join('');

    this.container.innerHTML = `
      <h2>Flatseal Configuration</h2>
      ${sections}
    `;
  }
}
