class NumberLineFillInBlank extends HTMLElement {
    constructor() {
        super();
        this._config = {};
        this._userResponse = [];
    }

    static get observedAttributes() {
        return ['config'];
    }

    connectedCallback() {
        this.render();
        window.addEventListener('resize', this._resizeHandler = () => this.adjustLinePosition());
        requestAnimationFrame(() => this.adjustLinePosition());
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this._resizeHandler);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config') {
            this._config = JSON.parse(newValue || '{}');
            this._userResponse = [...(this._config.user_response || [])];
            this.render();
            requestAnimationFrame(() => this.adjustLinePosition());
        }
    }

    render() {
        const { question, sequence = [] } = this._config;

        let blankCounter = 0; // Track position in userResponse

        this.innerHTML = `
            <div class="nlfib-question">${question}</div>
            <div class="nlfib-sequence">
                <div class="nlfib-line"></div>
                ${sequence.map((item, index) => {
                    if (item.value === "____") {
                        const val = this._userResponse[blankCounter] || '';
                        const html = `
                            <div class="nlfib-node-input">
                                <input type="text" class="nlfib-input" 
                                    data-blank-index="${blankCounter}" 
                                    value="${val}" 
                                    placeholder="" />
                            </div>`;
                        blankCounter++;
                        return html;
                    } else {
                        return `<div class="nlfib-node">${item.value}</div>`;
                    }
                }).join('')}
            </div>
        `;

        this.addInputListeners();
    }

    addInputListeners() {
        this.querySelectorAll('.nlfib-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const blankIndex = parseInt(e.target.dataset.blankIndex);
                this._userResponse[blankIndex] = e.target.value;

                this.dispatchEvent(new CustomEvent('input-change', {
                    detail: {
                        user_response: this._userResponse,
                        index: blankIndex,
                        value: e.target.value
                    }
                }));
            });
        });
    }

    adjustLinePosition() {
        const sequenceContainer = this.querySelector('.nlfib-sequence');
        const line = this.querySelector('.nlfib-line');
        const nodes = this.querySelectorAll('.nlfib-node, .nlfib-node-input');

        if (!sequenceContainer || !line || nodes.length < 2) return;

        const firstNode = nodes[0].getBoundingClientRect();
        const lastNode = nodes[nodes.length - 1].getBoundingClientRect();
        const containerRect = sequenceContainer.getBoundingClientRect();

        const leftOffset = firstNode.left - containerRect.left + firstNode.width / 2;
        const rightOffset = lastNode.left - containerRect.left + lastNode.width / 2;

        line.style.left = `${leftOffset}px`;
        line.style.width = `${rightOffset - leftOffset}px`;
    }

    getUserAnswer() {
        return this._userResponse;
    }
}

customElements.define('number-line-fill-in-blank', NumberLineFillInBlank);
