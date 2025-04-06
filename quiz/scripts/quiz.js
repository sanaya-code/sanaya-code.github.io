class Controller 
{
    constructor() 
    {
        this.quizState              =   new QuizState();        
        this.mcq                    =   new MCQ_Component();  
        this.fillQ                  =   new FillInBlankComponent(); 
        this.tfQ                    =   new TrueFalseComponent(); 
        this.matchingQ              =   new MatchingComponent();
        this.shortAnswerQ           =   new ShortAnswerComponent();
        this.multiSelectQ           =   new MultiSelectComponent();
        this.orderingQ              =   new OrderingComponent();
        this.indexPanel             =   new IndexPanelComponent();  
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
        this.saveCurrentAnswer();
        if (confirm('Are you sure you want to submit the quiz?')) 
        {
            this.quizState.showResults();
        }
    }

    restartQuiz() 
    {
        // Reset quiz state
        this.clearCurrentQuestion();
        this.quizState.setCurrentQuestion(0);
        this.quizState.initializeUserAnswers();
        this.indexPanel.markAllQuestionsUnAnswered();
        this.showCurrentQuestion();
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    startOnlyWrongAnswers()
    {
        // Reset quiz state with only wrong answered questions
        this.clearCurrentQuestion();
        this.quizState.resultModal.reset();
        this.quizState.setWrongAnswers();
        this.quizState.initializeUserAnswers();
        this.quizState.setCurrentQuestion(0);
        this.indexPanel.reset();
        this.indexPanel.show();
        this.showIndexPanel();
        this.showCurrentQuestion();
    }
    
    saveCurrentAnswer() 
    {
        if (!this.quizState.queList.length) return;
        switch (this.quizState.currentQuestion.type) 
        {
            case 'mcq'              :   this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer = this.mcq.getAnswer();break;

            case 'fill_in_blank'    :   this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer = this.fillQ.getAnswer();break;

            case 'true_false'       :   this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer = this.tfQ.getAnswer();break;

            case 'matching'         :   this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer = this.matchingQ.getAnswer();break;

            case 'short_answer'     :   this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer = this.shortAnswerQ.getAnswer();break;

            case 'multi_select'     :   this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer = this.multiSelectQ.getAnswer();break;

            case 'ordering'         :   this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer = this.orderingQ.getAnswer();break;
            
            default                 :   return null;
        }
        
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
        switch (this.quizState.currentQuestion.type) 
        {
            case 'mcq'              :   this.showMCQ(); break;

            case 'fill_in_blank'    :   this.showFillQ(); break;

            case 'true_false'       :   this.showTfQ(); break;

            case 'matching'         :   this.showMatchingQ(); break;

            case 'short_answer'     :   this.showShortAnswerQ(); break;

            case 'multi_select'     :   this.showMultiSelectQ(); break;

            case 'ordering'         :   this.showOrderingQ(); break;

            default                 :   return null;
        }
    }

    showMCQ()
    {
        this.mcq.setQuestion(this.quizState.currentQuestion.question);

        this.mcq.setSvg(this.quizState.currentQuestion.svg_content);

        this.mcq.setFigure(this.quizState.currentQuestion.img_url);

        this.quizState.currentQuestion.options.forEach((option, index) => {
            this.mcq.addOption(option.id, option.text)
        });
        if (this.quizState.userAnswers[this.quizState.currentQuestionIndex]?.answer != null)
        {
            this.mcq.setAnswer(this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer)
        }
        this.mcq.show();
    }

    showFillQ()
    {
        this.fillQ.setQuestion(this.quizState.currentQuestion.question);

        this.fillQ.setSvg(this.quizState.currentQuestion.svg_content);

        this.fillQ.setFigure(this.quizState.currentQuestion.img_url);
        
        if (this.quizState.userAnswers[this.quizState.currentQuestionIndex]?.answer != null)
        {
            this.fillQ.setAnswer(this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer)
        }

        this.fillQ.show();
    }

    showTfQ() 
    {
        this.tfQ.setQuestion(this.quizState.currentQuestion.question);

        this.tfQ.setSvg(this.quizState.currentQuestion.svg_content);

        this.tfQ.setFigure(this.quizState.currentQuestion.img_url);
        
        if (this.quizState.userAnswers[this.quizState.currentQuestionIndex]?.answer != null) 
        {
            this.tfQ.setAnswer(this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer);
        }
        this.tfQ.show();
    }

    showMatchingQ() 
    {
        // Set the matching question text
        this.matchingQ.setQuestion(this.quizState.currentQuestion.question);

        this.matchingQ.setSvg(this.quizState.currentQuestion.svg_content);

        this.matchingQ.setFigure(this.quizState.currentQuestion.img_url);
        
        // Clear any previous pairs
        // this.matchingQ.reset();
        
        // Prepare all possible right-side options (correct answers + distractors)
        const allOptions = [
            ...this.quizState.currentQuestion.pairs.map(pair => pair.right),
            ...(this.quizState.currentQuestion.distractors || [])
        ];
        
        // Add each matching pair with all possible options
        this.quizState.currentQuestion.pairs.forEach((pair) => {
            this.matchingQ.addPair(
                pair.left,
                allOptions,
                [] // Don't need separate distractors since we included them in allOptions
            );
        });
        
        // Restore previous answers if they exist
        if (this.quizState.userAnswers[this.quizState.currentQuestionIndex]?.answer != null) {
            this.matchingQ.setAnswer(this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer);
        }
        
        // Show the matching question component
        this.matchingQ.show();
    }

    showShortAnswerQ() 
    {
        // Set the question text
        this.shortAnswerQ.setQuestion(this.quizState.currentQuestion.question);

        this.shortAnswerQ.setSvg(this.quizState.currentQuestion.svg_content);

        this.shortAnswerQ.setFigure(this.quizState.currentQuestion.img_url);
        
        // Restore previous answer if it exists
        if (this.quizState.userAnswers[this.quizState.currentQuestionIndex]?.answer != null) 
        {
            this.shortAnswerQ.setAnswer(this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer);
        }
        
        // Show the short answer component
        this.shortAnswerQ.show();
    }

    showMultiSelectQ() 
    {
        // Set the question text
        this.multiSelectQ.setQuestion(this.quizState.currentQuestion.question);

        this.multiSelectQ.setSvg(this.quizState.currentQuestion.svg_content);

        this.multiSelectQ.setFigure(this.quizState.currentQuestion.img_url);
        
        // Add all options with their correctness
        this.quizState.currentQuestion.options.forEach((option) => {
            this.multiSelectQ.addOption(
                option.id,
                option.text,
                option.correct  // Pass the correctness flag to optionally style correct answers
            );
        });
        
        // Restore previous selections if they exist
        if (this.quizState.userAnswers[this.quizState.currentQuestionIndex]?.answer != null) 
        {
            this.multiSelectQ.setAnswer(this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer);
        }
        
        // Show the multi-select component
        this.multiSelectQ.show();
    }

    showOrderingQ() 
    {
        // Set the question text
        this.orderingQ.setQuestion(this.quizState.currentQuestion.question);

        this.orderingQ.setSvg(this.quizState.currentQuestion.svg_content);

        this.orderingQ.setFigure(this.quizState.currentQuestion.img_url);

        // add items in their original order
        this.quizState.currentQuestion.items.forEach((item) => {
            this.orderingQ.addItem(item.id, item.text);
        });

        // If user has previous answers, use those to set order
        if (this.quizState.userAnswers[this.quizState.currentQuestionIndex]?.answer != null) 
        {
            // Restore user's previous order
            this.orderingQ.setAnswer(this.quizState.userAnswers[this.quizState.currentQuestionIndex].answer );
        } 
        
        // Show the ordering component
        this.orderingQ.show();
    }

    navigateToQuestion(newIndex)
    {
        this.saveCurrentAnswer();
        this.clearCurrentQuestion();
        this.quizState.setCurrentQuestion(newIndex);
        this.indexPanel.markQuestionCurrent(newIndex);
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

    async start() 
    {
        try 
        {
            this.initEventListeners();
            await this.setQuestionsList();
            this.quizState.initializeUserAnswers();
            this.quizState.setCurrentQuestion(0);
            this.showIndexPanel();
            this.showCurrentQuestion();
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