class QuizLoader {
    constructor() {
        this.loadQuizBtn = document.getElementById('loadQuizBtn');
        this.fileInput = document.getElementById('quizFile');
        this.init();
        this.listenToSubjectSelected();
        this.listenToTopicSelected();
        this.listenToGradeSelected();
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

    async fetchRemoteJson(url) {
        try {
            // return await QuizDataLoader.fetchQuizFromUrl(url);
            return await QuizDataLoader.fetchQuizFromCashUrl(url);
        } catch (err) {
            alert(`Failed to load quiz from "${url}": ${err.message}`);
            return null;
        }
    }

    storeAndRedirect(quizData) {
        sessionStorage.setItem('customQuizData', JSON.stringify(quizData));
        window.location.href = 'quiz.html?source=custom';
    }

    listenToGradeSelected() {

        document.addEventListener('gradeSelected', async (event) => {
            console.log(event.detail);

            const container = document.querySelector('.container');
            const topicSelector = container?.querySelector('topic-selector');
            if (topicSelector) {
                
                topicSelector.setAttribute('config', JSON.stringify([]));
            }

        });
    }

    listenToSubjectSelected() {
        document.addEventListener('subjectSelected', async (event) => {
            const { url, subject, grade } = event.detail;
            console.log(`Subject selected: ${subject} (Grade ${grade}), loading quiz from: ${url}`);
            
            const jsonFile = await this.fetchRemoteJson(url);
            console.log(jsonFile);
            
            if (jsonFile && jsonFile.subjects) {
                const subjectData = jsonFile.subjects[subject]; // Access via jsonFile.subjects[subject]
                console.log(subjectData);

                // Try to find existing topic-selector in the container
                const container = document.querySelector('.container');
                let topicSelector = container?.querySelector('topic-selector');
                
                if (subjectData) {
                    if (topicSelector) {
                        // Update existing component
                        topicSelector.setAttribute('config', JSON.stringify(subjectData));
                    } else {
                        // Create new component
                        topicSelector = document.createElement('topic-selector');
                        topicSelector.setAttribute('config', JSON.stringify(subjectData));
                        
                        // Add to first div in container (or container itself if no divs)
                        const target = container?.querySelector('div') || container;
                        if (target) {
                            target.appendChild(topicSelector);
                        } 
                        else {
                            console.error('Container or container div not found');
                        }
                    }
                } 
                else {
                    console.error(`Subject "${subject}" not found in the data.`);
                    if (topicSelector) {
                        topicSelector.setAttribute('config', JSON.stringify([]));
                    }
                }
            } else {
                console.error("Invalid JSON structure or missing 'subjects' key.");
            }
        });
    }

    listenToTopicSelected() {
        document.addEventListener('topicSelected', async (event) => {
            const url = event.detail.link;
            console.log(url);

            const quizData = await this.fetchRemoteJson(url);
            console.log(quizData);
            
            if (quizData) {
                try {
                    this.storeAndRedirect(quizData);
                } catch (error) {
                    alert('Error parsing JSON file: ' + error.message);
                }

            }else {
                console.error(" JSON not found");
            }
        });
    }
}

let obj = null;
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    obj = new QuizLoader();

    // Load subjects from remote config and attach <grade-subjects>
    try {
        if (!QuizDataLoader.isLocal()) {
            // const infoData = await QuizDataLoader.fetchInfoSubjects();
            const url = 'https://sanaya-code.github.io/quiz/data/info/info_subjects.json';
            const infoData = await obj.fetchRemoteJson(url);
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
