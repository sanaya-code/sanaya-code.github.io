const MultiFillInBlankEvaluator = {

    // Check if user response is correct
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const blanks        = question.blanks || [];
        const caseSensitive = question.case_sensitive === true;

        return blanks.every((blank, i) => {
            const user    = String(userAnswer[i] || '').trim();
            const answers = [blank.correct_answer, ...(blank.acceptable_answers || [])].filter(Boolean);
            return answers.some(ans => {
                const a = caseSensitive ? String(ans).trim() : String(ans).trim().toLowerCase();
                const u = caseSensitive ? user               : user.toLowerCase();
                return a === u;
            });
        });
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length === 0) return '—';
        return userAnswer
            .map((v, i) => `[${i + 1}]: ${v || '?'}`)
            .join(' | ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return (question.blanks || [])
            .map((b, i) => `[${i + 1}]: ${b.correct_answer}`)
            .join(' | ');
    },
};