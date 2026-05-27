const MultiSelectEvaluator = {

    // Check if user response is correct
    // correct = set of option ids where correct === true; must match user's selected set exactly
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const correct = this._correctIds(question);
        const user    = [...userAnswer].sort();
        const right   = [...correct].sort();
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
        const correct = this._correctIds(question);
        return correct.map(id => this._optionText(question, id)).join(', ');
    },

    // ── Private ───────────────────────────────────────────────

    _correctIds(question) {
        return (question.options || [])
            .filter(o => o.correct === true)
            .map(o => o.id);
    },

    _optionText(question, id) {
        const opt = question.options?.find(o => o.id === id);
        return opt ? `${opt.id}: ${opt.text}` : String(id);
    },
};