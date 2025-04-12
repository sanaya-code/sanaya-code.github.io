class IndexPanelComponent extends HTMLElement {
	constructor() {
		super();
		this.gridBuilt = false;
		this.container = document.createElement('div');
		this.container.className = 'index-panel';
		this.appendChild(this.container);
	}

	static get observedAttributes() {
		return ['total', 'current', 'update-status'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'total') {
			this.buildGrid(parseInt(newValue, 10));
		} else if (name === 'current') {
			this.ensureStructure();
			this.setCurrent(parseInt(newValue, 10));
		} else if (name === 'update-status') {
			this.ensureStructure();
			this.updateStatusFromJSON(newValue);
		}
	}

	ensureStructure() {
		if (this.gridBuilt) return;
		const totalAttr = this.getAttribute('total');
		if (totalAttr !== null) {
			this.buildGrid(parseInt(totalAttr, 10));
		}
	}

	buildGrid(total) {
		this.gridBuilt = true;
		this.container.innerHTML = `
			<div class="index-title">Questions</div>
			<div class="index-grid">
				${Array.from({ length: total }, (_, i) => `
					<div class="index-item not-answered" data-index="${i}">${i + 1}</div>
				`).join('')}
			</div>
		`;

        // Add event listener once to the grid container
	this.addCustomEventsToQueIndex();

	}

    addCustomEventsToQueIndex() {
        const grid = this.container.querySelector('.index-grid');
        grid.addEventListener('click', (e) => {
            const item = e.target.closest('.index-item');
            if (item) {
                const index = parseInt(item.dataset.index, 10);
                this.dispatchEvent(new CustomEvent('question-selected', {
                    detail: { index },
                    bubbles: true,
                    composed: true
                }));
            }
        });
    }

	setCurrent(index) {
        
        if (isNaN(index)) return;

		const prev = this.container.querySelector('.index-item.current');
		if (prev) prev.classList.remove('current');

		const next = this.container.querySelector(`.index-item[data-index="${index}"]`);
		if (next) next.classList.add('current');
	}

	updateStatusFromJSON(jsonStr) {
		try {
			const { index, status } = JSON.parse(jsonStr);
            if (isNaN(index)) return;
			const el = this.container.querySelector(`.index-item[data-index="${index}"]`);
			if (el) {
				el.classList.remove('answered', 'not-answered');
				el.classList.add(status);
			}
		} catch (e) {
			console.warn('Invalid update-status format:', jsonStr);
		}
	}
}

customElements.define('question-index-panel', IndexPanelComponent);
