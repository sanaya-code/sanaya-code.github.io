class QuizController {
    constructor() {
        this._state           = new QuizState();
        this._service         = new QuizService();
        this._wrapperCtrl     = new QuestionWrapperController();
        this._indexPanelCtrl  = new IndexPanelController();
        this._navPanelCtrl    = new NavigationPanelController();
        this._resultModalCtrl = new ResultModalController();
    }

    init() {
        new QuizEventHandler(
            this._state,
            this._service,
            this._wrapperCtrl,
            this._navPanelCtrl,
            this._indexPanelCtrl,
            this._resultModalCtrl
        ).bindAll();

        try {
            const { questions, baseUrl } = SessionStorageService.loadQuizData();
            this._state.initialize(questions, baseUrl);

            // initial UI setup
            this._indexPanelCtrl.setTotal(this._state.queList.length);
            this._indexPanelCtrl.setCurrent(0);
            this._wrapperCtrl.showQuestion(this._service.resolveQuestion(this._state));
        } catch (err) {
            this._wrapperCtrl.showError(err.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new QuizController().init());