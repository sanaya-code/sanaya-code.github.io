class HomeState {
    constructor() {
        this._subjectJsonCache = {};
    }

    hasSubjectJson(url) {
        return url in this._subjectJsonCache;
    }

    getSubjectJson(url) {
        return this._subjectJsonCache[url] || null;
    }

    saveSubjectJson(url, data) {
        this._subjectJsonCache[url] = data;
    }
}