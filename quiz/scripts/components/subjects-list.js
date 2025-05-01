class GradeSubjects extends HTMLElement {
    constructor() {
        super();
        this._grades = {};
        this._selectEl = null;
        this._linksEl = null;
        this._configRaw = null;  // Store raw config here until ready
    }

    static get observedAttributes() {
        return ['config'];
    }

    connectedCallback() {
        this.render();
        this.loadFromConfig(); // Will now work because render() happened
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config' && oldValue !== newValue) {
            this._configRaw = newValue;
            if (this._selectEl) {
                this.loadFromConfig();
            }
        }
    }

    render() {
        this.innerHTML = `
            <div class="grade-subjects">
                <select id="grade-select">
                    <option value="">-- Select Grade --</option>
                </select>
                <div id="subject-links" class="subject-links"></div>
            </div>
        `;
        this._selectEl = this.querySelector('#grade-select');
        this._linksEl = this.querySelector('#subject-links');
    
        this._selectEl.addEventListener('change', () => this.updateSubjects());
    
        if (this._configRaw) {
            this.loadFromConfig(); // Now it's safe
        }
    }
    

    loadFromConfig() {
        let config = {};
        try {
            config = JSON.parse(this._configRaw || this.getAttribute('config') || '{}');
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
        this._linksEl.innerHTML = '';

        if (!grade || !this._grades[grade]) return;

        const { subjects, url } = this._grades[grade];

        subjects.forEach((subject, index) => {
            const label = document.createElement('label');
            label.className = 'subject-radio-label';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'subject-radio';
            input.value = subject;
            input.className = 'subject-radio';
            input.addEventListener('change', () => {
                this.dispatchSubjectSelected(grade, subject, url);
            });

            label.appendChild(input);
            label.appendChild(document.createTextNode(subject));
            this._linksEl.appendChild(label);
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
