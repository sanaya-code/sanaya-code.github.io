class SelectTwoQuantitiesEvaluator {
  /**
   * Check if user's answer is fully correct
   */
  static checkAnswer(question, userAnswer) {
    if (!userAnswer) return false;
    return question.required_selections.every(
      (sel) => userAnswer[sel.key] === question.correct_answer[sel.key]
    );
  }

  /**
   * Format user's answer for reporting
   */
  static formatUserAnswer(question, userAnswer) {
    if (!userAnswer) return "Not answered";
    return question.required_selections
      .map((sel) => {
        const qty = question.quantities.find(
          (q) => q.id === userAnswer[sel.key]
        );
        return `${sel.label}: ${qty ? qty.value : "Not answered"}`;
      })
      .join("; ");
  }

  /**
   * Format correct answer for reporting
   */
  static formatCorrectAnswer(question) {
    return question.required_selections
      .map((sel) => {
        const qty = question.quantities.find(
          (q) => q.id === question.correct_answer[sel.key]
        );
        return `${sel.label}: ${qty ? qty.value : "?"}`;
      })
      .join("; ");
  }
}