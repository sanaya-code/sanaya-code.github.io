const TrueFalseEvaluator = {

    // Check if user response is correct
    // user answer is a string "true"/"false"; correct_answer is a boolean
    checkAnswer(question, userAnswer) {
        if (userAnswer === null || userAnswer === undefined) return false;
        return String(question.correct_answer) === String(userAnswer);
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (userAnswer === null || userAnswer === undefined || userAnswer === '') return '—';
        return this._capitalize(String(userAnswer));
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return this._capitalize(String(question.correct_answer));
    },

    _capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    },
};