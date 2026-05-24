class QuizState {
    constructor() {
        this.queList              = [];
        this.baseUrl              = '';
        this.currentQuestionIndex = 0;
        this.currentQuestion      = null;
        this.userAnswers          = {};
    }

    // ── Init ──────────────────────────────────────────────────

    initialize(queList, baseUrl = '') {
        this.queList = queList;
        this.baseUrl = baseUrl;
        this._setCurrentQuestion(0);
        this._initializeUserAnswers();
        this._clearUserResponses();
    }

    reset() {
        this._setCurrentQuestion(0);
        this._initializeUserAnswers();
        this._clearUserResponses();
    }

    // ── Setters ───────────────────────────────────────────────

    saveCurrentAnswer(userResponse) {
        this.queList[this.currentQuestionIndex]['user_response'] = userResponse;
        this.userAnswers[this.currentQuestionIndex].answer       = userResponse;
    }

    setCurrentQuestion(index) {
        this._setCurrentQuestion(index);
    }

    toggleMarkReview() {
        const curr = this.userAnswers[this.currentQuestionIndex];
        curr.isMarked = !curr.isMarked;
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