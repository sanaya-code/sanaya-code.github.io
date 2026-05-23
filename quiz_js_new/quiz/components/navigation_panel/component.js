class NavigationPanel extends HTMLElement {

    connectedCallback() {
        this._render();
    }

    _render() {
        this.innerHTML = `
            <div class="navigation-panel">
                <button id="prev-btn">Previous</button>
                <button id="mark-review">Mark for Review</button>
                <button id="next-btn">Next</button>
                <button id="submit-quiz">Submit Quiz</button>
            </div>
        `;
        this._bindEvents();
    }

    _bindEvents() {
        this.querySelector('#prev-btn').addEventListener('click', () =>
            this._dispatch('nav-prev'));
        this.querySelector('#next-btn').addEventListener('click', () =>
            this._dispatch('nav-next'));
        this.querySelector('#mark-review').addEventListener('click', () =>
            this._dispatch('nav-mark-review'));
        this.querySelector('#submit-quiz').addEventListener('click', () =>
            this._dispatch('nav-submit'));
    }

    _dispatch(eventName) {
        this.dispatchEvent(new CustomEvent(eventName, { bubbles: true }));
    }
}

customElements.define('navigation-panel', NavigationPanel);