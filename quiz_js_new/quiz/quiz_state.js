class QuizState {
    constructor() {
        this.queList             = [];
        this.currentQuestionIndex = 0;
        this.currentQuestion     = null;
        this.userAnswers         = {};
    }

    initialize(queList) {
        this.queList = queList;
        this._setCurrentQuestion(0);
        this._initializeUserAnswers();
        this._clearUserResponses();
    }

    reset() {
        this._setCurrentQuestion(0);
        this._initializeUserAnswers();
        this._clearUserResponses();
    }

    saveCurrentAnswer(userResponse) {
        this.queList[this.currentQuestionIndex]['user_response']   = userResponse;
        this.userAnswers[this.currentQuestionIndex].answer         = userResponse;
    }

    moveToQuestion(currUserResponse, newIndex) {
        this.saveCurrentAnswer(currUserResponse);
        this._setCurrentQuestion(newIndex);
    }

    isAnswerEmpty(answer) {
        if (Array.isArray(answer))        return answer.length === 0 || answer.join('').trim() === '';
        if (typeof answer === 'string')   return answer.trim() === '';
        return answer == null;
    }

    getTotalQuestions() {
        return this.queList.length;
    }

    // ── Private ───────────────────────────────────────────────

    _setCurrentQuestion(index) {
        this.currentQuestionIndex = index;
        this.currentQuestion      = this.queList[index];
    }

    _initializeUserAnswers() {
        this.queList.forEach((_, i) => {
            this.userAnswers[i] = { answer: null, isCorrect: null, isMarked: false };
        });
    }

    _clearUserResponses() {
        this.queList.forEach(q => q['user_response'] = null);
    }
}