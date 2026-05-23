class QuestionWrapperController {
    constructor() {
        this._el = document.getElementById('question-wrapper');
    }

    showQuestion(questionData) {
        this._el.setAttribute('question-data', JSON.stringify(questionData));
    }

    getUserAnswer() {
        return this._el.getUserAnswer();
    }
}