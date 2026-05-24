const McqEvaluator = {

    // Check if user response is correct
    checkAnswer(question, userAnswer) {
        return userAnswer === question.correct_answer;
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (userAnswer === null || userAnswer === undefined) return '—';
        const option = question.options?.find(o => o.id === userAnswer);
        return option ? `${option.id}: ${option.text}` : String(userAnswer);
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        const option = question.options?.find(o => o.id === question.correct_answer);
        return option ? `${option.id}: ${option.text}` : String(question.correct_answer);
    },
};