const MatchingConnectionImageEvaluator = {

    // Check if user response is correct
    // Each image_index must connect to its row's acceptable_properties
    checkAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || !Array.isArray(question.rows)) return false;
        const rows = question.rows;
        if (userAnswer.length !== rows.length) return false;

        return rows.every(row => {
            const conn = userAnswer.find(a => a.image_index === row.image_index);
            if (!conn) return false;
            const acceptable = row.acceptable_properties || [row.property];
            return acceptable.includes(String(conn.property));
        });
    },

    // Format user's selected answer for reporting
    formatUserAnswer(question, userAnswer) {
        if (!Array.isArray(userAnswer) || userAnswer.length === 0) return '—';
        return userAnswer
            .map(conn => `[${conn.image_index}] → ${conn.property}`)
            .join(' | ');
    },

    // Format the correct answer for reporting
    formatCorrectAnswer(question) {
        return (question.rows || [])
            .map(row => `[${row.image_index}] → ${row.property}`)
            .join(' | ');
    },
};