const FillInBlankMultiGraphTextEvaluator = {

    // Check if user response is correct
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const correct       = question.correct_answer || [];
        const caseSensitive = question.case_sensitive === true;
        if (userAnswer.length !== correct.length) return false;
        return correct.every((val, i) => {
            const u = caseSensitive ? String(userAnswer[i] || '') : String(userAnswer[i] || '').toLowerCase();
            const c = caseSensitive ? String(val)                 : String(val).toLowerCase();
            return u === c;
        });
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length === 0) return '—';
        return userAnswer.map((v, i) => `Block ${i + 1}: ${v || '?'}`).join(' | ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return (question.correct_answer || [])
            .map((v, i) => `Block ${i + 1}: ${v}`)
            .join(' | ');
    },
};