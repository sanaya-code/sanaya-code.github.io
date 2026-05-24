class NavigationPanelController {
    constructor() {
        this._el = document.getElementById('navigation-panel');
    }

    bindEvents(onPrev, onNext, onMarkReview, onSubmit) {
        this._el.addEventListener('nav-prev',        onPrev);
        this._el.addEventListener('nav-next',        onNext);
        this._el.addEventListener('nav-mark-review', onMarkReview);
        this._el.addEventListener('nav-submit',      onSubmit);
    }

    focusNextButton() {
        this._el.querySelector('#next-btn')?.focus();
    }
}