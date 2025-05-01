class QuizLoader {
    constructor() {
        this.loadQuizBtn = document.getElementById('loadQuizBtn');
        this.fileInput = document.getElementById('quizFile');
        this.init();
    }

    init() {
        this.loadQuizBtn.addEventListener('click', () => this.handleLoadQuiz());
    }

    handleLoadQuiz() {
        if (this.fileInput.files.length === 0) {
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

    storeAndRedirect(quizData) {
        sessionStorage.setItem('customQuizData', JSON.stringify(quizData));
        window.location.href = 'quiz.html?source=custom';
    }
}

// Initialize the QuizLoader when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuizLoader();
});