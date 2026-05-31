const MultiSelectTwoEvaluator = {

    // Check if user response is correct
    // every key in correct_answer must match user_response
    checkAnswer(question, userAnswer) {
        if (!userAnswer || typeof userAnswer !== 'object') return false;
        const correct = question.correct_answer || {};
        return Object.keys(correct).every(key =>
            String(userAnswer[key] || '') === String(correct[key])
        );
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!userAnswer || typeof userAnswer !== 'object') return '—';
        const sels = question.required_selections || [];
        return sels.map(sel => {
            const id  = userAnswer[sel.key] || '?';
            const val = this._quantityValue(question, id);
            return `${sel.label}: ${val}`;
        }).join(' | ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        const correct = question.correct_answer || {};
        const sels    = question.required_selections || [];
        return sels.map(sel => {
            const id  = correct[sel.key] || '?';
            const val = this._quantityValue(question, id);
            return `${sel.label}: ${val}`;
        }).join(' | ');
    },

    // ── Private ───────────────────────────────────────────────

    _quantityValue(question, id) {
        const q = (question.quantities || []).find(q => String(q.id) === String(id));
        return q ? String(q.value) : String(id);
    },
};