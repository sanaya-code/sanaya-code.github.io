class QuizController {
    constructor() {
        this._state   = new QuizState();
        this._service = new QuizService();
        this._ui      = UIBundleFactory.create();
    }

    init() {
        this._bindAll(this._ui);

        try {
            const { questions, baseUrl } = SessionStorageService.loadQuizData();
            this._state.initialize(questions, baseUrl);

            this._ui.indexPanelCtrl.setTotal(this._state.queList.length);
            this._ui.indexPanelCtrl.setCurrent(0);
            this._ui.wrapperCtrl.showQuestion(
                this._service.resolveQuestion(
                    this._state.currentQuestion,
                    this._state.baseUrl
                )
            );
        } catch (err) {
            this._ui.wrapperCtrl.showError(err.message);
        }
    }

    _bindAll(ui) {
        const navHandler     = new NavigationHandler(this._state, this._service, ui);
        const indexHandler   = new IndexPanelHandler(this._state, this._service, ui);
        const modalHandler   = new ResultModalHandler(this._state, this._service, ui);
        const wrapperHandler = new WrapperHandler(this._state, this._service, ui);

        ui.navPanelCtrl.bindEvents(
            () => navHandler._handlePrev(),
            () => navHandler._handleNext(),
            () => navHandler._handleMarkReview(),
            () => navHandler._handleSubmit()
        );
        ui.indexPanelCtrl.bindEvents(
            (e) => indexHandler._handleQuestionSelected(e)
        );
        ui.resultModalCtrl.bindEvents(
            ()  => modalHandler._handleGoHome(),
            (e) => modalHandler._handleRestartWrong(e)
        );
        ui.wrapperCtrl.bindEvents(
            (e) => wrapperHandler._handleKeydown(e),
            ()  => wrapperHandler._handleRestart()
        );
    }
}

document.addEventListener('DOMContentLoaded', () => new QuizController().init());