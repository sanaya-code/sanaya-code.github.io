const TableImageFillInBlankEvaluator = {

    // Check if user response is correct
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer)) return false;
        const rows    = question.rows || [];
        const columns = question.columns || 3;
        const caseSensitive = question.validation?.case_sensitive !== false ? true : false;

        return rows.every((row, rowIdx) => {
            const userRow = userAnswer[rowIdx] || [];

            // field1
            if (!this._checkField(row.field1, userRow[0], caseSensitive)) return false;

            // field2 only if 3 columns
            if (columns === 3) {
                if (!this._checkField(row.field2, userRow[1], caseSensitive)) return false;
            }

            return true;
        });
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
        const rows    = question.rows || [];
        const columns = question.columns || 3;
        return rows.map((row, i) => {
            const f1 = row.field1?.value ?? (row.field1?.acceptable_answers?.[0] || '?');
            const f2 = columns === 3
                ? (row.field2?.value ?? (row.field2?.acceptable_answers?.[0] || '?'))
                : null;
            return `Row ${i + 1}: [${[f1, f2].filter(v => v !== null).join(', ')}]`;
        }).join(' | ');
    },

    // ── Private ───────────────────────────────────────────────

    _checkField(field, userValue, caseSensitive) {
        if (!field) return true;
        // fixed value field — always correct, skip
        if (field.value !== undefined) return true;
        if (!field.acceptable_answers) return true;

        const u = caseSensitive ? String(userValue || '') : String(userValue || '').toLowerCase();
        return field.acceptable_answers.some(ans => {
            const a = caseSensitive ? String(ans) : String(ans).toLowerCase();
            return u === a;
        });
    },
};