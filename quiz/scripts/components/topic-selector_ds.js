class TopicSelector extends HTMLElement {
    constructor() {
        super();
        this._topics = [];
        this._selectedTopic = null;
    }

    static get observedAttributes() {
        return ['config'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config') {
            try {
                this._topics = JSON.parse(newValue);
                this.render();
            } catch (e) {
                console.error('Invalid config JSON', e);
            }
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (!this._topics.length) return;

        this.innerHTML = `
            <div class="topic-selector">
                <h2>Select a Topic</h2>
                <div class="topics-container">
                    ${this._topics.map(topic => `
                        <div class="topic-card" data-id="${topic.id}">
                            <span class="topic-id">${topic.id}</span>
                            <div class="topic-title">${topic.topic}</div>
                            <div class="topic-description">${topic.description}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.querySelectorAll('.topic-card').forEach(card => {
            card.addEventListener('click', () => {
                const topicId = card.getAttribute('data-id');
                this.selectTopic(topicId);
            });
        });
    }

    selectTopic(topicId) {
        // Remove previous selection
        this.querySelectorAll('.topic-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Set new selection
        const selectedCard = this.querySelector(`.topic-card[data-id="${topicId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this._selectedTopic = this._topics.find(t => t.id === topicId);
            
            // Dispatch event with selected topic data
            this.dispatchEvent(new CustomEvent('topic-selected', {
                detail: this._selectedTopic,
                bubbles: true
            }));
        }
    }

    get selectedTopic() {
        return this._selectedTopic;
    }
}

customElements.define('topic-selector', TopicSelector);