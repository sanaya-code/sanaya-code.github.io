class IndexPanelController {
    constructor() {
        this._el = document.getElementById('index-panel');
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
}