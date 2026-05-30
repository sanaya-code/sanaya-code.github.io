const TableFillInBlankEvaluator = {

    // Check if user response is correct
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const data          = question.data || [];
        const caseSensitive = question.case_sensitive === true;

        return data.every((row, rowIdx) =>
            row.every((cell, colIdx) => {
                // fixed value — always correct, skip
                if (cell.value !== '____') return true;
                const userVal = String(userAnswer?.[rowIdx]?.[colIdx] || '');
                return this._matchesAcceptable(cell.acceptable_answers || [], userVal, caseSensitive);
            })
        );
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length === 0) return '—';
        return userAnswer
            .map((row, i) => `Row ${i + 1}: [${(row || []).join(', ')}]`)
            .join(' | ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return (question.data || []).map((row, i) => {
            const vals = row.map(cell =>
                cell.value === '____'
                    ? (cell.correct_answer || cell.acceptable_answers?.[0] || '?')
                    : cell.value
            );
            return `Row ${i + 1}: [${vals.join(', ')}]`;
        }).join(' | ');
    },

    // ── Private ───────────────────────────────────────────────

    _matchesAcceptable(acceptable, userVal, caseSensitive) {
        return acceptable.some(ans => {
            const a = caseSensitive ? String(ans) : String(ans).toLowerCase();
            const u = caseSensitive ? userVal      : userVal.toLowerCase();
            return a === u;
        });
    },
};