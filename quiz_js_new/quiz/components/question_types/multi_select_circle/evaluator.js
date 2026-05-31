const MultiSelectCircleEvaluator = {

    // Check if user response is correct
    // must match exactly the set of options where correct === true
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const correct = (question.options || [])
            .filter(o => o.correct === true)
            .map(o => o.id);
        const user = [...userAnswer].sort();
        const right = [...correct].sort();
        if (user.length !== right.length) return false;
        return user.every((val, i) => val === right[i]);
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length === 0) return '—';
        return userAnswer.map(id => this._optionText(question, id)).join(', ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return (question.options || [])
            .filter(o => o.correct === true)
            .map(o => this._optionText(question, o.id))
            .join(', ');
    },

    // ── Private ───────────────────────────────────────────────

    _optionText(question, id) {
        const opt = (question.options || []).find(o => o.id === id);
        return opt ? `${opt.id}: ${opt.text}` : String(id);
    },
};