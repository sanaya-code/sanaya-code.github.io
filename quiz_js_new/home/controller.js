class HomeController {
    constructor() {
        this._remoteLoader = new RemoteJsonLoader();
    }

    async init() {
        new HomeEventHandler(this._remoteLoader).bindAll();
        await this._loadGradeSubjects();
    }

    async _loadGradeSubjects() {
        if (BrowserEnvironment.isLocal()) {
            console.log('Local mode: skipping remote fetch of grade-subjects.');
            return;
        }
        try {
            const infoData = await this._remoteLoader.fetch(HomeConfig.URLS.INFO_SUBJECTS);
            const gradeSubjectsEl = document.createElement('grade-subjects');
            gradeSubjectsEl.setAttribute('config', JSON.stringify(infoData));
            document.getElementById('grade-subjects-container')?.appendChild(gradeSubjectsEl);
        } catch (err) {
            console.warn('Could not load grade subjects:', err.message);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new HomeController().init());