const OrderingHorizontalEvaluator = {

    // Check if user response is correct
    // compare user response against correct_order
    // fixed positions (initial_items) are pre-filled, check remaining positions
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;

        const correct = question.correct_order || [];
        const initialItems = question.initial_items || [];

        if (userAnswer.length !== correct.length) return false;

        return correct.every((val, i) => {
            // Skip fixed positions
            if (initialItems[i] !== undefined && initialItems[i] !== '') {
                return true;
            }

            // Editable positions must not be empty
            if (String(userAnswer[i] ?? '').trim() === '') {
                return false;
            }

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