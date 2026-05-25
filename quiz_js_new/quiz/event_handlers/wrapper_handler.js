class WrapperHandler {
    constructor(state, service, ui) {
        this._state   = state;
        this._service = service;
        this._ui      = ui;
    }

    _handleRestart() {
        if (!confirm('Are you sure you want to restart this quiz?')) return;

        // state change
        this._state.reset();

        // service
        const question = this._service.resolveQuestion(
            this._state.currentQuestion,
            this._state.baseUrl
        );

        // UI
        this._ui.indexPanelCtrl.markAllUnanswered();
        this._ui.indexPanelCtrl.setCurrent(0);
        this._ui.wrapperCtrl.showQuestion(question);
        window.scrollTo(0, 0);
    }

    _handleKeydown(e) {
        if (e.key === 'Enter' && this._ui.wrapperCtrl.hasCheckedRadio()) {
            this._ui.navPanelCtrl.focusNextButton();
        }
        if (e.key === 'Control') {
            const newIndex = this._service.getNextIndex(
                this._state.currentQuestionIndex,
                this._state.queList.length,
                -1
            );
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
}