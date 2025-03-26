// Base Question Handler Class
class QuestionHandler {
    constructor(questionElementId) {
        this.questionElement = document.getElementById(questionElementId);
    }

    display(question, currentAnswer) {
        this.questionElement.style.display = 'block';
        const questionTextElement = this.questionElement.querySelector('.question-text');
        if (questionTextElement) {
            questionTextElement.textContent = question.question;
        }
        this.render(question, currentAnswer);
    }

    hide() {
        this.questionElement.style.display = 'none';
    }

    render() {
        throw new Error('render() must be implemented by subclass');
    }

    getAnswer() {
        throw new Error('getAnswer() must be implemented by subclass');
    }
}

// Individual Question Handlers
class MCQHandler extends QuestionHandler {
    constructor() {
        super('mcq-question');
        this.optionsContainer = document.getElementById('mcq-options');
    }

    render(question, currentAnswer) {
        this.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            
            const input = document.createElement('input');
            input.type = 'radio';
            input.name = 'mcq';
            input.id = `option-${index}`;
            input.value = option.id;
            if (currentAnswer === option.id) input.checked = true;
            
            const label = document.createElement('label');
            label.htmlFor = `option-${index}`;
            label.textContent = option.text;
            
            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            this.optionsContainer.appendChild(optionDiv);
        });
    }

    getAnswer() {
        const selected = this.questionElement.querySelector('input[type="radio"]:checked');
        return selected ? selected.value : null;
    }
}

class FillInBlankHandler extends QuestionHandler {
    constructor() {
        super('fill-question');
        this.input = document.getElementById('fill-answer');
    }

    render(question, currentAnswer) {
        this.input.value = currentAnswer || '';
    }

    getAnswer() {
        return this.input.value.trim();
    }
}

class TrueFalseHandler extends QuestionHandler {
    constructor() {
        super('tf-question');
    }

    render(question, currentAnswer) {
        document.getElementById('true-option').checked = currentAnswer === 'true';
        document.getElementById('false-option').checked = currentAnswer === 'false';
    }

    getAnswer() {
        const selected = this.questionElement.querySelector('input[type="radio"]:checked');
        return selected ? selected.value : null;
    }
}

class MatchingHandler extends QuestionHandler {
    constructor() {
        super('matching-question');
        this.pairsContainer = document.getElementById('matching-pairs');
    }

    render(question, currentAnswer) {
        this.pairsContainer.innerHTML = '';
        const allOptions = [...question.pairs.map(p => p.right), ...(question.distractors || [])];
        const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);

        question.pairs.forEach((pair, index) => {
            const pairDiv = document.createElement('div');
            pairDiv.className = 'matching-pair';
            
            const leftDiv = document.createElement('div');
            leftDiv.className = 'matching-left';
            leftDiv.textContent = pair.left;
            
            const select = document.createElement('select');
            select.className = 'matching-select';
            
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select match';
            select.appendChild(defaultOption);
            
            shuffledOptions.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                if (currentAnswer && currentAnswer[index] === option) {
                    optionElement.selected = true;
                }
                select.appendChild(optionElement);
            });
            
            pairDiv.appendChild(leftDiv);
            pairDiv.appendChild(select);
            this.pairsContainer.appendChild(pairDiv);
        });
    }

    getAnswer() {
        return Array.from(this.pairsContainer.querySelectorAll('select')).map(s => s.value);
    }
}

class ShortAnswerHandler extends QuestionHandler {
    constructor() {
        super('short-question');
        this.textarea = document.getElementById('short-answer');
    }

    render(question, currentAnswer) {
        this.textarea.value = currentAnswer || '';
    }

    getAnswer() {
        return this.textarea.value.trim();
    }
}

class MultiSelectHandler extends QuestionHandler {
    constructor() {
        super('multi-question');
        this.optionsContainer = document.getElementById('multi-options');
    }

    render(question, currentAnswer) {
        this.optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `multi-option-${index}`;
            input.value = option.id;
            if (currentAnswer && currentAnswer.includes(option.id)) input.checked = true;
            
            const label = document.createElement('label');
            label.htmlFor = `multi-option-${index}`;
            label.textContent = option.text;
            
            optionDiv.appendChild(input);
            optionDiv.appendChild(label);
            this.optionsContainer.appendChild(optionDiv);
        });
    }

    getAnswer() {
        return Array.from(this.optionsContainer.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
    }
}

class OrderingHandler extends QuestionHandler {
    constructor() {
        super('ordering-question');
        this.itemsContainer = document.getElementById('ordering-items');
        this.draggedItem = null;
    }

