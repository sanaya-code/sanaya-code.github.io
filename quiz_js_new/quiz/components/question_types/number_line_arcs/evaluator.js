const NumberLineArcsEvaluator = {

    // Check if user response matches expected pairs (order-insensitive within pairs, set comparison)
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const correct = (question.pairs || []).map(p => {
            const sorted = [...p].sort((a, b) => a - b);
            return `${sorted[0]},${sorted[1]}`;
        });
        const user = userAnswer.map(p => {
            const sorted = [...p].sort((a, b) => a - b);
            return `${sorted[0]},${sorted[1]}`;
        });
        if (user.length !== correct.length) return false;
        const correctSet = new Set(correct);
        return user.every(pair => correctSet.has(pair));
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length === 0) return '—';
        return userAnswer.map(([a, b]) => `${a}→${b}`).join(', ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return (question.pairs || []).map(([a, b]) => `${a}→${b}`).join(', ');
    },
};