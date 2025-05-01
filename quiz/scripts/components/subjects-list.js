class GradeSubjects extends HTMLElement {
    constructor() {
        super();
        this._grades = {};
        this._selectEl = null;
        this._linksEl = null;
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
                <label for="grade-select">Select Grade:</label>
                <select id="grade-select">
                    <option value="">-- Select Grade --</option>
                </select>
                <div id="subject-links" class="subject-links"></div>
            </div>
        `;
        this._selectEl = this.querySelector('#grade-select');
        this._linksEl = this.querySelector('#subject-links');

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
        // Clear previous options (except the default one)
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
        this._linksEl.innerHTML = '';

        if (!grade || !this._grades[grade]) return;

        const { subjects, url } = this._grades[grade];

        subjects.forEach(subject => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = subject;
            a.className = 'subject-link';
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.dispatchSubjectSelected(grade, subject, url);
            });
            this._linksEl.appendChild(a);
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
