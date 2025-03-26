document.addEventListener('DOMContentLoaded', function() {
    // Main Quiz Controller
    class QuizController {
        constructor() {
            this.quizState = new QuizState();
            this.questionUI = new QuestionUI();
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
        }

        async initQuiz() {
            const urlParams = new URLSearchParams(window.location.search);
            const subject = urlParams.get('subject');
            const source = urlParams.get('source');

            try {
                if (source === 'custom') {
                    const customQuizData = sessionStorage.getItem('customQuizData');
                    if (customQuizData) {
                        this.quizData = JSON.parse(customQuizData);
                        this.quizState.questions = this.quizData.questions || this.quizData.question_bank?.questions || [];
                        document.getElementById('quiz-title').textContent = 
                            this.quizData.metadata?.title || 
                            this.quizData.question_bank?.metadata?.title || 
                            'Custom Quiz';
                    } else {
                        throw new Error('No custom quiz data found');
                    }
                } else {
                    const response = await fetch(`data/${subject}.json`);
                    this.quizData = await response.json();
                    this.quizState.questions = this.quizData.questions || this.quizData.question_bank?.questions || [];
                    document.getElementById('quiz-title').textContent = 
                        this.quizData.metadata?.title || 
                        this.quizData.question_bank?.metadata?.title || 
                        subject.charAt(0).toUpperCase() + subject.slice(1) + ' Quiz';
                }

                if (this.quizState.questions.length === 0) {
                    throw new Error('No questions found in quiz data');
                }

                document.getElementById('total-questions').textContent = this.quizState.questions.length;
                this.quizState.initializeUserAnswers();
                this.updateUI();
            } catch (error) {
                document.getElementById('question-panel').innerHTML = 
                    `<div class="error">Error loading quiz: ${error.message}</div>`;
                console.error('Error loading quiz:', error);
            }
        }

        navigateQuestion(direction) {
            this.quizState.saveCurrentAnswer(this.questionUI.getCurrentAnswer());
            this.quizState.currentQuestionIndex += direction;
            this.updateUI();
        }

        toggleMarkReview() {
            this.quizState.toggleMarkReview();
            this.indexUI.updateIndexItem(this.quizState.currentQuestionIndex, 
                this.quizState.userAnswers[this.quizState.currentQuestionIndex]);
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
            let resultsHTML = `
                <div class="score-summary">
                    <h3>Your Score: ${results.score}%</h3>
                    <p>${results.correctAnswers} out of ${results.totalQuestions} questions correct</p>
                </div>
            `;
            
            this.quizState.questions.forEach((question, index) => {
                const userAnswer = this.quizState.userAnswers[index];
                const isCorrect = userAnswer.isCorrect;
                
                resultsHTML += `
                    <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                        <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
                        <p><strong>Your answer:</strong> ${this.quizState.formatUserAnswer(question, userAnswer.answer)}</p>
                        ${!isCorrect ? 
                            `<p><strong>Correct answer:</strong> ${this.quizState.formatCorrectAnswer(question)}</p>` : 
                            ''}
                        ${question.explanation ? 
                            `<p class="explanation"><strong>Explanation:</strong> ${question.explanation}</p>` : 
                            ''}
                    </div>
                `;
            });
            
            document.getElementById('result-details').innerHTML = resultsHTML;
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
            document.getElementById('current-question').textContent = this.quizState.currentQuestionIndex + 1;
            document.getElementById('prev-btn').disabled = this.quizState.currentQuestionIndex === 0;
            document.getElementById('next-btn').disabled = this.quizState.currentQuestionIndex === this.quizState.questions.length - 1;
            document.getElementById('mark-review').textContent = 
                this.quizState.userAnswers[this.quizState.currentQuestionIndex].isMarked ? 
                'Unmark Review' : 'Mark for Review';
        }
    }

    // Quiz State Management
    class QuizState {
        constructor() {
            this.questions = [];
            this.currentQuestionIndex = 0;
            this.userAnswers = {};
            this.quizData = {};
        }

        initializeUserAnswers() {
            this.questions.forEach((_, index) => {
                this.userAnswers[index] = {
                    answer: null,
                    isCorrect: null,
                    isMarked: false
                };
            });
        }

        saveCurrentAnswer(answer) {
            if (this.questions.length === 0) return;
            
            const question = this.questions[this.currentQuestionIndex];
            this.userAnswers[this.currentQuestionIndex].answer = answer;
            this.userAnswers[this.currentQuestionIndex].isCorrect = this.checkAnswerCorrectness(question, answer);
        }

        checkAnswerCorrectness(question, answer) {
            if (answer === null || (Array.isArray(answer) && answer.length === 0)) {
                return null;
            }

            switch (question.type) {
                case 'mcq':
                case 'true_false':
                    return answer === question.correct_answer;
                case 'fill_in_blank':
                    const acceptableAnswers = [question.correct_answer.toLowerCase()];
                    if (question.acceptable_answers) {
                        acceptableAnswers.push(...question.acceptable_answers.map(a => a.toLowerCase()));
                    }
                    return acceptableAnswers.includes(answer.toLowerCase());
                case 'short_answer':
                    const acceptableVariations = [question.correct_answer.toLowerCase()];
                    if (question.acceptable_variations) {
                        acceptableVariations.push(...question.acceptable_variations.map(a => a.toLowerCase()));
                    }
                    return acceptableVariations.some(variation => 
                        answer.toLowerCase().includes(variation) || variation.includes(answer.toLowerCase())
                    );
                case 'matching':
                    if (!Array.isArray(answer) || answer.length !== question.pairs.length) {
                        return false;
                    }
                    return question.pairs.every((pair, index) => 
                        answer[index] === pair.right
                    );
                case 'multi_select':
                    const correctOptions = question.options
                        .filter(opt => opt.correct)
                        .map(opt => opt.id);
                    return correctOptions.length === answer.length && 
                        correctOptions.every(opt => answer.includes(opt));
                case 'ordering':
                    return JSON.stringify(answer) === JSON.stringify(question.correct_order);
                default:
                    return null;
            }
        }

        toggleMarkReview() {
            this.userAnswers[this.currentQuestionIndex].isMarked = 
                !this.userAnswers[this.currentQuestionIndex].isMarked;
        }

        calculateResults() {
            const totalQuestions = this.questions.length;
            const correctAnswers = Object.values(this.userAnswers).filter(
                answer => answer.isCorrect === true
            ).length;
            const score = Math.round((correctAnswers / totalQuestions) * 100);
            
            return {
                totalQuestions,
                correctAnswers,
                score
            };
        }

        formatUserAnswer(question, answer) {
            if (answer === null) return 'Not answered';
            
            switch (question.type) {
                case 'mcq':
                    const mcqOption = question.options.find(opt => opt.id === answer);
                    return mcqOption ? mcqOption.text : answer;
                case 'true_false':
                    return answer === 'true' ? 'True' : 'False';
                case 'fill_in_blank':
                case 'short_answer':
                    return answer || 'Empty answer';
                case 'matching':
                    if (!Array.isArray(answer)) return 'Not answered';
                    return question.pairs.map((pair, i) => 
                        `${pair.left} → ${answer[i] || 'Not matched'}`
                    ).join('; ');
                case 'multi_select':
                    if (!Array.isArray(answer)) return 'Not answered';
                    return answer.map(optId => {
                        const option = question.options.find(opt => opt.id === optId);
                        return option ? option.text : optId;
                    }).join(', ');
                case 'ordering':
                    if (!Array.isArray(answer)) return 'Not answered';
                    return answer.map(id => {
                        const item = question.items.find(item => item.id === id);
                        return item ? item.text : id;
                    }).join(' → ');
                default:
                    return answer;
            }
        }

        formatCorrectAnswer(question) {
            switch (question.type) {
                case 'mcq':
                    const correctOption = question.options.find(opt => opt.id === question.correct_answer);
                    return correctOption ? correctOption.text : question.correct_answer;
                case 'true_false':
                    return question.correct_answer ? 'True' : 'False';
                case 'fill_in_blank':
                    return question.correct_answer;
                case 'short_answer':
                    return question.correct_answer;
                case 'matching':
                    return question.pairs.map(pair => 
                        `${pair.left} → ${pair.right}`
                    ).join('; ');
                case 'multi_select':
                    return question.options
                        .filter(opt => opt.correct)
                        .map(opt => opt.text)
                        .join(', ');
                case 'ordering':
                    return question.correct_order.map(id => {
                        const item = question.items.find(item => item.id === id);
                        return item ? item.text : id;
                    }).join(' → ');
                default:
                    return question.correct_answer;
            }
        }
    }

    // Question UI Management
    class QuestionUI {
        constructor() {
            this.questionElements = {
                'mcq': document.getElementById('mcq-question'),
                'fill_in_blank': document.getElementById('fill-question'),
                'true_false': document.getElementById('tf-question'),
                'matching': document.getElementById('matching-question'),
                'short_answer': document.getElementById('short-question'),
                'multi_select': document.getElementById('multi-question'),
                'ordering': document.getElementById('ordering-question')
            };
        }

        displayQuestion(question, currentAnswer) {
            // Hide all question types first
            Object.values(this.questionElements).forEach(el => el.style.display = 'none');
            
            // Show the appropriate question type
            const questionElement = this.questionElements[question.type];
            if (!questionElement) {
                console.error('Unsupported question type:', question.type);
                return;
            }
            
            questionElement.style.display = 'block';
            
            // Set question text
            const questionTextElement = questionElement.querySelector('.question-text');
            if (questionTextElement) {
                questionTextElement.textContent = question.question;
            }
            
            // Render question-specific content
            switch (question.type) {
                case 'mcq':
                    this.renderMCQ(question, currentAnswer);
                    break;
                case 'fill_in_blank':
                    this.renderFillInBlank(question, currentAnswer);
                    break;
                case 'true_false':
                    this.renderTrueFalse(question, currentAnswer);
                    break;
                case 'matching':
                    this.renderMatching(question, currentAnswer);
                    break;
                case 'short_answer':
                    this.renderShortAnswer(question, currentAnswer);
                    break;
                case 'multi_select':
                    this.renderMultiSelect(question, currentAnswer);
                    break;
                case 'ordering':
                    this.renderOrdering(question, currentAnswer);
                    break;
            }
        }

        getCurrentAnswer() {
            const visibleQuestion = Object.values(this.questionElements).find(el => 
                el.style.display !== 'none'
            );
            
            if (!visibleQuestion) return null;
            
            const questionType = visibleQuestion.id.split('-')[0];
            
            switch (questionType) {
                case 'mcq':
                case 'tf':
                    const selectedOption = visibleQuestion.querySelector('input[type="radio"]:checked');
                    return selectedOption ? selectedOption.value : null;
                case 'fill':
                    return document.getElementById('fill-answer').value.trim();
                case 'short':
                    return document.getElementById('short-answer').value.trim();
                case 'matching':
                    const matchingAnswers = [];
                    visibleQuestion.querySelectorAll('.matching-select').forEach(select => {
                        matchingAnswers.push(select.value);
                    });
                    return matchingAnswers;
                case 'multi':
                    const multiAnswers = [];
                    visibleQuestion.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
                        multiAnswers.push(checkbox.value);
                    });
                    return multiAnswers;
                case 'ordering':
                    const orderAnswers = [];
                    visibleQuestion.querySelectorAll('.ordering-item').forEach(item => {
                        orderAnswers.push(item.getAttribute('data-id'));
                    });
                    return orderAnswers;
                default:
                    return null;
            }
        }

        renderMCQ(question, currentAnswer) {
            const optionsContainer = document.getElementById('mcq-options');
            optionsContainer.innerHTML = '';
            
            question.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'mcq';
                input.id = `option-${index}`;
                input.value = option.id;
                if (currentAnswer === option.id) {
                    input.checked = true;
                }
                
                const label = document.createElement('label');
                label.htmlFor = `option-${index}`;
                label.textContent = option.text;
                
                optionDiv.appendChild(input);
                optionDiv.appendChild(label);
                optionsContainer.appendChild(optionDiv);
            });
        }

        renderFillInBlank(question, currentAnswer) {
            const input = document.getElementById('fill-answer');
            input.value = currentAnswer || '';
        }

        renderTrueFalse(question, currentAnswer) {
            if (currentAnswer === 'true') {
                document.getElementById('true-option').checked = true;
            } else if (currentAnswer === 'false') {
                document.getElementById('false-option').checked = true;
            } else {
                document.getElementById('true-option').checked = false;
                document.getElementById('false-option').checked = false;
            }
        }

        renderMatching(question, currentAnswer) {
            const pairsContainer = document.getElementById('matching-pairs');
            pairsContainer.innerHTML = '';
            
            // Shuffle the right side options
            const allOptions = question.pairs.map(pair => pair.right).concat(question.distractors || []);
            const shuffledOptions = [...allOptions].sort(() => Math.random() - 0.5);
            
            question.pairs.forEach((pair, index) => {
                const pairDiv = document.createElement('div');
                pairDiv.className = 'matching-pair';
                
                const leftDiv = document.createElement('div');
                leftDiv.className = 'matching-left';
                leftDiv.textContent = pair.left;
                
                const select = document.createElement('select');
                select.className = 'matching-select';
                select.id = `match-${index}`;
                
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
                pairsContainer.appendChild(pairDiv);
            });
        }

        renderShortAnswer(question, currentAnswer) {
            const textarea = document.getElementById('short-answer');
            textarea.value = currentAnswer || '';
        }

        renderMultiSelect(question, currentAnswer) {
            const optionsContainer = document.getElementById('multi-options');
            optionsContainer.innerHTML = '';
            
            question.options.forEach((option, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.id = `multi-option-${index}`;
                input.value = option.id;
                if (currentAnswer && currentAnswer.includes(option.id)) {
                    input.checked = true;
                }
                
                const label = document.createElement('label');
                label.htmlFor = `multi-option-${index}`;
                label.textContent = option.text;
                
                optionDiv.appendChild(input);
                optionDiv.appendChild(label);
                optionsContainer.appendChild(optionDiv);
            });
        }

        renderOrdering(question, currentAnswer) {
            const itemsContainer = document.getElementById('ordering-items');
            itemsContainer.innerHTML = '';
            
            // Use current answer order if exists, otherwise shuffle
            let itemsToRender;
            if (currentAnswer && currentAnswer.length === question.items.length) {
                itemsToRender = currentAnswer.map(id => 
                    question.items.find(item => item.id === id)
                ).filter(item => item !== undefined);
            } else {
                itemsToRender = [...question.items].sort(() => Math.random() - 0.5);
            }
            
            itemsToRender.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'ordering-item';
                itemDiv.draggable = true;
                itemDiv.setAttribute('data-id', item.id);
                itemDiv.textContent = item.text;
                itemsContainer.appendChild(itemDiv);
            });
            
            this.setupDragAndDrop(itemsContainer);
        }

        setupDragAndDrop(container) {
            let draggedItem = null;

            container.querySelectorAll('.ordering-item').forEach(item => {
                item.addEventListener('dragstart', function() {
                    draggedItem = this;
                    setTimeout(() => {
                        this.style.opacity = '0.5';
                    }, 0);
                });

                item.addEventListener('dragend', function() {
                    this.style.opacity = '1';
                });

                item.addEventListener('dragover', function(e) {
                    e.preventDefault();
                });

                item.addEventListener('dragenter', function(e) {
                    e.preventDefault();
                    this.style.backgroundColor = '#e9ecef';
                });

                item.addEventListener('dragleave', function() {
                    this.style.backgroundColor = '#f8f9fa';
                });

                item.addEventListener('drop', function(e) {
                    e.preventDefault();
                    this.style.backgroundColor = '#f8f9fa';
                    if (draggedItem !== this) {
                        const allItems = Array.from(container.children);
                        const draggedIndex = allItems.indexOf(draggedItem);
                        const targetIndex = allItems.indexOf(this);
                        
                        if (draggedIndex < targetIndex) {
                            this.after(draggedItem);
                        } else {
                            this.before(draggedItem);
                        }
                    }
                });
            });
        }
    }

    // Index Panel UI Management
    class IndexUI {
        constructor() {
            this.indexPanel = document.getElementById('index-panel');
        }

        renderIndexPanel(totalQuestions, currentIndex, userAnswers) {
            let indexHTML = '<div class="index-title">Questions</div><div class="index-grid">';
            
            for (let i = 0; i < totalQuestions; i++) {
                let statusClass = '';
                if (userAnswers[i].isMarked) {
                    statusClass = 'marked';
                } else if (userAnswers[i].answer !== null) {
                    statusClass = 'answered';
                } else {
                    statusClass = 'not-answered';
                }
                
                if (i === currentIndex) {
                    statusClass += ' current';
                }
                
                indexHTML += `
                    <div class="index-item ${statusClass}" data-index="${i}">
                        ${i + 1}
                    </div>
                `;
            }
            
            indexHTML += '</div>';
            this.indexPanel.innerHTML = indexHTML;
            
            // Add click event to index items
            this.indexPanel.querySelectorAll('.index-item').forEach(item => {
                item.addEventListener('click', () => {
                    const index = parseInt(item.getAttribute('data-index'));
                    document.dispatchEvent(new CustomEvent('navigateToQuestion', { detail: index }));
                });
            });
        }

        updateIndexItem(index, userAnswer) {
            const item = this.indexPanel.querySelector(`.index-item[data-index="${index}"]`);
            if (!item) return;
            
            // Clear all status classes
            item.classList.remove('marked', 'answered', 'not-answered');
            
            // Add appropriate status class
            if (userAnswer.isMarked) {
                item.classList.add('marked');
            } else if (userAnswer.answer !== null) {
                item.classList.add('answered');
            } else {
                item.classList.add('not-answered');
            }
        }
    }

    // Initialize the quiz
    const quizController = new QuizController();
    
    // Custom event listener for navigation from index panel
    document.addEventListener('navigateToQuestion', function(e) {
        quizController.quizState.saveCurrentAnswer(quizController.questionUI.getCurrentAnswer());
        quizController.quizState.currentQuestionIndex = e.detail;
        quizController.updateUI();
    });
});