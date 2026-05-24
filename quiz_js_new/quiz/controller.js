class QuizController {
    constructor() {
        this._state   = new QuizState();
        this._service = new QuizService();
        this._ui      = UIBundleFactory.create();
    }

    init() {
        const handler = new QuizEventHandler(this._state, this._service, this._ui);
        this._bindAll(handler, this._ui);

        try {
            const { questions, baseUrl } = SessionStorageService.loadQuizData();
            this._state.initialize(questions, baseUrl);

            this._ui.indexPanelCtrl.setTotal(this._state.queList.length);
            this._ui.indexPanelCtrl.setCurrent(0);
            this._ui.wrapperCtrl.showQuestion(this._service.resolveQuestion(this._state));
        } catch (err) {
            this._ui.wrapperCtrl.showError(err.message);
        }
    }

    _bindAll(handler, ui) {
        ui.navPanelCtrl.bindEvents(
            ()  => handler._handlePrev(),
            ()  => handler._handleNext(),
            ()  => handler._handleMarkReview(),
            ()  => handler._handleSubmit()
        );
        ui.indexPanelCtrl.bindEvents(
            (e) => handler._handleQuestionSelected(e)
        );
        ui.resultModalCtrl.bindEvents(
            ()  => handler._handleGoHome(),
            (e) => handler._handleRestartWrong(e)
        );
        ui.wrapperCtrl.bindEvents(
            (e) => handler._handleKeydown(e),
            ()  => handler._handleRestart()
        );
    }
}

document.addEventListener('DOMContentLoaded', () => new QuizController().init());