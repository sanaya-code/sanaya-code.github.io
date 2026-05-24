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
                userAnswer:    this._formatUserAnswer(question, userAnswer),
                correctAnswer: this._formatCorrectAnswer(question),
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
        const evaluator = QuestionRegistry.getEvaluator(question.type);
        if (!evaluator) {
            console.warn(`QuizResultEvaluator: no evaluator for type "${question.type}"`);
            return false;
        }
        return evaluator.checkAnswer(question, userAnswer);
    }

    _formatUserAnswer(question, userAnswer) {
        const evaluator = QuestionRegistry.getEvaluator(question.type);
        if (!evaluator) return String(userAnswer ?? '—');
        return evaluator.formatUserAnswer(question, userAnswer);
    }

    _formatCorrectAnswer(question) {
        const evaluator = QuestionRegistry.getEvaluator(question.type);
        if (!evaluator) return String(question.correct_answer ?? '—');
        return evaluator.formatCorrectAnswer(question);
    }
}