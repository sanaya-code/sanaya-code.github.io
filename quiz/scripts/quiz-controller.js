
class QuizController {
    constructor() {
        this.questions = [];
        this.currentIndex = 0;
        this.answers = {};
        this.panel = document.getElementById('panel-1');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
    }

    getSessionJsonData() 
    {
        const data = sessionStorage.getItem('customQuizData');
        if (!data) throw new Error('No custom quiz data found');
        const questionsList = JSON.parse(data).questions || [];
        if (!questionsList.length) throw new Error('No questions found');
        return(questionsList);
    }

    async getRemoteJsonData() 
    {
        const urlParams = new URLSearchParams(window.location.search);
        const subject = urlParams.get('subject');
        console.log("urlParams = ", urlParams, " subject = ", subject, " path =", `data/${subject}.json`);
        const response = await fetch(`data/${subject}.json`);
        const data = await response.json();
        const questionsList = data.questions || [];
        if (!questionsList.length) throw new Error('No questions found');
        return(questionsList);
    }

    async setQuestionsList()
    {
        const urlParams = new URLSearchParams(window.location.search);
        const source = urlParams.get('source');
        if (source === 'custom') 
        {
            this.questions  =   this.getSessionJsonData();
        } 
        else 
        {
            console.log("remote json data fetching code not written");
            /*
            this.quizState.queList  =   await this.getRemoteJsonData();
            console.log(this.quizState.queList)
            */
        }
    }

    async init() {
        /*
        const urlParams = new URLSearchParams(window.location.search);
        const subject = urlParams.get('subject');
        const localData = localStorage.getItem('custom');

        if (localData) {
            this.questions = JSON.parse(localData).questions || [];
            localStorage.removeItem('customQuiz');
        } else if (subject) {
            await this.loadRemoteQuestions(subject);
        }
        */

        await this.setQuestionsList();
        console.log(this.questions);

        this.renderQuestion();
        this.attachEventListeners();
    }

    async loadRemoteQuestions(subject) {
        try {
            const response = await fetch(`data/${subject}.json`);
            const data = await response.json();
            this.questions = data.questions || [];
        } catch (err) {
            alert("Failed to load questions. Please try again.");
            console.error(err);
        }
    }

    attachEventListeners() {
        this.prevBtn.addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.saveAnswer();
                this.currentIndex--;
                this.renderQuestion();
            }
        });

        this.nextBtn.addEventListener('click', () => {
            if (this.currentIndex < this.questions.length - 1) {
                this.saveAnswer();
                this.currentIndex++;
                this.renderQuestion();
            }
        });
    }

    renderQuestion() {
        const question = this.questions[this.currentIndex];
        this.panel.innerHTML = '';

        let component;
        switch (question.type) {
            case 'mcq':
                component = document.createElement('mcq-question');
                break;
            case 'fill_in_blank':
                component = document.createElement('fill-in-blank-question');
                break;
            case 'true_false':
                component = document.createElement('true-false-question');
                break;
            default:
                this.panel.innerHTML = `<p>Unsupported question type: ${question.type}</p>`;
                return;
        }

        console.log(component);
        component.data = question;
        /*
        component.setAttribute('data-question', JSON.stringify(question));
        if (this.answers[question.id]) {
            component.setAttribute('data-answer', JSON.stringify(this.answers[question.id]));
        }
        */
        this.panel.appendChild(component);
    }

    saveAnswer() {
        const component = this.panel.querySelector('mcq-question, fill-in-blank-question, true-false-question');
        if (component && typeof component.getAnswer === 'function') {
            const questionId = this.questions[this.currentIndex].id;
            this.answers[questionId] = component.getAnswer();
        }
    }
}

console.log(" hello");


window.addEventListener('DOMContentLoaded', () => {
    const controller = new QuizController();
    controller.init();
});


