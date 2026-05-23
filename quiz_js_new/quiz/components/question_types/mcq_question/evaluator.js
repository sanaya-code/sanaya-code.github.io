const McqEvaluator = {
    checkAnswer(question, userAnswer) {
        return userAnswer === question.correct_answer;
    },

    formatAnswer(answer) {
        if (answer === null || answer === undefined) return '—';
        return String(answer);
    },
};