    render(question, currentAnswer) {
        this.itemsContainer.innerHTML = '';
        const items = currentAnswer && currentAnswer.length === question.items.length
            ? currentAnswer.map(id => question.items.find(i => i.id === id)).filter(i => i)
            : [...question.items].sort(() => Math.random() - 0.5);

        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'ordering-item';
            itemDiv.draggable = true;
            itemDiv.setAttribute('data-id', item.id);
            itemDiv.textContent = item.text;
            this.itemsContainer.appendChild(itemDiv);
        });

        this.setupDragAndDrop();
    }

    setupDragAndDrop() {
        const items = this.itemsContainer.querySelectorAll('.ordering-item');
        items.forEach(item => {
            item.addEventListener('dragstart', () => {
                this.draggedItem = item;
                setTimeout(() => item.style.opacity = '0.5', 0);
            });

            item.addEventListener('dragend', () => item.style.opacity = '1');
            item.addEventListener('dragover', e => e.preventDefault());
            item.addEventListener('dragenter', e => {
                e.preventDefault();
                item.style.backgroundColor = '#e9ecef';
            });
            item.addEventListener('dragleave', () => item.style.backgroundColor = '#f8f9fa');
            item.addEventListener('drop', e => {
                e.preventDefault();
                item.style.backgroundColor = '#f8f9fa';
                if (this.draggedItem !== item) {
                    const allItems = Array.from(this.itemsContainer.children);
                    const draggedIndex = allItems.indexOf(this.draggedItem);
                    const targetIndex = allItems.indexOf(item);
                    targetIndex > draggedIndex ? item.after(this.draggedItem) : item.before(this.draggedItem);
                }
            });
        });
    }

    getAnswer() {
        return Array.from(this.itemsContainer.querySelectorAll('.ordering-item')).map(i => i.getAttribute('data-id'));
    }
}

// Question UI Manager
class QuestionUIManager {
    constructor() {
        this.handlers = {
            'mcq': new MCQHandler(),
            'fill_in_blank': new FillInBlankHandler(),
            'true_false': new TrueFalseHandler(),
            'matching': new MatchingHandler(),
            'short_answer': new ShortAnswerHandler(),
            'multi_select': new MultiSelectHandler(),
            'ordering': new OrderingHandler()
        };
    }

    displayQuestion(question, currentAnswer) {
        Object.values(this.handlers).forEach(h => h.hide());
        const handler = this.handlers[question.type];
        if (handler) handler.display(question, currentAnswer);
        else console.error('Unsupported question type:', question.type);
    }

    getCurrentAnswer() {
        const handler = Object.values(this.handlers).find(h => 
            h.questionElement.style.display !== 'none'
        );
        return handler ? handler.getAnswer() : null;
    }
}

