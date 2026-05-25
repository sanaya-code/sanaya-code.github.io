class NavigationHandler {
    constructor(state, service, ui) {
        this._state   = state;
        this._service = service;
        this._ui      = ui;
    }

    _handleNext() {
        const newIndex = this._service.getNextIndex(
            this._state.currentQuestionIndex,
            this._state.queList.length,
            1
        );
        this._navigateTo(newIndex);
    }

    _handlePrev() {
        const newIndex = this._service.getNextIndex(
            this._state.currentQuestionIndex,
            this._state.queList.length,
            -1
        );
        this._navigateTo(newIndex);
    }

    _handleMarkReview() {
        // state change
        this._state.toggleMarkReview();
    }

    _handleSubmit() {
        if (!confirm('Are you sure you want to submit the quiz?')) return;

        // state change
        const answer = this._ui.wrapperCtrl.getUserAnswer();
        const index  = this._state.currentQuestionIndex;
        this._state.saveCurrentAnswer(answer);

        // service
        const status     = this._service.getAnswerStatus(answer);
        const resultJson = this._service.getResultJson(
            this._state.queList,
            this._state.userAnswers
        );

        // UI
        this._ui.indexPanelCtrl.updateStatus(index, status);
        this._ui.resultModalCtrl.show(resultJson);
    }

    _navigateTo(newIndex) {
        // state change
        const answer = this._ui.wrapperCtrl.getUserAnswer();
        const index  = this._state.currentQuestionIndex;
        this._state.saveCurrentAnswer(answer);
        this._state.setCurrentQuestion(newIndex);

        // service
        const status   = this._service.getAnswerStatus(answer);
        const question = this._service.resolveQuestion(
            this._state.currentQuestion,
            this._state.baseUrl
        );

        // UI
        this._ui.indexPanelCtrl.updateStatus(index, status);
        this._ui.indexPanelCtrl.setCurrent(newIndex);
        this._ui.wrapperCtrl.showQuestion(question);
    }
}