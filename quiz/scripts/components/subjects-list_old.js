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
        // Ensure we only render once
        if (!this.innerHTML) {
            this.render();
        }
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

        // Only add event listener if element exists
        if (this._selectEl) {
            this._selectEl.addEventListener('change', () => this.updateSubjects());
        }
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
        
        // Only populate if select element exists
        if (this._selectEl) {
            this.populateDropdown();
        }
    }

    populateDropdown() {
        if (!this._selectEl) return;
        
        this._selectEl.innerHTML = `<option value="">-- Select Grade --</option>`;
        for (const grade in this._grades) {
            const opt = document.createElement('option');
            opt.value = grade;
            opt.textContent = `Grade ${grade}`;
            this._selectEl.appendChild(opt);
        }
    }

    updateSubjects() {
        if (!this._selectEl || !this._radiosEl) return;
        
        const grade = this._selectEl.value;
        this._radiosEl.innerHTML = '';

        if (!grade || !this._grades[grade]) {
            this._radiosEl.style.display = 'none';
            return;
        }

        const { subjects, url } = this._grades[grade];

        subjects.forEach((subject, index) => {
            const id = `subject-${grade}-${index}`;
            const wrapper = document.createElement('div');
            wrapper.className = 'radio-wrapper';
        
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `subject-${grade}`;
            input.id = id;
            input.value = subject;
        
            input.addEventListener('change', () => {
                this.dispatchSubjectSelected(grade, subject, url);
            });
        
            const label = document.createElement('label');
            label.htmlFor = id; // match input.id
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
