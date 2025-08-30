class MultiSelectCircleEvaluator {
  /**
   * Check if user response is correct
   * Supports "exact" and "partial" scoring
   */
  static checkAnswer(question, userAnswer) {
    if (!Array.isArray(userAnswer) || userAnswer.length === 0) return false;

    const correctIds = question.options
      .filter(opt => opt.correct)
      .map(opt => opt.id);

    const scoringMethod = question.scoring_method || "exact";

    if (scoringMethod === "exact") {
      // Exact match required
      return (
        userAnswer.length === correctIds.length &&
        userAnswer.every(id => correctIds.includes(id))
      );
    }

    if (scoringMethod === "partial") {
      // At least one correct selected
      return userAnswer.some(id => correctIds.includes(id));
    }

    return false;
  }

  /**
   * Format user's selected answer for reporting
   */
  static formatUserAnswer(question, userAnswer) {
    if (!Array.isArray(userAnswer) || userAnswer.length === 0)
      return "Not answered";

    return userAnswer
      .map(id => {
        const opt = question.options.find(o => o.id === id);
        return opt ? opt.text : id;
      })
      .join(", ");
  }

  /**
   * Format the correct answer for reporting
   */
  static formatCorrectAnswer(question) {
    const correctIds = question.options.filter(opt => opt.correct);
    return correctIds.map(opt => opt.text).join(", ");
  }
}