// Quiz State Manager
class QuizState {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = {};
        this.quizData = {};
    }

    initializeUserAnswers() {
        this.questions.forEach((_, i) => {
            this.userAnswers[i] = { answer: null, isCorrect: null, isMarked: false };
        });
    }

    saveCurrentAnswer(answer) {
        if (!this.questions.length) return;
        const question = this.questions[this.currentQuestionIndex];
        this.userAnswers[this.currentQuestionIndex].answer = answer;
        this.userAnswers[this.currentQuestionIndex].isCorrect = this.checkAnswerCorrectness(question, answer);
    }

    checkAnswerCorrectness(question, answer) {
        if (!answer || (Array.isArray(answer) && !answer.length)) return null;
        
        switch (question.type) {
            case 'mcq':
            case 'true_false': return answer === question.correct_answer;
            case 'fill_in_blank': 
                const acceptable = [question.correct_answer.toLowerCase(), ...(question.acceptable_answers || []).map(a => a.toLowerCase())];
                return acceptable.includes(answer.toLowerCase());
            case 'short_answer':
                const variations = [question.correct_answer.toLowerCase(), ...(question.acceptable_variations || []).map(a => a.toLowerCase())];
                return variations.some(v => answer.toLowerCase().includes(v) || v.includes(answer.toLowerCase()));
            case 'matching':
                return Array.isArray(answer) && answer.length === question.pairs.length && 
                    question.pairs.every((p, i) => answer[i] === p.right);
            case 'multi_select':
                const correct = question.options.filter(o => o.correct).map(o => o.id);
                return correct.length === answer.length && correct.every(id => answer.includes(id));
            case 'ordering':
                return JSON.stringify(answer) === JSON.stringify(question.correct_order);
            default: return null;
        }
    }

    toggleMarkReview() {
        this.userAnswers[this.currentQuestionIndex].isMarked = 
            !this.userAnswers[this.currentQuestionIndex].isMarked;
    }

    calculateResults() {
        const total = this.questions.length;
        const correct = Object.values(this.userAnswers).filter(a => a.isCorrect).length;
        return {
            totalQuestions: total,
            correctAnswers: correct,
            score: Math.round((correct / total) * 100)
        };
    }

    formatUserAnswer(question, answer) {
        if (!answer) return 'Not answered';
        switch (question.type) {
            case 'mcq':
                const option = question.options.find(o => o.id === answer);
                return option ? option.text : answer;
            case 'true_false': return answer === 'true' ? 'True' : 'False';
            case 'fill_in_blank':
            case 'short_answer': return answer || 'Empty answer';
            case 'matching':
                return question.pairs.map((p, i) => `${p.left} → ${answer[i] || 'Not matched'}`).join('; ');
            case 'multi_select':
                return answer.map(id => question.options.find(o => o.id === id)?.text || id).join(', ');
            case 'ordering':
                return answer.map(id => question.items.find(i => i.id === id)?.text || id).join(' → ');
            default: return answer;
        }
    }

    formatCorrectAnswer(question) {
        switch (question.type) {
            case 'mcq':
                const option = question.options.find(o => o.id === question.correct_answer);
                return option ? option.text : question.correct_answer;
            case 'true_false': return question.correct_answer ? 'True' : 'False';
            case 'fill_in_blank':
            case 'short_answer': return question.correct_answer;
            case 'matching': return question.pairs.map(p => `${p.left} → ${p.right}`).join('; ');
            case 'multi_select':
                return question.options.filter(o => o.correct).map(o => o.text).join(', ');
            case 'ordering':
                return question.correct_order.map(id => question.items.find(i => i.id === id)?.text || id).join(' → ');
            default: return question.correct_answer;
        }
    }
}

// Index Panel UI
class IndexUI {
    constructor() {
        this.indexPanel = document.getElementById('index-panel');
    }

    renderIndexPanel(totalQuestions, currentIndex, userAnswers) {
        let html = '<div class="index-title">Questions</div><div class="index-grid">';
        
        for (let i = 0; i < totalQuestions; i++) {
            let classes = '';
            if (userAnswers[i].isMarked) classes = 'marked';
            else if (userAnswers[i].answer !== null) classes = 'answered';
            else classes = 'not-answered';
            
            if (i === currentIndex) classes += ' current';
            
            html += `<div class="index-item ${classes}" data-index="${i}">${i + 1}</div>`;
        }
        
        this.indexPanel.innerHTML = html + '</div>';
        
        this.indexPanel.querySelectorAll('.index-item').forEach(item => {
            item.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('questionNavigation', {
                    detail: parseInt(item.getAttribute('data-index'))
                }));
            });
        });
    }

    updateIndexItem(index, userAnswer) {
        const item = this.indexPanel.querySelector(`.index-item[data-index="${index}"]`);
        if (!item) return;
        
        item.classList.remove('marked', 'answered', 'not-answered');
        if (userAnswer.isMarked) item.classList.add('marked');
        else if (userAnswer.answer !== null) item.classList.add('answered');
        else item.classList.add('not-answered');
    }
}

// Main Quiz Controller
class QuizController {
    constructor() {
        this.quizState = new QuizState();
        this.questionUI = new QuestionUIManager();
        this.indexUI = new IndexUI();
        this.initEventListeners();
        this.initQuiz();
    }

