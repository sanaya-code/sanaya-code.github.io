class QuizResultEvaluator {
    constructor(queList, userAnswers) {
        this.queList = queList;
        this.userAnswers = userAnswers;
    }

    getResultJson() {
        let totalPoints = 0;
        let earnedPoints = 0;
        let correctCount = 0;
        const questionsAnalysis = [];

        this.queList.forEach((question, index) => {
            totalPoints += question.points || 1;
            const userAnswer = this.userAnswers[index].answer;
            const isCorrect = this.checkAnswerCorrectness(question, userAnswer);

            if (isCorrect) {
                earnedPoints += question.points || 1;
                correctCount++;
            }

            questionsAnalysis.push({
                number: index + 1,
                question: question.question,
                userAnswer: this.formatUserAnswer(question, userAnswer),
                correctAnswer: this.formatCorrectAnswer(question),
                explanation: question.explanation || '',
                isCorrect
            });
        });

        return {
            summary: {
                scorePercentage: Math.round((earnedPoints / totalPoints) * 100),
                correctAnswers: correctCount,
                totalQuestions: this.queList.length
            },
            questions: questionsAnalysis
        };
    }

    getWrongAnswersOnly() {
        return this.queList.filter((question, index) => {
            const userAnswer = this.userAnswers[index]?.answer;
            return !this.checkAnswerCorrectness(question, userAnswer);
        });
    }

    checkAnswerCorrectness(question, userAnswer) {
        if (userAnswer == null) return false;

        switch (question.type) {
            case 'mcq':
                return userAnswer === question.correct_answer;
            case 'true_false':
                return userAnswer === `${question.correct_answer}`;
            case 'fill_in_blank':
                const answers = [question.correct_answer, ...(question.acceptable_answers || [])];
                return answers.some(ans =>
                    question.case_sensitive
                        ? ans === userAnswer
                        : ans.toLowerCase() === userAnswer.toLowerCase()
                );
            case 'multi_fill_in_blank':
                return this.checkMultiFillInBlankAnswer(question, userAnswer);
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
            case 'matching_drag_drop':
                const correctMatches = question.pairs.map(pair => pair.right);
                if (userAnswer.length !== correctMatches.length) return false;
                return userAnswer.every((val, idx) => val === correctMatches[idx]);
            case 'matching_connection':
                const correctRHS = question.pairs.map(pair => pair.right);
                if (userAnswer.length !== correctRHS.length) return false;
                return userAnswer.every((val, idx) => val === correctRHS[idx]);
            case 'short_answer':
                const variations = [question.correct_answer, ...(question.acceptable_variations || [])];
                return variations.some(variation =>
                    userAnswer.toLowerCase().includes(variation.toLowerCase())
                );
            default:
                return false;
        }
    }

    checkMultiFillInBlankAnswer(question, userAnswer) {
        const correctAnswers = question.blanks.map(blank => blank.correct_answer);
        return userAnswer.every((userAns, idx) =>
            userAns.toLowerCase() === correctAnswers[idx].toLowerCase()
        );
    }

    formatUserAnswer(question, answer) {
        if (!answer) return 'Not answered';

        switch (question.type) {
            case 'mcq':
                return question.options.find(opt => opt.id === answer)?.text || answer;
            case 'true_false':
                return answer ? 'True' : 'False';
            case 'multi_select':
                return answer.map(id => {
                    const opt = question.options.find(opt => opt.id === id);
                    return opt ? opt.text : id;
                }).join(', ');
            case 'ordering':
                return answer.map(id => {
                    const item = question.items.find(it => it.id === id);
                    return item ? item.text : id;
                }).join(' → ');
            case 'matching':
                return answer.map((right, index) => {
                    const left = question.pairs[index]?.left;
                    const match = question.pairs.find(p => p.right === right);
                    return `${left} → ${right} ${match ? '✓' : '✗'}`;
                }).join('; ');
            case 'matching_drag_drop':
                return answer.map((right, index) => {
                    const left = question.pairs[index]?.left || `?`;
                    const correctRight = question.pairs[index]?.right;
                    const isCorrect = right === correctRight;
                    return `${left} → ${right || 'None'} ${isCorrect ? '✓' : '✗'}`;
                }).join('; ');
            case 'matching_connection':
                return answer.map((right, index) => {
                    const left = question.pairs[index]?.left || '?';
                    const correctRight = question.pairs[index]?.right;
                    const isCorrect = right === correctRight;
                    return `${left} → ${right || 'None'} ${isCorrect ? '✓' : '✗'}`;
                }).join('; ');
            case 'multi_fill_in_blank':
                return answer.map(ans => ans || 'Not answered').join('; ');
            default:
                return answer;
        }
    }

    formatCorrectAnswer(question) {
        switch (question.type) {

            case 'mcq':
                return question.options.find(opt => opt.id === question.correct_answer)?.text || question.correct_answer;

            case 'true_false':
                return question.correct_answer ? 'True' : 'False';

            case 'fill_in_blank':
                return question.correct_answer;

            case 'multi_fill_in_blank':
                return question.blanks.map(blank => blank.correct_answer).join('; ');

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

            case 'matching_drag_drop':
                return question.pairs.map(pair => `${pair.left} → ${pair.right}`).join('; ');

            case 'matching_connection':
                return  question.pairs.map(pair => `${pair.left} → ${pair.right}`).join('; ');

            case 'short_answer':
                return question.correct_answer;
            default:
                return '';
        }
    }

    arraysEqual(a, b) {
        if (a === b) return true;
        if (!Array.isArray(a) || !Array.isArray(b)) return false;
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    }
}
