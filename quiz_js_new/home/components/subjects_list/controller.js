class GradeSubjectsController {
    constructor() {
        this._el = document.getElementById('grade-subjects');
    }

    hide() {
        this._el.style.display = 'none';
    }

    setConfig(grades) {
        this._el.setAttribute('config', JSON.stringify(grades));
    }

    setTopics(topics) {
        this._el.setAttribute('topics', JSON.stringify(topics));
    }
}