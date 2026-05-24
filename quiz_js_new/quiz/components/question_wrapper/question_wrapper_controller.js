class QuestionWrapperController {
    constructor() {
        this._el = document.getElementById('question-wrapper');
    }

    bindEvents(onKeydown, onRestart) {
        document.addEventListener('keydown',      onKeydown);
        document.addEventListener('restart-quiz', onRestart);
    }

    showQuestion(questionData) {
        this._el.setAttribute('question-data', JSON.stringify(questionData));
    }

    getUserAnswer() {
        return this._el.getUserAnswer();
    }

    showError(message) {
        this._el.innerHTML = `
            <div class="error">
                <p>⚠️ Could not load quiz.</p>
                <p>${message}</p>
                <a href="../home/index.html" class="nav-link">← Go back to Home</a>
            </div>
        `;
    }

    hasCheckedRadio() {
        return !!this._el.querySelector('input[type="radio"]:checked');
    }
}