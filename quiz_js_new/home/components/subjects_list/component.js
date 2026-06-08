class GradeSubjects extends HTMLElement {

    constructor() {
        super();
        this._grades = {};
        this._selectEl = null;
        this._subjectOptionsEl = null;
    }

    static get observedAttributes() {
        return ['config', 'topics'];
    }

    connectedCallback() {
        this._render();
        this._loadFromConfig();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config' && oldValue !== newValue) {
            this._loadFromConfig();
        } else if (name === 'topics' && oldValue !== newValue) {
            this._updateTopicSelector(JSON.parse(newValue || '[]'));
        }
    }

    //  ── Render ────────────────────────────────────────────────

    _render() {
        this.innerHTML = `
            <h3>Choose a Grade</h3>
            <div class="grade-subjects">
                <select id="grade-select">
                    <option value="">-- Select Grade --</option>
                </select>
                <div id="subject-options" class="subject-options"></div>
            </div>
        `;
        this._selectEl         = this.querySelector('#grade-select');
        this._subjectOptionsEl = this.querySelector('#subject-options');
        this._selectEl.addEventListener('change', () => this._onGradeChange());
    }

    // ── Config ────────────────────────────────────────────────

    _loadFromConfig() {
        try {
            this._grades = JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('GradeSubjects: invalid config JSON', e);
            return;
        }
        this._populateGradeDropdown();
    }

    // ── Grade dropdown ────────────────────────────────────────

    _populateGradeDropdown() {
        this._selectEl.innerHTML = `<option value="">-- Select Grade --</option>`;
        Object.keys(this._grades).forEach(grade => {
            const opt = document.createElement('option');
            opt.value = grade;
            opt.textContent = `Grade ${grade}`;
            this._selectEl.appendChild(opt);
        });
    }

    _onGradeChange() {
        const grade = this._selectEl.value;
        this._clearSubjects();
        this._clearTopicSelector();
        if (grade) this._renderSubjects(grade);
        this._dispatchGradeSelected(grade);
    }

    // ── Subject radios ────────────────────────────────────────

    _renderSubjects(grade) {
        const { subjects, url } = this._grades[grade];
        subjects.forEach((subject, index) => {
            const wrapper = this._createSubjectRadio(grade, subject, index, url);
            this._subjectOptionsEl.appendChild(wrapper);
        });
    }

    _createSubjectRadio(grade, subject, index, url) {
        const id = `subject-${grade}-${index}`;

        const wrapper = document.createElement('div');
        wrapper.className = 'radio-wrapper';

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = `subject-${grade}`;
        input.id = id;
        input.value = subject;
        input.addEventListener('change', () => this._dispatchSubjectSelected(grade, subject, url));

        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = subject;

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        return wrapper;
    }

    _clearSubjects() {
        this._subjectOptionsEl.innerHTML = '';
    }

    // ── Topic selector ────────────────────────────────────────

    _updateTopicSelector(topics) {
        let topicSelector = this.querySelector('topic-selector');
        if (!topicSelector) {
            topicSelector = document.createElement('topic-selector');
            this.querySelector('.grade-subjects').appendChild(topicSelector);
        }
        topicSelector.setAttribute('config', JSON.stringify(topics));
    }

    _clearTopicSelector() {
        const topicSelector = this.querySelector('topic-selector');
        if (topicSelector) topicSelector.setAttribute('config', JSON.stringify([]));
    }

    // ── Events ────────────────────────────────────────────────

    _dispatchGradeSelected(grade) {
        this.dispatchEvent(new CustomEvent('gradeSelected', {
            detail: { grade },
            bubbles: true,
        }));
    }

    _dispatchSubjectSelected(grade, subject, url) {
        this.dispatchEvent(new CustomEvent('subjectSelected', {
            detail: { grade, subject, url },
            bubbles: true,
        }));
    }
}

customElements.define('grade-subjects', GradeSubjects);