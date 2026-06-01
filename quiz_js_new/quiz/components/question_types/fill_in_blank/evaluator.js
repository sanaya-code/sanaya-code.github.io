const FillInBlankEvaluator = {

    // Check if user response is correct
    checkAnswer(question, userAnswer) {
        if (!userAnswer || typeof userAnswer !== 'string') return false;
        const caseSensitive = question.case_sensitive === true;
        const user = caseSensitive ? userAnswer.trim() : userAnswer.trim().toLowerCase();
        if (!user) return false;

        const answers = [
            question.correct_answer,
            ...(question.acceptable_answers || [])
        ].filter(Boolean);

        return answers.some(ans => {
            const a = caseSensitive ? String(ans).trim() : String(ans).trim().toLowerCase();
            return user === a;
        });
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!userAnswer || typeof userAnswer !== 'string' || !userAnswer.trim()) return '—';
        return userAnswer.trim();
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        const correct = question.correct_answer || '—';
        const variations = question.acceptable_answers || [];
        if (variations.length === 0) return String(correct);
        return `${correct} (also: ${variations.join(', ')})`;
    },
};