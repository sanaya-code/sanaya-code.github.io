const OrderingEvaluator = {

    // Check if user response is correct
    // user answer is array of ids in user's chosen order
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const correct = question.correct_order || [];
        if (userAnswer.length !== correct.length) return false;
        return correct.every((id, i) => String(userAnswer[i]) === String(id));
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length === 0) return '—';
        return userAnswer.map(id => this._getItemText(question, id)).join(' → ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return (question.correct_order || [])
            .map(id => this._getItemText(question, id))
            .join(' → ');
    },

    // ── Private ───────────────────────────────────────────────

    _getItemText(question, id) {
        const item = (question.items || []).find(i => i.id === id);
        return item ? `${item.id}: ${item.text}` : String(id);
    },
};