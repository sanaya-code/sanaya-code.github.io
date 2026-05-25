class IndexPanelHandler {
    constructor(state, service, ui) {
        this._state   = state;
        this._service = service;
        this._ui      = ui;
    }

    _handleQuestionSelected(e) {
        this._navigateTo(e.detail.index);
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