class QuestionWrapper extends HTMLElement {

    constructor() {
        super();
        this._currentComponent = null;
        this._typeToTagMap = {
            mcq: 'mcq-radio',
        };
    }

    static get observedAttributes() {
        return ['question-data'];
    }

    connectedCallback() {
        this._renderFromAttribute();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'question-data' && newValue) {
            this._renderFromAttribute();
        }
    }

    // ── Render ────────────────────────────────────────────────

    _renderFromAttribute() {
        let data = {};
        try {
            data = JSON.parse(this.getAttribute('question-data') || '{}');
        } catch (e) {
            console.warn('QuestionWrapper: invalid question-data JSON', e);
            return;
        }
        this._renderComponent(data);
    }

    _renderComponent(data) {
        if (!data?.type) {
            console.warn('QuestionWrapper: missing type in question data');
            return;
        }

        const tag = this._typeToTagMap[data.type];
        if (!tag) {
            console.warn(`QuestionWrapper: unknown question type "${data.type}"`);
            return;
        }

        this._cleanup();

        const component = document.createElement(tag);
        component.setAttribute('config', JSON.stringify(data));
        this._currentComponent = component;
        this.appendChild(component);
    }

    // ── Public API ────────────────────────────────────────────

    getUserAnswer() {
        if (this._currentComponent && typeof this._currentComponent.getUserAnswer === 'function') {
            return this._currentComponent.getUserAnswer();
        }
        console.warn('QuestionWrapper: current component has no getUserAnswer()');
        return null;
    }

    // ── Private ───────────────────────────────────────────────

    _cleanup() {
        if (!this._currentComponent) return;
        if (typeof this._currentComponent.cleanup === 'function') {
            this._currentComponent.cleanup();
        }
        if (this.contains(this._currentComponent)) {
            this.removeChild(this._currentComponent);
        }
        this._currentComponent = null;
    }

    disconnectedCallback() {
        this._cleanup();
    }
}

customElements.define('question-wrapper', QuestionWrapper);