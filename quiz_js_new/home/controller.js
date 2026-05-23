class HomeController {
    constructor() {
        this._remoteLoader      = new RemoteJsonLoader();
        this._state             = new HomeState();
        this._gradeSubjectsCtrl = new GradeSubjectsController();
    }

    async init() {
        new HomeEventHandler(
            this._remoteLoader,
            this._state,
            this._gradeSubjectsCtrl
        ).bindAll();
        await this._loadGradeSubjects();
    }

    async _loadGradeSubjects() {
        if (BrowserEnvironment.isLocal()) {
            this._gradeSubjectsCtrl.hide();
            return;
        }
        try {
            const data   = await this._remoteLoader.fetch(HomeConfig.URLS.INFO_SUBJECTS);
            const grades = data?.grades || {};
            this._gradeSubjectsCtrl.setConfig(grades);
        } catch (err) {
            console.warn('Could not load grade subjects:', err.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new HomeController().init());