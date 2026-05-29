const CompareQuantitiesEvaluator = {

    // Check if user response is correct
    checkAnswer(question, userAnswer) {
        if (userAnswer === null || userAnswer === undefined || userAnswer === '') return false;
        return String(userAnswer).trim() === String(question.correct_answer).trim();
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (userAnswer === null || userAnswer === undefined || userAnswer === '') return '—';
        const a = question.quantity_a?.label || 'A';
        const b = question.quantity_b?.label || 'B';
        return `${a} ${userAnswer} ${b}`;
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        const a = question.quantity_a?.label || 'A';
        const b = question.quantity_b?.label || 'B';
        return `${a} ${question.correct_answer} ${b}`;
    },
};