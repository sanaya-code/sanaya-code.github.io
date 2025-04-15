class IndexPanelComponent extends HTMLElement {
	constructor() {
		super();
		this.gridBuilt = false;
	}

	static get observedAttributes() {
		return ['total', 'current', 'update-status', 'mark-all-unanswered', 'remove-panel'];
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
		} else if (name === 'mark-all-unanswered') {
			this.ensureStructure();
			this.markAllUnanswered();
		} else if (name === 'remove-panel') {
			this.remove(); 
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

		this.innerHTML = `
			<div class="index-panel" style="display: block;">
				<div class="index-title">Questions</div>
				<div class="index-grid">
					${Array.from({ length: total }, (_, i) => `
						<div class="index-item not-answered" data-index="${i}">${i + 1}</div>
					`).join('')}
				</div>
			</div>
		`;

		this.addCustomEventsToQueIndex();
	}

	addCustomEventsToQueIndex() {
		const grid = this.querySelector('.index-grid');
		if (!grid) return;

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

		const prev = this.querySelector('.index-item.current');
		if (prev) prev.classList.remove('current');

		const next = this.querySelector(`.index-item[data-index="${index}"]`);
		if (next) next.classList.add('current');
	}

	updateStatusFromJSON(jsonStr) {
		try {
			const { index, status } = JSON.parse(jsonStr);
			if (isNaN(index)) return;

			const el = this.querySelector(`.index-item[data-index="${index}"]`);
			if (el) {
				el.classList.remove('answered', 'not-answered');
				el.classList.add(status);
			}
		} catch (e) {
			console.warn('Invalid update-status format:', jsonStr);
		}
	}

	markAllUnanswered() {
		const items = this.querySelectorAll('.index-item');
		items.forEach(item => {
			if (!item.classList.contains('current')) {
				item.classList.remove('answered');
				item.classList.add('not-answered');
			}
		});
	}
}

customElements.define('question-index-panel', IndexPanelComponent);


/*


<question-index-panel total="6" current="0" mark-all-unanswered="true"></question-index-panel>

<question-index-panel 
	total="6" 
	current="0" 
	mark-all-unanswered="true">
	remove-panel='false'
	update-status= { 'index': 1, 'status': 'not-answered' }
</question-index-panel>


const statusUpdate = JSON.stringify({ index: 1, status: 'not-answered' });

indexPanel.setAttribute('update-status', statusUpdate);

indexPanel.setAttribute('current', '1');

indexPanel.setAttribute('mark-all-unanswered', 'true');

indexPanel.setAttribute('remove-panel', 'true');


*/