    initEventListeners() {
        document.getElementById('prev-btn').addEventListener('click', () => this.navigateQuestion(-1));
        document.getElementById('next-btn').addEventListener('click', () => this.navigateQuestion(1));
        document.getElementById('mark-review').addEventListener('click', () => this.toggleMarkReview());
        document.getElementById('submit-quiz').addEventListener('click', () => this.submitQuiz());
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        
        document.addEventListener('questionNavigation', (e) => {
            this.navigateToQuestion(e.detail);
        });

        // Add restart quiz handler
        document.getElementById('restart-quiz').addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to restart this quiz?')) {
                this.restartQuiz();
            }
        });
    }

    restartQuiz() {
        // Reset quiz state
        this.quizState.currentQuestionIndex = 0;
        this.quizState.initializeUserAnswers();
        
        // Update UI
        this.updateUI();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    async initQuiz() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const subject = urlParams.get('subject');
            const source = urlParams.get('source');

            if (source === 'custom') {
                const data = sessionStorage.getItem('customQuizData');
                if (!data) throw new Error('No custom quiz data found');
                this.quizState.quizData = JSON.parse(data);
            } else {
                const response = await fetch(`data/${subject}.json`);
                this.quizState.quizData = await response.json();
            }

            this.quizState.questions = this.quizState.quizData.questions || 
                                      this.quizState.quizData.question_bank?.questions || [];
            
            if (!this.quizState.questions.length) throw new Error('No questions found');
            
            document.getElementById('quiz-title').textContent = 
                this.quizState.quizData.metadata?.title || 
                this.quizState.quizData.question_bank?.metadata?.title || 
                (subject ? `${subject.charAt(0).toUpperCase() + subject.slice(1)} Quiz` : 'Custom Quiz');
            
            document.getElementById('total-questions').textContent = this.quizState.questions.length;
            this.quizState.initializeUserAnswers();
            this.updateUI();
        } catch (error) {
            document.getElementById('question-panel').innerHTML = 
                `<div class="error">Error loading quiz: ${error.message}</div>`;
            console.error('Quiz loading error:', error);
        }
    }

    navigateQuestion(direction) {
        this.quizState.saveCurrentAnswer(this.questionUI.getCurrentAnswer());
        this.quizState.currentQuestionIndex += direction;
        this.updateUI();
    }

    navigateToQuestion(index) {
        this.quizState.saveCurrentAnswer(this.questionUI.getCurrentAnswer());
        this.quizState.currentQuestionIndex = index;
        this.updateUI();
    }

    toggleMarkReview() {
        this.quizState.toggleMarkReview();
        this.indexUI.updateIndexItem(
            this.quizState.currentQuestionIndex,
            this.quizState.userAnswers[this.quizState.currentQuestionIndex]
        );
        document.getElementById('mark-review').textContent = 
            this.quizState.userAnswers[this.quizState.currentQuestionIndex].isMarked ? 
            'Unmark Review' : 'Mark for Review';
    }

    submitQuiz() {
        this.quizState.saveCurrentAnswer(this.questionUI.getCurrentAnswer());
        if (confirm('Are you sure you want to submit the quiz?')) {
            this.showResults();
        }
    }

    showResults() {
        const results = this.quizState.calculateResults();
        let html = `
            <div class="score-summary">
                <h3>Your Score: ${results.score}%</h3>
                <p>${results.correctAnswers} out of ${results.totalQuestions} questions correct</p>
            </div>
        `;
        
        this.quizState.questions.forEach((q, i) => {
            const ua = this.quizState.userAnswers[i];
            html += `
                <div class="result-item ${ua.isCorrect ? 'correct' : 'incorrect'}">
                    <p><strong>Question ${i + 1}:</strong> ${q.question}</p>
                    <p><strong>Your answer:</strong> ${this.quizState.formatUserAnswer(q, ua.answer)}</p>
                    ${!ua.isCorrect ? `<p><strong>Correct answer:</strong> ${this.quizState.formatCorrectAnswer(q)}</p>` : ''}
                    ${q.explanation ? `<p class="explanation"><strong>Explanation:</strong> ${q.explanation}</p>` : ''}
                </div>
            `;
        });
        
        document.getElementById('result-details').innerHTML = html;
        document.getElementById('result-modal').style.display = 'flex';
    }

    closeModal() {
        document.getElementById('result-modal').style.display = 'none';
    }

    updateUI() {
        this.questionUI.displayQuestion(
            this.quizState.questions[this.quizState.currentQuestionIndex],
            this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer
        );
        
        this.indexUI.renderIndexPanel(
            this.quizState.questions.length,
            this.quizState.currentQuestionIndex,
            this.quizState.userAnswers
        );
        
        document.getElementById('current-question').textContent = 
            this.quizState.currentQuestionIndex + 1;
            
        document.getElementById('prev-btn').disabled = 
            this.quizState.currentQuestionIndex === 0;
            
        document.getElementById('next-btn').disabled = 
            this.quizState.currentQuestionIndex === this.quizState.questions.length - 1;
            
        document.getElementById('mark-review').textContent = 
            this.quizState.userAnswers[this.quizState.currentQuestionIndex].isMarked ? 
            'Unmark Review' : 'Mark for Review';
    }
}

// Initialize the quiz
document.addEventListener('DOMContentLoaded', () => new QuizController());