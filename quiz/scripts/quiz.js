class Controller 
{
    constructor() 
    {
        this.quizState      =   new QuizState();        
        this.indexPanel     =   new IndexPanelComponent();
        this.wrapper        = document.createElement('question-wrapper');
        
        
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
            this.quizState.queList  =   this.getSessionJsonData();
        } 
        else 
        {
            this.quizState.queList  =   await this.getRemoteJsonData();
            console.log(this.quizState.queList)
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
                // console.log('Enter key pressed!');
                // Optional: Prevent default behavior (e.g., form submission)
                // event.preventDefault();
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

        /*
        document.getElementById('quiz').addEventListener('click', function(event) {
            if ((event.target.tagName === 'DIV' || event.target.tagName === 'INPUT')) {
              document.getElementById('next-btn').focus();
            }
          });
          */
        
        /*
        this.indexPanel.querySelectorAll('.index-item').forEach(item => {
            item.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('questionNavigation', {
                    detail: parseInt(item.getAttribute('data-index'))
                }));
            });
        });
      
        document.addEventListener('questionNavigation', (e) => {
            this.navigateToQuestion(e.detail);
        });
        */

    }

    toggleMarkReview() 
    {
        const isMarked = !this.quizState.userAnswers[this.quizState.currentQuestionIndex].isMarked;
        this.quizState.userAnswers[this.quizState.currentQuestionIndex].isMarked = isMarked;

        // Update index panel
        if (isMarked) 
        {
            this.indexPanel.markQuestionReviewed(this.quizState.currentQuestionIndex);
        } 
        else 
        {
            // You might want to add a method to unmark review if needed
            this.indexPanel.unMarkQuestionReviewed(this.quizState.currentQuestionIndex);
            
        }
    }

    closeModal() 
    {
        // document.getElementById('result-modal').style.display = 'none';
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
        this.indexPanel.markAllQuestionsUnAnswered();
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
        this.indexPanel.reset();
        this.indexPanel.show();
        this.showIndexPanel();
        this.showCurrentQuestion();
    }

    markCurrentQuestion()
    {
        if (this.quizState.userAnswers[this.quizState.currentQuestionIndex]?.answer != null) 
        {
            this.indexPanel.markQuestionAnswered(this.quizState.currentQuestionIndex);
        } 
        else 
        {
            this.indexPanel.markQuestionUnAnswered(this.quizState.currentQuestionIndex);
        }
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
        // console.log(this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer);
        const sampleQuestion = this.quizState.currentQuestion;
        console.log(sampleQuestion);
        this.wrapper.setAttribute('question-data', JSON.stringify(sampleQuestion));
    }

    navigateToQuestion(newIndex)
    {
        //this.saveCurrentAnswer();
        this.quizState.saveCurrentAnswer(this.wrapper.getUserAnswer());
        this.markCurrentQuestion();
        // this.clearCurrentQuestion();
        this.quizState.setCurrentQuestion(newIndex);
        this.indexPanel.markQuestionCurrent(newIndex);
        this.showCurrentQuestion();
        // document.getElementById('quiz').querySelector('input[type="radio"]')?.focus();
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
        // Add all questions to the index panel
        this.quizState.queList.forEach((_, index) => {
            this.indexPanel.addQuestion(index);

            // Add click event to navigate to the clicked question
        
            const indexItem = this.indexPanel.getItemByIndex(index);
            if (indexItem) {
                indexItem.addEventListener('click', () => this.navigateToQuestion(index));
            }
            

        });
        
        

        // Mark current question
        this.indexPanel.markQuestionCurrent(0);    
        // Show the panel
        this.indexPanel.show();
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
            // document.getElementById('quiz').querySelector('input[type="radio"]')?.focus();
        } 
        catch (error) 
        {
            document.getElementById('question-panel').innerHTML = 
                `<div class="error">Error loading quiz: ${error.message}</div>`;
            console.error('Quiz loading error:', error);
        }
    }
}


function test() {

    const mcqEl = document.createElement('matching-component');

    const configObj = {
        question: "Which planet is the largest in our solar system?",
        svg_content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><style>.line { stroke: black; stroke-width: 1.5; fill: none; }.line-blue { stroke: blue; stroke-width: 1.5; fill: none; }.point { font-family: Arial; font-size: 10px; font-weight: bold; }.angle-fill { fill: rgba(100,200,255,0.3); stroke: none; }.point-marker { fill: red; r: 2; }.angle-label { font-size: 10px; }</style><path class="angle-fill" d="M 10 110 L 90 110 L 79.28 70 Z"/><path class="angle-fill" d="M 10 110 L 79.28 70 L 50 40.72 Z"/><line x1="10" y1="110" x2="90" y2="110" class="line"/><line x1="10" y1="110" x2="79.28" y2="70" class="line-blue"/><line x1="10" y1="110" x2="50" y2="40.72" class="line"/><circle cx="10" cy="110" r="2" class="point-marker"/><text x="05" y="120" class="point">O</text><circle cx="90" cy="110" r="2" class="point-marker"/><text x="93" y="113" class="point">C</text><circle cx="79.28" cy="70" r="2" class="point-marker"/><text x="82.28" y="73" class="point">B</text><circle cx="50" cy="40.72" r="2" class="point-marker"/><text x="53" y="43.72" class="point">A</text><text x="50" y="100" class="angle-label">15°</text></svg>`,
        img_url: "https://sanaya-code.github.io/quiz/data/school/c1_miriam/images/on_under_02.png",
        pairs: [
            { left: "A", right: "Earth" },
            { left: "B", right: "Mars" },
            { left: "C", right: "Jupiter" }
        ]  
    };

    // Set only the config attribute
    mcqEl.setAttribute("config", JSON.stringify(configObj));

    // Append to DOM
    document.getElementById("quiz").appendChild(mcqEl);

    // Wait and log user's answer
    setTimeout(() => {
        const userAnswer = mcqEl.getUserAnswer();
        console.log("User's answer is:", userAnswer);
    }, 5000);
}



obj = new Controller();
document.addEventListener('DOMContentLoaded', () => obj.start());
