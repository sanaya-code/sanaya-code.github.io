class ModalComponent extends HTMLElement {
    static get observedAttributes() {
        return ['config'];
    }

    constructor() {
        super();
        this.container = document.createElement('div');
        this.appendChild(this.container);
        this._questions = [];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'config') {
            const data = JSON.parse(newValue);
            this._questions = Array.isArray(data.questions) ? data.questions : [];
            this.render(data);
        }
    }

    render(data) {
        if (!data || !data.summary) return;

        const { summary } = data;

        this.container.innerHTML = `
            <div class="result-modal" id="result-modal" style="display: block;">
                <div class="modal-content">
                    <div class="modal-actions">
                        <button id="close-modal" class="modal-buttons">Close</button>
                        <button id="wrong-modal" class="modal-buttons">Only Wrong</button>
                        <a href="index.html" class="button-link">Back to Home</a>
                    </div>
                    <h2>Quiz Results</h2>
                    <div class="score-summary">
                        <h3>Your Score: ${summary.scorePercentage}%</h3>
                        <p>${summary.correctAnswers} out of ${summary.totalQuestions} questions correct</p>
                    </div>
                    <div class="filter-options">
                        <label><input type="radio" name="filter" value="wrong" checked> Only Wrong</label>
                        <label><input type="radio" name="filter" value="correct"> Only Correct</label>
                    </div>
                    <div id="result-items-container"></div>
                </div>
            </div>
        `;

        this.filterAndRenderItems('wrong');

        const radios = this.container.querySelectorAll('input[name="filter"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.filterAndRenderItems(e.target.value);
            });
        });
    }

    filterAndRenderItems(filterType) {
        const container = this.container.querySelector('#result-items-container');
        if (!container) return;

        const filtered = this._questions.filter(q =>
            filterType === 'correct' ? q.isCorrect : !q.isCorrect
        );

        container.innerHTML = filtered.map(q => `
            <div class="result-item ${q.isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>Question ${q.number}:</strong> ${q.question}</p>
                <p><strong>Your answer:</strong> ${q.userAnswer}</p>
                <p><strong>Correct/incorrect answer:</strong> ${q.correctAnswer}</p>
                ${q.explanation ? `<p><strong>Explanation:</strong> ${q.explanation}</p>` : ''}
            </div>
        `).join('');
    }

    disconnectedCallback() {
        this.container.innerHTML = '';
        this._questions = [];
    }
}

customElements.define('modal-component', ModalComponent);

/*

const testData = this.quizState.getResultJson();
console.log(testData);
const modal =  new ModalComponent();
document.body.appendChild(modal);
modal.setAttribute('config', JSON.stringify(testData));


<modal-component id="resultModal"></modal-component>


function test() {
    
    if (!customElements.get('modal-component')) {
        console.error('modal-component is not defined.');
        return;
    }
    // Create and add component to the DOM
    const modal =  new ModalComponent();
    document.body.appendChild(modal);

    // Sample data
    const testData = {
        summary: {
            scorePercentage: 50,
            correctAnswers: 2,
            totalQuestions: 4
        },
        questions: [
            { number: 1, question: "What is 1+1?", userAnswer: "2", correctAnswer: "2", explanation: "Simple math", isCorrect: true },
            { number: 2, question: "What is the capital of Spain?", userAnswer: "Barcelona", correctAnswer: "Madrid", explanation: "", isCorrect: false },
            { number: 3, question: "Sun rises in the?", userAnswer: "East", correctAnswer: "East", explanation: "", isCorrect: true },
            { number: 4, question: "Water boils at?", userAnswer: "90°C", correctAnswer: "100°C", explanation: "Standard boiling point", isCorrect: false }
        ]
    };

    // Set config attribute
    modal.setAttribute('config', JSON.stringify(testData));

    // Optional: simulate user clicking "Only Correct"
    setTimeout(() => {
        const correctRadio = modal.querySelector('input[value="correct"]');
        if (correctRadio) correctRadio.click();
    }, 1000);

    // Optional: simulate user clicking "Only Wrong"
    setTimeout(() => {
        const wrongRadio = modal.querySelector('input[value="wrong"]');
        if (wrongRadio) wrongRadio.click();
    }, 2000);
}







*/