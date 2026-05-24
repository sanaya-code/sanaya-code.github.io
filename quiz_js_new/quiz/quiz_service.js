class QuizService {

    // ── Navigation ────────────────────────────────────────────

    getNextIndex(state, step) {
        const total = state.queList.length;
        let newIndex = state.currentQuestionIndex + step;
        if      (newIndex >= total) newIndex = 0;
        else if (newIndex < 0)      newIndex = total - 1;
        return newIndex;
    }

    // ── Answer ────────────────────────────────────────────────

    getAnswerStatus(answer) {
        return this._isAnswerEmpty(answer) ? 'not-answered' : 'answered';
    }

    // ── Question ──────────────────────────────────────────────

    resolveQuestion(state) {
        return ImageUrlResolver.resolve(state.currentQuestion, state.baseUrl);
    }

    // ── Result ────────────────────────────────────────────────

    getResultJson(state) {
        const evaluator = new QuizResultEvaluator(state.queList, state.userAnswers);
        return evaluator.getResultJson();
    }

    getWrongQuestions(state) {
        const evaluator = new QuizResultEvaluator(state.queList, state.userAnswers);
        return evaluator.getWrongAnswersOnly();
    }

    // ── Private ───────────────────────────────────────────────

    _isAnswerEmpty(answer) {
        if (Array.isArray(answer))      return answer.length === 0 || answer.join('').trim() === '';
        if (typeof answer === 'string') return answer.trim() === '';
        return answer == null;
    }
}