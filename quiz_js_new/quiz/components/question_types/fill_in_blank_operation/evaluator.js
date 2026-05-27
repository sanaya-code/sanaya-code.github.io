const FillInBlankOperationEvaluator = {

    // Check if user response is correct
    // only editable rows in correct_answer are checked
    checkAnswer(question, userAnswer) {
        if (!userAnswer || typeof userAnswer !== 'object') return false;
        const correct      = question.correct_answer || {};
        const editable     = question.editable_answer || {};
        const caseSensitive = question.case_sensitive !== false;

        return Object.keys(correct).every(row => {
            const correctRow  = correct[row]  || [];
            const userRow     = userAnswer[row] || [];
            const editableRow = editable[row]  || [];

            return correctRow.every((val, i) => {
                if (!editableRow[i]) return true;        // skip non-editable
                if (val === '' || val === null) return true; // skip empty correct
                const u = String(userRow[i]  || '');
                const c = String(val);
                return caseSensitive
                    ? u === c
                    : u.toLowerCase() === c.toLowerCase();
            });
        });
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!userAnswer) return '—';
        const correct = question.correct_answer || {};
        return Object.keys(correct).map(row => {
            const vals = (userAnswer[row] || []).filter(v => v !== '');
            return `${row}: [${vals.join(', ') || '—'}]`;
        }).join(' | ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        const correct = question.correct_answer || {};
        return Object.keys(correct).map(row => {
            const vals = (correct[row] || []).filter(v => v !== '');
            return `${row}: [${vals.join(', ')}]`;
        }).join(' | ');
    },
};