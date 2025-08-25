class TabComponent extends HTMLElement {
  constructor() {
    super();
    // No Shadow DOM
  }

  set data(items) {
    this.render(items);
  }

  render(items) {
    if (!items || !items.length) {
      this.innerHTML = "<p>No data to display.</p>";
      return;
    }
    this.innerHTML = items.map(item =>
      `<a class="resource-link" href="${item.url}" target="_blank" rel="noopener noreferrer">${item.label}</a>`
    ).join('');
  }
}

customElements.define('tab-component', TabComponent);
