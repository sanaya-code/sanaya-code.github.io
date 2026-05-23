class CustomQuizLoader extends HTMLElement {
    constructor() {
        super();
        this._fileInput = null;
        this._btn = null;
    }

    connectedCallback() {
        this._render();
    }

    _render() {
        this.innerHTML = `
            <div class="custom-quiz">
                <h2>Or Load Your Own Quiz</h2>
                <input type="file" id="quizFile" accept=".json">
                <button id="loadQuizBtn">Start Custom Quiz</button>
            </div>
        `;
        this._fileInput = this.querySelector('#quizFile');
        this._btn = this.querySelector('#loadQuizBtn');
        this._btn.addEventListener('click', () => this._handleClick());
    }

    _handleClick() {
        if (!this._fileInput || this._fileInput.files.length === 0) {
            alert('Please select a JSON file first');
            return;
        }
        this.dispatchEvent(new CustomEvent('quizFileSelected', {
            detail: { file: this._fileInput.files[0] },
            bubbles: true,
        }));
    }
}

customElements.define('custom-quiz-loader', CustomQuizLoader);