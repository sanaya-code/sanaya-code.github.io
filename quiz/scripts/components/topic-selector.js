class TopicSelector extends HTMLElement {
    constructor() {
        super();
        this._topics = [];
    }

    static get observedAttributes() {
        return ['config'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'config' && newVal !== oldVal) {
            try {
                this._topics = JSON.parse(newVal);
                this.render();
            } catch (e) {
                console.warn("Invalid JSON for config:", e);
            }
        }
    }

    render() {
        this.innerHTML = `
            <div class="topic-container">
                ${this._topics.map((t, i) => `
                    <button class="topic-btn" data-index="${i}" title="${t.description}">
                        ${t.topic}
                    </button>
                `).join('')}
            </div>
        `;

        this.querySelectorAll('.topic-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.getAttribute('data-index'), 10);
                const selected = this._topics[index];
                this.dispatchEvent(new CustomEvent('topicSelected', {
                    detail: selected,
                    bubbles: true
                }));
            });
        });
    }
}

customElements.define('topic-selector', TopicSelector);
