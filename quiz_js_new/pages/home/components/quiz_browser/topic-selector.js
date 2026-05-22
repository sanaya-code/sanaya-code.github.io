class TopicSelector extends HTMLElement {
    constructor() {
        super();
        this._topics = [];
    }

    static get observedAttributes() {
        return ["config"];
    }

    connectedCallback() {
        this.loadFromConfig();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "config" && oldValue !== newValue) {
            this.loadFromConfig();
        }
    }

    loadFromConfig() {
        try {
            this._topics = JSON.parse(this.getAttribute("config") || "[]");
            this.render();
        } catch (error) {
            console.warn("Invalid JSON for topic selector config:", error);
        }
    }

    render() {
        this.innerHTML = `
            <div class="subject-grid">
                ${this._topics.map(topic => `
                    <div class="subject-card" title="${topic.description || ""}">
                        <a href="#">${topic.topic}</a>
                    </div>
                `).join("")}
            </div>
        `;

        this.querySelectorAll(".subject-card a").forEach((link, index) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();

                this.dispatchEvent(new CustomEvent("topicSelected", {
                    detail: this._topics[index],
                    bubbles: true
                }));
            });
        });
    }
}

customElements.define("topic-selector", TopicSelector);