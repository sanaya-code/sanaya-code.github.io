const OrderingHorizontalEvaluator = {

    // Check if user response is correct
    // compare user response against correct_order
    // fixed positions (initial_items) are pre-filled, check remaining positions
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const correct      = question.correct_order || [];
        const initialItems = question.initial_items  || [];

        if (userAnswer.length !== correct.length) return false;

        return correct.every((val, i) => {
            // skip fixed positions — always correct
            if (Array.isArray(initialItems) && initialItems[i] !== '') return true;
            return String(userAnswer[i]) === String(val);
        });
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length === 0) return '—';
        return userAnswer.map((v, i) => v || `[${i + 1}]`).join(' → ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return (question.correct_order || []).join(' → ');
    },
};