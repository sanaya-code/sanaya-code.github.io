class QuizService {

    // ── Navigation ────────────────────────────────────────────

    getNextIndex(currentIndex, total, step) {
        let newIndex = currentIndex + step;
        if      (newIndex >= total) newIndex = 0;
        else if (newIndex < 0)      newIndex = total - 1;
        return newIndex;
    }

    // ── Answer ────────────────────────────────────────────────

    getAnswerStatus(answer) {
        return this._isAnswerEmpty(answer) ? 'not-answered' : 'answered';
    }

    // ── Question ──────────────────────────────────────────────

    resolveQuestion(question, baseUrl) {
        return ImageUrlResolver.resolve(question, baseUrl);
    }

    // ── Result ────────────────────────────────────────────────

    getResultJson(queList, userAnswers) {
        const evaluator = new QuizResultEvaluator(queList, userAnswers);
        return evaluator.getResultJson();
    }

    getWrongQuestions(queList, userAnswers) {
        const evaluator = new QuizResultEvaluator(queList, userAnswers);
        return evaluator.getWrongAnswersOnly();
    }

    // ── Private ───────────────────────────────────────────────

    _isAnswerEmpty(answer) {
        if (Array.isArray(answer))      return answer.length === 0 || answer.join('').trim() === '';
        if (typeof answer === 'string') return answer.trim() === '';
        return answer == null;
    }
}