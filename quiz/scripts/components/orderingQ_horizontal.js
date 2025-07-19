class OrderingHorizontal extends HTMLElement {
    constructor() {
        super();
        this._config = {};
        this._userResponse = [];
        this._selectedItem = null; // For click-to-assign
    }

    static get observedAttributes() {
        return ['config'];
    }

    connectedCallback() {
        window.addEventListener('resize', this._resizeHandler = () => this.adjustLine());
    }

    disconnectedCallback() {
        window.removeEventListener('resize', this._resizeHandler);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config') {
            this._config = JSON.parse(newValue || '{}');
            this._userResponse = Array.isArray(this._config.user_response) 
                ? [...this._config.user_response]
                : new Array(this._config.correct_order.length).fill("");
            this.render();
            requestAnimationFrame(() => this.adjustLine());
        }
    }

    render() {
        const { question, items, user_response = [] } = this._config;

        this.innerHTML = `
            <div class="oh-question">${question}</div>
            <div class="oh-sequence">
                <div class="oh-line"></div>
                ${this._userResponse.map((val, index) => `
                    <div class="oh-node" data-index="${index}">
                        ${val ? `<span class="oh-node-text">${val}</span>` : '<span class="oh-node-placeholder"></span>'}
                    </div>
                `).join('')}
            </div>
            <div class="oh-items">
                ${items.map(item => `
                    <div class="oh-item" draggable="true" data-value="${item}">${item}</div>
                `).join('')}
            </div>
        `;

        this.addEventListeners();
    }

    addEventListeners() {
        // Drag logic
        this.querySelectorAll('.oh-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', item.dataset.value);
            });

            // Click-to-select logic
            item.addEventListener('click', () => {
                this._selectedItem = item.dataset.value;
                this.highlightSelected(item);
            });
        });

        this.querySelectorAll('.oh-node').forEach(node => {
            const index = parseInt(node.dataset.index);

            node.addEventListener('dragover', (e) => e.preventDefault());

            node.addEventListener('drop', (e) => this.handleDrop(e, index));

            node.addEventListener('click', () => {
                if (this._selectedItem) {
                    this._userResponse[index] = this._selectedItem;
                    this._selectedItem = null;
                    this.clearHighlights();
                    this.render();
                    requestAnimationFrame(() => this.adjustLine());
                    this.emitChange();
                }
            });
        });
    }

    handleDrop(event, index) {
        event.preventDefault();
        const value = event.dataTransfer.getData('text/plain');
        this._userResponse[index] = value;
        this.render();
        requestAnimationFrame(() => this.adjustLine());
        this.emitChange();
    }

    highlightSelected(selectedItem) {
        this.querySelectorAll('.oh-item').forEach(item => {
            item.classList.toggle('oh-selected', item === selectedItem);
        });
    }

    clearHighlights() {
        this.querySelectorAll('.oh-item').forEach(item => {
            item.classList.remove('oh-selected');
        });
    }

    adjustLine() {
        const container = this.querySelector('.oh-sequence');
        const line = this.querySelector('.oh-line');
        const nodes = this.querySelectorAll('.oh-node');

        if (!container || !line || nodes.length < 2) return;

        const first = nodes[0].getBoundingClientRect();
        const last = nodes[nodes.length - 1].getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        const left = first.left - containerRect.left + first.width / 2;
        const right = last.left - containerRect.left + last.width / 2;

        line.style.left = `${left}px`;
        line.style.width = `${right - left}px`;
    }

    emitChange() {
        this.dispatchEvent(new CustomEvent('input-change', {
            detail: { user_response: this._userResponse }
        }));
    }

    getUserAnswer() {
        return this._userResponse;
    }
}


customElements.define('ordering-horizontal-drag-click', OrderingHorizontal);
