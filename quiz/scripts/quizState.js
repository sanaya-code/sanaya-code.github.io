class QuizState 
{
    constructor() 
    {
        this.queList = [];
        this.currentQuestionIndex = 0;
        this.currentQuestion = null;
        this.userAnswers = {};
        this.resultModal = new ResultModalComponent();
    }

    saveCurrentAnswer(user_response)
    {
        this.queList[this.currentQuestionIndex]['user_response']    = user_response;
        this.userAnswers[this.currentQuestionIndex].answer          = user_response;
    }

    resetQuizState()
    {
        this.setCurrentQuestion(0);
        this.initializeUserAnswers();
        for (let i = 0; i < this.queList.length; i++) 
        {
            this.queList[i]['user_response'] =   null;
        }
    }

    showResults() 
    {
        this.resultModal.reset();

        // Calculate score
        let totalPoints = 0;
        let earnedPoints = 0;
        let correctCount = 0;

        this.queList.forEach((question, index) => {
            totalPoints += question.points || 1;
            
            const userAnswer = this.userAnswers[index].answer;
            
            const isCorrect = this.checkAnswerCorrectness(question, userAnswer);
            
            if (isCorrect) {
                earnedPoints += question.points || 1;
                correctCount++;
            }
            
            // Add question analysis to results
            this.resultModal.addAnalysis(
                index + 1,
                question.question,
                this.formatUserAnswer(question, userAnswer),
                this.formatCorrectAnswer(question),
                question.explanation || '',
                isCorrect
            );
        });

        // Calculate percentage and show summary
        const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);
        this.resultModal.createSummary(
            scorePercentage,
            correctCount,
            this.queList.length
        );

        this.resultModal.show();
    }

    checkAnswerCorrectness(question, userAnswer) 
    {
        if (userAnswer === null || userAnswer === undefined) return false;
        
        switch (question.type) {
            case 'mcq':
                return userAnswer === question.correct_answer;
                
            case 'true_false':
                return userAnswer === question.correct_answer;
                
            case 'fill_in_blank':
                const answers = [question.correct_answer, ...(question.acceptable_answers || [])];
                return answers.some(ans => 
                    question.case_sensitive 
                        ? ans === userAnswer 
                        : ans.toLowerCase() === userAnswer.toLowerCase()
                );
                
            case 'multi_select':
                const correctOptions = question.options
                    .filter(opt => opt.correct)
                    .map(opt => opt.id);
                return this.arraysEqual(userAnswer.sort(), correctOptions.sort());
                
            case 'ordering':
                return this.arraysEqual(userAnswer, question.correct_order);
                
            case 'matching':
                const correctPairs = question.pairs.map(pair => pair.right);
                return this.arraysEqual(userAnswer.sort(), correctPairs.sort());
                
            case 'short_answer':
                const variations = [question.correct_answer, ...(question.acceptable_variations || [])];
                return variations.some(variation => 
                    userAnswer.toLowerCase().includes(variation.toLowerCase())
                );
                
            default:
                return false;
        }
    }

    formatUserAnswer(question, answer) 
    {
        if (!answer) return 'Not answered';
        
        switch (question.type) {
            case 'mcq':
                const mcqOption = question.options.find(opt => opt.id === answer);
                return mcqOption ? mcqOption.text : answer;
                
            case 'true_false':
                return answer ? 'True' : 'False';
                
            case 'multi_select':
                return answer.map(id => {
                    const option = question.options.find(opt => opt.id === id);
                    return option ? option.text : id;
                }).join(', ');
                
            case 'ordering':
                return answer.map(id => {
                    const item = question.items.find(item => item.id === id);
                    return item ? item.text : id;
                }).join(' → ');
                
            case 'matching':
                return answer.map((right, index) => {
                    const left = question.pairs[index]?.left;
                    const match = question.pairs.find(p => p.right === right);
                    return `${left} → ${right} ${match ? '✓' : '✗'}`;
                }).join('; ');
                
            default:
                return answer;
        }
    }

    formatCorrectAnswer(question) 
    {
        switch (question.type) 
        {
            case 'mcq':
                const correctOption = question.options.find(opt => opt.id === question.correct_answer);
                return correctOption ? correctOption.text : question.correct_answer;
                
            case 'true_false':
                return question.correct_answer ? 'True' : 'False';
                
            case 'fill_in_blank':
                return question.correct_answer;
                
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
                
            case 'matching':
                return question.pairs.map(pair => `${pair.left} → ${pair.right}`).join('; ');
                
            case 'short_answer':
                return question.correct_answer;
                
            default:
                return '';
        }
    }

    arraysEqual(a, b) 
    {
        if (a === b) return true;
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }

    setWrongAnswers() 
    {
        // Filter questions where user answer was incorrect
        this.queList = this.queList.filter((question, index) => {
            const userAnswer = this.userAnswers[index]?.answer;
            return !this.checkAnswerCorrectness(question, userAnswer);
        });
        
        // Reset current question tracking
        /*
        this.currentQuestionIndex = 0;
        this.currentQuestion = this.queList.length > 0 ? this.queList[0] : null;
        */
    }

    initializeUserAnswers() 
    {
        this.queList.forEach((_, i) => {
            this.userAnswers[i] = { answer: null, isCorrect: null, isMarked: false };
        });
    }

    setCurrentQuestion(index) 
    {
        this.currentQuestionIndex = index;
        this.currentQuestion = this.queList[index];
    }
}