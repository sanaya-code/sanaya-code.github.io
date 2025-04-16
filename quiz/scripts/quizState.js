class QuizState 
{
    constructor() 
    {
        this.queList                =   [];
        this.currentQuestionIndex   =   0;
        this.currentQuestion        =   null;
        this.userAnswers            =   {};
        // result modal, waraper component, index panel
    }

    initialize(queList)
    {
        this.queList                =       queList;
        this.setCurrentQuestion(0);
        this.initializeUserAnswers();
        this.clearUserResponse();
    }

    resetQuizState()
    {
        this.setCurrentQuestion(0);
        this.initializeUserAnswers();
        this.clearUserResponse();
        
    }

    initializeUserAnswers() 
    {
        this.queList.forEach((_, i) => {
            this.userAnswers[i] = { answer: null, isCorrect: null, isMarked: false };
        });
    }

    clearUserResponse()
    {
        for (let i = 0; i < this.queList.length; i++) 
        {
            this.queList[i]['user_response'] =   null;
        }
    }

    saveCurrentAnswer(user_response)
    {
        this.queList[this.currentQuestionIndex]['user_response']    = user_response;
        this.userAnswers[this.currentQuestionIndex].answer          = user_response;
    }

    setCurrentQuestion(index) 
    {
        this.currentQuestionIndex = index;
        this.currentQuestion = this.queList[index];
    }

    moveToNewQuestion(currUserResponse, newQueIndex)
    {
        this.saveCurrentAnswer(currUserResponse);
        this.setCurrentQuestion(newQueIndex);
    }
}