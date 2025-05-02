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
            <div class="subject-grid">
            ${this._topics.map(topic => `
                <div class="subject-card" title="${topic.description || ''}">
                    <a href="#">
                        ${topic.topic}
                    </a>
                </div>
            `).join('')}
    </div>
        `;

        this.querySelectorAll('.subject-card a').forEach((link, index) => {
            link.addEventListener('click', (e) => {
                this.dispatchEvent(new CustomEvent('topicSelected', {
                    detail: this._topics[index],
                    bubbles: true
                }));
            });
        });
    }
}

customElements.define('topic-selector', TopicSelector);
