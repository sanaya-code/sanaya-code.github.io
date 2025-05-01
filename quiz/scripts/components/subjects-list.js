// changed

class GradeSubjects extends HTMLElement {
    constructor() {
        super();
        this._grades = {};
        this._selectEl = null;
        this._radiosEl = null;
    }

    static get observedAttributes() {
        return ['config'];
    }

    connectedCallback() {
        this.render();
        this.loadFromConfig();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config' && oldValue !== newValue) {
            this.loadFromConfig();
        }
    }

    render() {
        this.innerHTML = `
            <div class="grade-subjects">
                <select id="grade-select">
                    <option value="">-- Select Grade --</option>
                </select>
                <div id="subject-options" class="subject-options"></div>
            </div>
        `;
        this._selectEl = this.querySelector('#grade-select');
        this._radiosEl = this.querySelector('#subject-options');

        this._selectEl.addEventListener('change', () => this.updateSubjects());
    }

    loadFromConfig() {
        let config = {};
        try {
            config = JSON.parse(this.getAttribute('config') || '{}');
        } catch (e) {
            console.warn('Invalid config JSON for <grade-subjects>:', e);
            return;
        }

        this._grades = config.grades || {};
        this.populateDropdown();
    }

    populateDropdown() {
        this._selectEl.innerHTML = `<option value="">-- Select Grade --</option>`;
        for (const grade in this._grades) {
            const opt = document.createElement('option');
            opt.value = grade;
            opt.textContent = `Grade ${grade}`;
            this._selectEl.appendChild(opt);
        }
    }

    updateSubjects() {
        const grade = this._selectEl.value;
        this._radiosEl.innerHTML = '';

        if (!grade || !this._grades[grade]) return;

        const { subjects, url } = this._grades[grade];

        subjects.forEach((subject, index) => {
            const id = `subject-${index}`;
            const wrapper = document.createElement('div');
            wrapper.className = 'radio-wrapper';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'subject';
            input.id = id;
            input.value = subject;

            input.addEventListener('change', () => {
                this.dispatchSubjectSelected(grade, subject, url);
            });

            const label = document.createElement('label');
            label.setAttribute('for', id);
            label.textContent = subject;

            wrapper.appendChild(input);
            wrapper.appendChild(label);
            this._radiosEl.appendChild(wrapper);
        });
    }

    dispatchSubjectSelected(grade, subject, url) {
        this.dispatchEvent(new CustomEvent('subjectSelected', {
            detail: { grade, subject, url },
            bubbles: true
        }));
    }
}

customElements.define('grade-subjects', GradeSubjects);
