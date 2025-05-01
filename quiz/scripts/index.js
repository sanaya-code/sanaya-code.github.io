class QuizLoader {
    constructor() {
        this.loadQuizBtn = document.getElementById('loadQuizBtn');
        this.fileInput = document.getElementById('quizFile');
        this.init();
        this.listenToGradeSubjects();
    }

    init() {
        this.loadQuizBtn?.addEventListener('click', () => this.handleLoadQuiz());
    }

    handleLoadQuiz() {
        if (!this.fileInput || this.fileInput.files.length === 0) {
            alert('Please select a JSON file first');
            return;
        }

        const file = this.fileInput.files[0];
        this.readFile(file);
    }

    readFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const quizData = JSON.parse(e.target.result);
                this.storeAndRedirect(quizData);
            } catch (error) {
                alert('Error parsing JSON file: ' + error.message);
            }
        };

        reader.onerror = () => {
            alert('Error reading file');
        };

        reader.readAsText(file);
    }

    async loadFromUrl(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const quizData = await response.json();
            this.storeAndRedirect(quizData);
        } catch (err) {
            alert(`Failed to load quiz from "${url}": ${err.message}`);
        }
    }

    storeAndRedirect(quizData) {
        sessionStorage.setItem('customQuizData', JSON.stringify(quizData));
        window.location.href = 'quiz.html?source=custom';
    }

    listenToGradeSubjects() {
        document.addEventListener('subjectSelected', (event) => {
            const { url, subject, grade } = event.detail;
            console.log(`Subject selected: ${subject} (Grade ${grade}), loading quiz from: ${url}`);
            this.loadFromUrl(url);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    new QuizLoader();

    // Load subjects from remote config and attach <grade-subjects>
    try {
        if (!QuizDataLoader.isLocal()) {
            const infoData = await QuizDataLoader.fetchInfoSubjects();
            const gradeSubjectsEl = document.createElement('grade-subjects');
            gradeSubjectsEl.setAttribute('config', JSON.stringify(infoData));

            // Append it to the div under h1 (assumes it's the first <div> in .container)
            const containerDivs = document.querySelector('.container').querySelectorAll('div');
            if (containerDivs.length > 0) {
                containerDivs[0].appendChild(gradeSubjectsEl);
            }
        } else {
            console.log('Local mode: skipping remote fetch of grade-subjects.');
        }
    } catch (err) {
        console.warn('Could not load grade subjects:', err.message);
    }
});
