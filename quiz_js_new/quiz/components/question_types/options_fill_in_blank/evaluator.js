const OptionsFillInBlankEvaluator = {

    // Check if user response is correct
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const opts          = question.options || [];
        const caseSensitive = question.case_sensitive === true;

        return opts.every((opt, optIdx) => {
            const userRow    = userAnswer[optIdx] || [];
            const acceptable = opt.acceptable_answers || [];

            return acceptable.every((acceptableSet, blankIdx) => {
                const userVal = String(userRow[blankIdx] || '');
                return this._matchesAny(acceptableSet, userVal, caseSensitive);
            });
        });
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length === 0) return '—';
        return (question.options || []).map((opt, i) => {
            const row = Array.isArray(userAnswer[i]) ? userAnswer[i] : [];
            return `${String.fromCharCode(97 + i)}) [${row.join(', ')}]`;
        }).join(' | ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return (question.options || []).map((opt, i) => {
            const correct = Array.isArray(opt.correct_answer) ? opt.correct_answer : [];
            return `${String.fromCharCode(97 + i)}) [${correct.join(', ')}]`;
        }).join(' | ');
    },

    // ── Private ───────────────────────────────────────────────

    _matchesAny(acceptableSet, userVal, caseSensitive) {
        if (!Array.isArray(acceptableSet)) return false;
        return acceptableSet.some(ans => {
            const a = caseSensitive ? String(ans) : String(ans).toLowerCase();
            const u = caseSensitive ? userVal      : userVal.toLowerCase();
            return a === u;
        });
    },
};