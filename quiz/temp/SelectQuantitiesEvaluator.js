class SelectQuantitiesEvaluator {
    /**
     * Check if user response is correct
     */
    static checkAnswer(question, userAnswer) {
        if (!userAnswer) return false;

        return question.required_selections.every(sel => {
            return userAnswer[sel.key] &&
                   userAnswer[sel.key] === question.correct_answer[sel.key];
        });
    }

    /**
     * Format user's selected answer for reporting
     */
    static formatUserAnswer(question, userAnswer) {
        if (!userAnswer) return 'Not answered';

        const labels = question.required_selections.map(sel => {
            const qty = question.quantities.find(q => q.id === userAnswer[sel.key]);
            return `${sel.label}: ${qty ? qty.value : 'Not answered'}`;
        });

        return labels.join('; ');
    }

    /**
     * Format the correct answer for reporting
     */
    static formatCorrectAnswer(question) {
        return question.required_selections.map(sel => {
            const qty = question.quantities.find(q => q.id === question.correct_answer[sel.key]);
            return `${sel.label}: ${qty ? qty.value : '?'}`;
        }).join('; ');
    }
}
