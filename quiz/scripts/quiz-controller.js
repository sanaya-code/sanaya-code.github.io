class Controller 
{
    constructor() 
    {
        this.quizState      =   new QuizState();
        this.wrapper        =   document.createElement('question-wrapper');
        this.indexPanel     =   null;
        
    }

    initEventListeners() 
    {
        document.getElementById('prev-btn').addEventListener('click', () => this.navigateQuestion(-1));
        document.getElementById('next-btn').addEventListener('click', () => this.navigateQuestion(1));
        document.getElementById('mark-review').addEventListener('click', () => this.toggleMarkReview());
        document.getElementById('submit-quiz').addEventListener('click', () => this.submitQuiz());

        document.addEventListener('goHome', () => {
            // Perform cleanup actions here, if necessary
            console.log("Cleaning up quiz state and navigating to home page...");
        
            // Optional: You can clear session data, scores, or any other data
            // sessionStorage.clear(); or localStorage.clear();
        
            // Now, navigate to the home page
            window.location.href = 'index.html'; // Or handle with your SPA router if needed
        });

        document.addEventListener('restartWithWrongQuestions', (e) => {
            
            console.log('Restarting with questions wrongly answerd');
        
            // You can now:
            // - Reset quiz state
            // - Load a new quiz with only these questions
            // - Re-render the quiz interface
        
            // Example placeholder:
            this.startOnlyWrongAnswers();
        });

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

    submitQuiz() 
    {
        this.quizState.saveCurrentAnswer(this.wrapper.getUserAnswer());
        this.markCurrentQuestionInIndexPanel();
        if (confirm('Are you sure you want to submit the quiz?')) 
        {
            const resultObj     =   new QuizResultEvaluator(this.quizState.queList, this.quizState.userAnswers);
            const testData      =   resultObj.getResultJson();
            const modal         =   new ModalComponent();
            document.body.appendChild(modal);
            modal.setAttribute('config', JSON.stringify(testData));   
        }
    }

    restartQuiz() 
    {
        
        // Reset quiz state
        this.quizState.resetQuizState();
       
        // initialize the Index-Ui-Panel
        this.indexPanel.setAttribute('mark-all-unanswered', 'true');
        this.indexPanel.setAttribute('current', `${this.quizState.currentQuestionIndex}`);
        
        // render question using wrapper class
        this.showCurrentQuestion();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    startOnlyWrongAnswers()
    {
        // Reset quiz state with only wrong answered questions
        const resultObj =   new QuizResultEvaluator(this.quizState.queList, this.quizState.userAnswers);
        const queList   =   resultObj.getWrongAnswersOnly();
        
        // this.quizState.setWrongAnswers();
        // this.quizState.resetQuizState();
        this.quizState.initialize(queList);

        // remove index-panel from dom
        this.indexPanel.setAttribute('remove-panel', 'true');
        // re-create index-panel with only those que which are wrongly answered
        this.createAndShowIndexPanel();

        // initialize wrapper component to display current question
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

    markCurrentQuestionInIndexPanel()
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

    showCurrentQuestion()
    {
        const sampleQuestion = this.quizState.currentQuestion;
        this.wrapper.setAttribute('question-data', JSON.stringify(sampleQuestion));
    }

    navigateToQuestion(newIndex)
    {
         // Update index panel
         this.markCurrentQuestionInIndexPanel();
         this.indexPanel.setAttribute('current', `${newIndex}`);

        // update state
        this.quizState.moveToNewQuestion(this.wrapper.getUserAnswer(), newIndex)

        // update wrapper component to display new question
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

    createAndShowIndexPanel() 
    {    
        this.indexPanel =   document.createElement('question-index-panel');
        this.indexPanel.setAttribute('total', `${this.quizState.queList.length}`);
        this.indexPanel.setAttribute('current', '0');
        document.getElementById("quiz-container").appendChild(this.indexPanel);
    }

    async start() 
    {
        try 
        {
            this.initEventListeners();

            const queList   =   await QuizDataLoader.getQuestionsList();
            this.quizState.initialize(queList)

            this.createAndShowIndexPanel();
            document.getElementById("quiz").appendChild(this.wrapper);
            
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
