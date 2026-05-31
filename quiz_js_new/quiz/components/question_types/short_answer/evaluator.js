const ShortAnswerEvaluator = {

    // Check if user response is correct
    // checks against correct_answer and acceptable_variations (case-insensitive trim)
    checkAnswer(question, userAnswer) {
        if (!userAnswer || typeof userAnswer !== 'string') return false;
        const user = userAnswer.trim().toLowerCase();
        if (!user) return false;

        const correct = String(question.correct_answer || '').trim().toLowerCase();
        if (user === correct) return true;

        const variations = question.acceptable_variations || [];
        return variations.some(v => String(v).trim().toLowerCase() === user);
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!userAnswer || typeof userAnswer !== 'string' || !userAnswer.trim()) return '—';
        return userAnswer.trim();
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return String(question.correct_answer || '—').trim();
    },
};