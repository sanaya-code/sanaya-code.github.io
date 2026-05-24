class HomeEventHandler {
    constructor(remoteLoader, state, gradeSubjectsCtrl) {
        this._remoteLoader      = remoteLoader;
        this._state             = state;
        this._gradeSubjectsCtrl = gradeSubjectsCtrl;
    }

    bindAll() {
        document.addEventListener('quizFileSelected', (e) => this._handleQuizFileSelected(e));
        document.addEventListener('subjectSelected',  (e) => this._handleSubjectSelected(e));
        document.addEventListener('topicSelected',    (e) => this._handleTopicSelected(e));
    }

    // ── Handlers ──────────────────────────────────────────────

    _handleQuizFileSelected(e) {
        FileReaderUtil.readJson(
            e.detail.file,
            (quizData) => SessionStorageService.saveAndRedirect(quizData, ''),
            (err) => alert(err.message)
        );
    }

    async _handleSubjectSelected(e) {
        const { url, subject } = e.detail;
        try {
            const json   = await this._loadSubjectJson(url);
            const topics = json?.subjects?.[subject] || [];
            this._gradeSubjectsCtrl.setTopics(topics);
        } catch (err) {
            alert(`Failed to load topics: ${err.message}`);
        }
    }

    async _handleTopicSelected(e) {
        const url     = e.detail.link;
        const baseUrl = this._getBaseUrl(url);
        try {
            const quizData = await this._remoteLoader.fetch(url);
            SessionStorageService.saveAndRedirect(quizData, baseUrl);
        } catch (err) {
            alert(`Failed to load quiz: ${err.message}`);
        }
    }

    // ── Helpers ───────────────────────────────────────────────

    async _loadSubjectJson(url) {
        if (this._state.hasSubjectJson(url)) {
            console.log('Using cached subject JSON for:', url);
            return this._state.getSubjectJson(url);
        }
        const data = await this._remoteLoader.fetch(url);
        this._state.saveSubjectJson(url, data);
        return data;
    }

    _getBaseUrl(url) {
        // "https://host/quiz/data/school/c1/maths/file.json"
        // → "https://host/quiz/data/school/c1/maths/"
        return url.substring(0, url.lastIndexOf('/') + 1);
    }
}