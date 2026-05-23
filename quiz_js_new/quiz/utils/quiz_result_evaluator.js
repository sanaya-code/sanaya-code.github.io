class QuizResultEvaluator {
    constructor(queList, userAnswers) {
        this._queList     = queList;
        this._userAnswers = userAnswers;
    }

    getResultJson() {
        const questions = this._queList.map((question, i) => {
            const userAnswer = this._userAnswers[i]?.answer;
            const isCorrect  = this._checkAnswer(question, userAnswer);
            return {
                number:        i + 1,
                question:      question.question,
                userAnswer:    this._formatAnswer(userAnswer),
                correctAnswer: this._formatAnswer(question.correct_answer),
                explanation:   question.explanation || '',
                isCorrect,
            };
        });

        const correctAnswers = questions.filter(q => q.isCorrect).length;
        const totalQuestions = questions.length;

        return {
            summary: {
                totalQuestions,
                correctAnswers,
                scorePercentage: Math.round((correctAnswers / totalQuestions) * 100),
            },
            questions,
        };
    }

    getWrongAnswersOnly() {
        return this._queList.filter((question, i) => {
            const userAnswer = this._userAnswers[i]?.answer;
            return !this._checkAnswer(question, userAnswer);
        });
    }

    // ── Private ───────────────────────────────────────────────

    _checkAnswer(question, userAnswer) {
        const checkers = {
            mcq: () => userAnswer === question.correct_answer,
            default: () => false,
        };
        return (checkers[question.type] || checkers.default)();
    }

    _formatAnswer(answer) {
        if (answer === null || answer === undefined) return '—';
        if (Array.isArray(answer)) return answer.join(', ');
        return String(answer);
    }
}