class QuizController {
    constructor() {
        this._state           = new QuizState();
        this._wrapperCtrl     = new QuestionWrapperController();
        this._indexPanelCtrl  = new IndexPanelController();
        this._resultModalCtrl = new ResultModalController();
    }

    async init() {
        new QuizEventHandler(this).bindAll();
        try {
            const queList = SessionStorageService.loadQuizData();
            this._state.initialize(queList);
            this._indexPanelCtrl.setTotal(this._state.getTotalQuestions());
            this._indexPanelCtrl.setCurrent(0);
            this._showCurrentQuestion();
        } catch (err) {
            this._showError(err.message);
        }
    }

    // ── Navigation ────────────────────────────────────────────

    navigateBy(step) {
        let newIndex = this._state.currentQuestionIndex + step;
        const total  = this._state.getTotalQuestions();
        if      (newIndex >= total) newIndex = 0;
        else if (newIndex < 0)      newIndex = total - 1;
        this.navigateTo(newIndex);
    }

    navigateTo(newIndex) {
        this._saveAndMarkCurrent();
        this._indexPanelCtrl.setCurrent(newIndex);
        this._state.moveToQuestion(this._wrapperCtrl.getUserAnswer(), newIndex);
        this._showCurrentQuestion();
    }

    // ── Actions ───────────────────────────────────────────────

    toggleMarkReview() {
        const curr = this._state.userAnswers[this._state.currentQuestionIndex];
        curr.isMarked = !curr.isMarked;
    }

    submitQuiz() {
        if (!confirm('Are you sure you want to submit the quiz?')) return;
        this._saveAndMarkCurrent();
        const evaluator  = new QuizResultEvaluator(this._state.queList, this._state.userAnswers);
        const resultJson = evaluator.getResultJson();
        this._resultModalCtrl.show(resultJson);
    }

    restartQuiz() {
        this._state.reset();
        this._indexPanelCtrl.markAllUnanswered();
        this._indexPanelCtrl.setCurrent(0);
        this._showCurrentQuestion();
        window.scrollTo(0, 0);
    }

    restartWithWrong(questions) {
        this._state.initialize(questions);
        this._indexPanelCtrl.removePanel();

        const newPanel = document.createElement('question-index-panel');
        newPanel.id = 'index-panel';
        document.getElementById('quiz-container').appendChild(newPanel);
        this._indexPanelCtrl = new IndexPanelController();
        this._indexPanelCtrl.setTotal(this._state.getTotalQuestions());
        this._indexPanelCtrl.setCurrent(0);

        this._showCurrentQuestion();
    }

    // ── Private ───────────────────────────────────────────────

    _showCurrentQuestion() {
        this._wrapperCtrl.showQuestion(this._state.currentQuestion);
    }

    _saveAndMarkCurrent() {
        const answer = this._wrapperCtrl.getUserAnswer();
        const index  = this._state.currentQuestionIndex;
        const status = this._state.isAnswerEmpty(answer) ? 'not-answered' : 'answered';
        this._state.saveCurrentAnswer(answer);
        this._indexPanelCtrl.updateStatus(index, status);
    }

    _showError(message) {
        document.getElementById('question-wrapper').innerHTML = `
            <div class="error">
                <p>⚠️ Could not load quiz.</p>
                <p>${message}</p>
                <a href="../home/index.html" class="nav-link">← Go back to Home</a>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => new QuizController().init());