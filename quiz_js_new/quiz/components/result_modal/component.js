class ResultModal extends HTMLElement {

    constructor() {
        super();
        this._questions = [];
    }

    static get observedAttributes() {
        return ['config'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config') {
            const data = JSON.parse(newValue);
            this._questions = Array.isArray(data.questions) ? data.questions : [];
            this._render(data);
        }
    }

    // ── Render ────────────────────────────────────────────────

    _render(data) {
        if (!data?.summary) return;
        const { summary } = data;

        this.innerHTML = `
            <div class="result-modal" style="display: flex;">
                <div class="modal-content">
                    <div class="modal-actions">
                        <button class="modal-buttons close-btn">Close</button>
                        <button class="modal-buttons wrong-btn">Only Wrong</button>
                        <button class="modal-buttons home-btn">Back to Home</button>
                    </div>
                    <h2>Quiz Results</h2>
                    <div class="score-summary">
                        <h3>Your Score: ${summary.scorePercentage}%</h3>
                        <p>${summary.correctAnswers} out of ${summary.totalQuestions} correct</p>
                    </div>
                    <div class="filter-options">
                        <label><input type="radio" name="filter" value="wrong" checked> Only Wrong</label>
                        <label><input type="radio" name="filter" value="correct"> Only Correct</label>
                    </div>
                    <div class="result-items-container"></div>
                </div>
            </div>
        `;

        this._filterAndRender('wrong');
        this._bindEvents();
    }

    _renderItems(filtered) {
        this.querySelector('.result-items-container').innerHTML = filtered.map(q => `
            <div class="result-item ${q.isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>Question ${q.number}:</strong> ${q.question}</p>
                <p><strong>Your answer:</strong> ${q.userAnswer}</p>
                <p><strong>Correct answer:</strong> ${q.correctAnswer}</p>
                ${q.explanation ? `<p><strong>Explanation:</strong> ${q.explanation}</p>` : ''}
            </div>
        `).join('');
    }

    // ── Events ────────────────────────────────────────────────

    _bindEvents() {
        this.querySelectorAll('input[name="filter"]').forEach(radio => {
            radio.addEventListener('change', (e) => this._filterAndRender(e.target.value));
        });
        this.querySelector('.close-btn').addEventListener('click', () => this.remove());
        this.querySelector('.home-btn').addEventListener('click', () => this._dispatch('goHome'));
        this.querySelector('.wrong-btn').addEventListener('click', () => {
            const wrong = this._questions.filter(q => !q.isCorrect);
            this._dispatch('restartWithWrongQuestions', { questions: wrong });
            this.remove();
        });
    }

    _filterAndRender(filterType) {
        const filtered = this._questions.filter(q =>
            filterType === 'correct' ? q.isCorrect : !q.isCorrect
        );
        this._renderItems(filtered);
    }

    _dispatch(eventName, detail = {}) {
        this.dispatchEvent(new CustomEvent(eventName, {
            detail,
            bubbles: true,
            composed: true,
        }));
    }

    disconnectedCallback() {
        this.innerHTML    = '';
        this._questions   = [];
    }
}

customElements.define('result-modal', ResultModal);