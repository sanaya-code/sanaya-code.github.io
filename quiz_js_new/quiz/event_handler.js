class QuizEventHandler {
    constructor(quizCtrl, wrapperCtrl, navPanelCtrl, indexPanelCtrl, resultModalCtrl) {
        this._quizCtrl        = quizCtrl;
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

    _handlePrev()              { this._quizCtrl.navigateBy(-1); }
    _handleNext()              { this._quizCtrl.navigateBy(1); }
    _handleMarkReview()        { this._quizCtrl.toggleMarkReview(); }
    _handleSubmit()            { this._quizCtrl.submitQuiz(); }
    _handleRestart()           { this._quizCtrl.restartQuiz(); }
    _handleGoHome()            { window.location.href = QuizConfig.URLS.HOME_PAGE; }
    _handleQuestionSelected(e) { this._quizCtrl.navigateTo(e.detail.index); }
    _handleRestartWrong(e)     { this._quizCtrl.restartWithWrong(e.detail.questions); }

    _handleKeydown(e) {
        if (e.key === 'Enter' && this._wrapperCtrl.hasCheckedRadio()) {
            this._navPanelCtrl.focusNextButton();
        }
        if (e.key === 'Control') this._quizCtrl.navigateBy(-1);
    }
}