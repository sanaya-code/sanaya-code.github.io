class QuizEventHandler {
    constructor(state, service, wrapperCtrl, navPanelCtrl, indexPanelCtrl, resultModalCtrl) {
        this._state           = state;
        this._service         = service;
        this._wrapperCtrl     = wrapperCtrl;
        this._navPanelCtrl    = navPanelCtrl;
        this._indexPanelCtrl  = indexPanelCtrl;
        this._resultModalCtrl = resultModalCtrl;
    }

    bindAll() {
        this._navPanelCtrl.bindEvents(
            ()  => this._handlePrev(),
            ()  => this._handleNext(),
            ()  => this._handleMarkReview(),
            ()  => this._handleSubmit()
        );
        this._indexPanelCtrl.bindEvents(
            (e) => this._handleQuestionSelected(e)
        );
        this._resultModalCtrl.bindEvents(
            ()  => this._handleGoHome(),
            (e) => this._handleRestartWrong(e)
        );
        this._wrapperCtrl.bindEvents(
            (e) => this._handleKeydown(e),
            ()  => this._handleRestart()
        );
    }

    // ── Handlers ──────────────────────────────────────────────

    _handleNext() {
        this._navigateBy(1);
    }

    _handlePrev() {
        this._navigateBy(-1);
    }

    _handleQuestionSelected(e) {
        this._navigateTo(e.detail.index);
    }

    _handleMarkReview() {
        // state change
        this._state.toggleMarkReview();
    }

    _handleSubmit() {
        if (!confirm('Are you sure you want to submit the quiz?')) return;

        // state change
        const answer = this._wrapperCtrl.getUserAnswer();
        const index  = this._state.currentQuestionIndex;
        this._state.saveCurrentAnswer(answer);

        // service
        const status     = this._service.getAnswerStatus(answer);
        const resultJson = this._service.getResultJson(this._state);

        // UI
        this._indexPanelCtrl.updateStatus(index, status);
        this._resultModalCtrl.show(resultJson);
    }

    _handleRestart() {
        if (!confirm('Are you sure you want to restart this quiz?')) return;

        // state change
        this._state.reset();

        // service
        const question = this._service.resolveQuestion(this._state);

        // UI
        this._indexPanelCtrl.markAllUnanswered();
        this._indexPanelCtrl.setCurrent(0);
        this._wrapperCtrl.showQuestion(question);
        window.scrollTo(0, 0);
    }

    _handleRestartWrong(e) {
        // state change
        const baseUrl = this._state.baseUrl;
        this._state.initialize(e.detail.questions, baseUrl);

        // service
        const question = this._service.resolveQuestion(this._state);

        // UI
        this._indexPanelCtrl.rebuildForQuestions(this._state.queList.length);
        this._wrapperCtrl.showQuestion(question);
    }

    _handleGoHome() {
        window.location.href = QuizConfig.URLS.HOME_PAGE;
    }

    _handleKeydown(e) {
        if (e.key === 'Enter' && this._wrapperCtrl.hasCheckedRadio()) {
            this._navPanelCtrl.focusNextButton();
        }
        if (e.key === 'Control') this._navigateBy(-1);
    }

    // ── Shared navigation logic ───────────────────────────────

    _navigateBy(step) {
        // service
        const newIndex = this._service.getNextIndex(this._state, step);
        this._navigateTo(newIndex);
    }

    _navigateTo(newIndex) {
        // state change
        const answer = this._wrapperCtrl.getUserAnswer();
        const index  = this._state.currentQuestionIndex;
        this._state.saveCurrentAnswer(answer);
        this._state.setCurrentQuestion(newIndex);

        // service
        const status   = this._service.getAnswerStatus(answer);
        const question = this._service.resolveQuestion(this._state);

        // UI
        this._indexPanelCtrl.updateStatus(index, status);
        this._indexPanelCtrl.setCurrent(newIndex);
        this._wrapperCtrl.showQuestion(question);
    }
}