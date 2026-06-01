const CompareImageObjectsEvaluator = {

    // Check if user response is correct
    checkAnswer(question, userAnswer) {
        if (!userAnswer) return false;
        return String(userAnswer) === String(question.correct_answer);
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!userAnswer) return '—';
        return String(userAnswer);
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return String(question.correct_answer || '—');
    },
};