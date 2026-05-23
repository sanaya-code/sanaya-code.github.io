class TopicSelector extends HTMLElement {

    static get observedAttributes() {
        return ['config'];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (name === 'config' && newVal !== oldVal) {
            this._render(this._parseConfig(newVal));
        }
    }

    // ── Config ────────────────────────────────────────────────

    _parseConfig(raw) {
        try {
            return JSON.parse(raw) || [];
        } catch (e) {
            console.warn('TopicSelector: invalid config JSON', e);
            return [];
        }
    }

    // ── Render ────────────────────────────────────────────────

    _render(topics) {
        this.innerHTML = `
            <div class="subject-grid">
                ${topics.map(topic => this._createCardHTML(topic)).join('')}
            </div>
        `;
        this._bindCardEvents(topics);
    }

    _createCardHTML(topic) {
        return `
            <div class="subject-card" title="${topic.description || ''}">
                <a href="#">${topic.topic}</a>
            </div>
        `;
    }

    // ── Events ────────────────────────────────────────────────

    _bindCardEvents(topics) {
        this.querySelectorAll('.subject-card a').forEach((link, index) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this._dispatchTopicSelected(topics[index]);
            });
        });
    }

    _dispatchTopicSelected(topic) {
        this.dispatchEvent(new CustomEvent('topicSelected', {
            detail: topic,
            bubbles: true,
        }));
    }
}

customElements.define('topic-selector', TopicSelector);