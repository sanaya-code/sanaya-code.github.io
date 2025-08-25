class TabComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.selectedIndex = 0;
    this.subjects = [];
    this.subjectData = {};
  }

  set data({ subjects, subjectData }) {
    this.subjects = subjects;
    this.subjectData = subjectData;
    this.selectedIndex = 0;
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    if (!this.subjects.length) return;
    const tabBtns = this.subjects.map((subject, idx) =>
      `<button class="tab-btn${idx === this.selectedIndex ? ' active' : ''}" data-idx="${idx}">${subject}</button>`
    ).join('');
    const items = this.subjectData[this.subjects[this.selectedIndex]];
    const content = items && items.length
      ? items.map(item =>
        `<a class="resource-link" href="${item.url}" target="_blank">${item.label}</a>`
      ).join('')
      : "<div>No data available.</div>";
    this.shadowRoot.innerHTML = `
      <div class="tab-bar">${tabBtns}</div>
      <div class="tab-content">${content}</div>
      <style>
        .tab-bar { display: flex; background: #f1f1f1; border-bottom: 2px solid #ccc; margin-bottom: 16px; }
        .tab-btn { border: none; background: transparent; padding: 12px 24px; cursor: pointer; font-weight: bold; transition: background 0.3s; }
        .tab-btn.active { background: #dde7fa; border-bottom: 2px solid #2f76e5; }
        .tab-content { padding: 20px; border: 1px solid #ccc; background: #fff; }
        .resource-link { display: block; margin-bottom: 12px; font-size: 1rem; color: #2064b0; text-decoration: none; }
        .resource-link:hover { text-decoration: underline; }
      </style>
    `;
    this.shadowRoot.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectedIndex = parseInt(e.target.getAttribute('data-idx'));
        this.render();
      });
    });
  }
}

customElements.define('tab-component', TabComponent);
