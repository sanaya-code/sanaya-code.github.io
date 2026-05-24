class IndexPanelController {
    constructor() {
        this._el = document.getElementById('index-panel');
    }

    bindEvents(onQuestionSelected) {
        this._el.addEventListener('question-selected', onQuestionSelected);
    }

    setTotal(total) {
        this._el.setAttribute('total', total);
    }

    setCurrent(index) {
        this._el.setAttribute('current', String(index));
    }

    updateStatus(index, status) {
        this._el.setAttribute('update-status', JSON.stringify({ index, status }));
    }

    markAllUnanswered() {
        this._el.setAttribute('mark-all-unanswered', 'true');
    }

    removePanel() {
        this._el.setAttribute('remove-panel', 'true');
    }

    rebuildForQuestions(total) {
        this.removePanel();
        const newPanel = document.createElement('question-index-panel');
        newPanel.id = 'index-panel';
        document.getElementById('quiz-container').appendChild(newPanel);
        this._el = newPanel;
        this.setTotal(total);
        this.setCurrent(0);
    }
}