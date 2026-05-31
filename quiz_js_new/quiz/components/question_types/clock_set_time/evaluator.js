const ClockSetTimeEvaluator = {

    // Check if user response is correct
    // user answer is { hour, minute } — both must match correct_answer within tolerance
    checkAnswer(question, userAnswer) {
        if (!userAnswer || userAnswer.hour === null || userAnswer.minute === null) return false;
        const correct   = question.correct_answer || {};
        const tolerance = 0.25; // allow quarter-hour tolerance

        const hourOk   = Math.abs(parseFloat(userAnswer.hour)   - parseFloat(correct.hour))   <= tolerance;
        const minuteOk = Math.abs(parseFloat(userAnswer.minute) - parseFloat(correct.minute)) <= tolerance;
        return hourOk && minuteOk;
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!userAnswer || userAnswer.hour === null || userAnswer.minute === null) return '—';
        return `Hour: ${userAnswer.hour} | Minute: ${userAnswer.minute}`;
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        const c = question.correct_answer || {};
        return `Hour: ${c.hour} | Minute: ${c.minute}`;
    },
};