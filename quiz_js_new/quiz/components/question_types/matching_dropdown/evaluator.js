const MatchingDropdownEvaluator = {

    // Check if user response is correct
    // userAnswer[i] must equal pairs[i].right
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const pairs = question.pairs || [];
        if (userAnswer.length !== pairs.length) return false;
        return pairs.every((pair, i) => String(userAnswer[i]) === String(pair.right));
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length === 0) return '—';
        return (question.pairs || [])
            .map((pair, i) => `${pair.left} → ${userAnswer[i] || '?'}`)
            .join(' | ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return (question.pairs || [])
            .map(pair => `${pair.left} → ${pair.right}`)
            .join(' | ');
    },
};