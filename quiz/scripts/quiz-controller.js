class Controller 
{
    constructor() 
    {
        this.quizState      =   new QuizState();
        this.wrapper        =   document.createElement('question-wrapper');
        this.indexPanel     =   null;
        
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
            this.quizState.queList  =   this.getSessionJsonData();
        } 
        else 
        {
            this.quizState.queList  =   await this.getRemoteJsonData();
        }
    }


    initEventListeners() 
    {
        document.getElementById('prev-btn').addEventListener('click', () => this.navigateQuestion(-1));
        document.getElementById('next-btn').addEventListener('click', () => this.navigateQuestion(1));
        document.getElementById('mark-review').addEventListener('click', () => this.toggleMarkReview());
        document.getElementById('submit-quiz').addEventListener('click', () => this.submitQuiz());
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        document.getElementById('wrong-modal').addEventListener('click', () => this.startOnlyWrongAnswers());

        // Add restart quiz handler
        document.getElementById('restart-quiz').addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to restart this quiz?')) {
                this.restartQuiz();
            }
        });

        // press enter key and move to next question
        document.addEventListener('keydown', (event) => 
        {
            if (event.key === 'Enter') {
                const quizDiv = document.getElementById('quiz');
                const selectedRadio = quizDiv.querySelector('input[type="radio"]:checked');
                if (selectedRadio) 
                {
                    document.getElementById('next-btn').focus();
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Control') {
              // console.log(e.location);
              this.navigateQuestion(-1);
            }
          });

          document.addEventListener('question-selected', (e) => {
            const index = e.detail.index;
            this.indexPanel.setAttribute('current', index);
            this.navigateToQuestion(index);
        });

    }

    toggleMarkReview() 
    {
        const isMarked = !this.quizState.userAnswers[this.quizState.currentQuestionIndex].isMarked;
        this.quizState.userAnswers[this.quizState.currentQuestionIndex].isMarked = isMarked;

        // Update index panel
        if (isMarked) 
        {
            //this.indexPanel.markQuestionReviewed(this.quizState.currentQuestionIndex);
        } 
        else 
        {
            // You might want to add a method to unmark review if needed
            //this.indexPanel.unMarkQuestionReviewed(this.quizState.currentQuestionIndex);
            
        }
    }

    closeModal() 
    {
        this.quizState.resultModal.reset();
    }

    submitQuiz() 
    {
        // this.saveCurrentAnswer();
        this.quizState.saveCurrentAnswer(this.wrapper.getUserAnswer());
        this.markCurrentQuestion();
        if (confirm('Are you sure you want to submit the quiz?')) 
        {
            this.quizState.showResults();
        }
    }

    restartQuiz() 
    {
        // Reset quiz state
        //this.clearCurrentQuestion();
        this.quizState.resetQuizState();
        // this.indexPanel.markAllQuestionsUnAnswered();
        this.showCurrentQuestion();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    startOnlyWrongAnswers()
    {
        // Reset quiz state with only wrong answered questions
        //this.clearCurrentQuestion();
        this.quizState.resultModal.reset();
        this.quizState.setWrongAnswers();
        this.quizState.resetQuizState();
        //this.indexPanel.reset();
        //this.indexPanel.show();
        //this.showIndexPanel();
        this.showCurrentQuestion();
    }

    isEmptyAnswer() {
        const answer = this.wrapper.getUserAnswer();
        if( Array.isArray(answer) )
        {
            return( (answer.length === 0) || (answer.join('').trim() === '') );
        }
        else if(typeof answer === 'string')
        {
            return(answer.trim() === '')
        }
        else
        {
            return (answer == null);
        }
    }

    markCurrentQuestion()
    {
        const currQnIndex   =   this.quizState.currentQuestionIndex;
        let statusUpdate    =   "";
        if ( this.isEmptyAnswer()  )
        {
            //this.indexPanel.markQuestionUnAnswered(this.quizState.currentQuestionIndex);
            statusUpdate = JSON.stringify({ index: currQnIndex, status: 'not-answered' });
        } 
        else 
        {
            //this.indexPanel.markQuestionAnswered(this.quizState.currentQuestionIndex);
            statusUpdate = JSON.stringify({ index: currQnIndex, status: 'answered' });
        }
        this.indexPanel.setAttribute('update-status', statusUpdate);
    }

    clearCurrentQuestion()
    {
        switch (this.quizState.currentQuestion.type) 
        {
            case 'mcq'              :   this.mcq.reset(); break;

            case 'fill_in_blank'    :   this.fillQ.reset(); break;

            case 'true_false'       :   this.tfQ.reset(); break;

            case 'matching'         :   this.matchingQ.reset(); break;

            case 'short_answer'     :   this.shortAnswerQ.reset(); break;

            case 'multi_select'     :   this.multiSelectQ.reset(); break;

            case 'ordering'         :   this.orderingQ.reset(); break;

            default                 :   return null;
        }
    }

    showCurrentQuestion()
    {
        const sampleQuestion = this.quizState.currentQuestion;
        this.wrapper.setAttribute('question-data', JSON.stringify(sampleQuestion));
    }

    navigateToQuestion(newIndex)
    {
        //this.saveCurrentAnswer();
        this.quizState.saveCurrentAnswer(this.wrapper.getUserAnswer());
        this.markCurrentQuestion();
        this.quizState.setCurrentQuestion(newIndex);
        this.indexPanel.setAttribute('current', `${newIndex}`);
        this.showCurrentQuestion();
        document.getElementById('quiz').querySelector('input[type="radio"]')?.focus();
    }

    navigateQuestion(i)
    {
        
        let newIndex  =   this.quizState.currentQuestionIndex + i;  
        if(newIndex == this.quizState.queList.length)
        {
            newIndex = 0;
        }
        else if(newIndex == -1)
        {
            newIndex = this.quizState.queList.length - 1;  
        }
        this.navigateToQuestion(newIndex);
    }

    showIndexPanel() 
    {    
        this.indexPanel =   document.createElement('question-index-panel');
        this.indexPanel.setAttribute('total', `${this.quizState.queList.length}`);
        this.indexPanel.setAttribute('current', '0');
        document.getElementById("quiz-container").appendChild(this.indexPanel);
    }

    test() {
        const sampleQuestion = this.quizState.currentQuestion;
        this.wrapper.setAttribute('question-data', JSON.stringify(sampleQuestion));
    }

    async start() 
    {
        try 
        {
            this.initEventListeners();
            await this.setQuestionsList();
            this.quizState.initializeUserAnswers();
            this.quizState.setCurrentQuestion(0);
            this.showIndexPanel();
            document.getElementById("quiz").appendChild(this.wrapper);
            // this.test();
            this.showCurrentQuestion();
            document.getElementById('quiz').querySelector('input[type="radio"]')?.focus();
        } 
        catch (error) 
        {
            document.getElementById('question-panel').innerHTML = 
                `<div class="error">Error loading quiz: ${error.message}</div>`;
            console.error('Quiz loading error:', error);
        }
    }
}

obj = new Controller();
document.addEventListener('DOMContentLoaded', () => obj.start());
