class ResultModalHandler {
    constructor(state, service, ui) {
        this._state   = state;
        this._service = service;
        this._ui      = ui;
    }

    _handleGoHome() {
        window.location.href = QuizConfig.URLS.HOME_PAGE;
    }

    _handleRestartWrong(e) {
        // state change
        const baseUrl = this._state.baseUrl;
        this._state.initialize(e.detail.questions, baseUrl);

        // service
        const question = this._service.resolveQuestion(
            this._state.currentQuestion,
            this._state.baseUrl
        );

        // UI
        this._ui.indexPanelCtrl.rebuildForQuestions(this._state.queList.length);
        this._ui.wrapperCtrl.showQuestion(question);
    }
}