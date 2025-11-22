class FillInBlankOperationEvaluator {

  static checkAnswer(question, userResponse) {
    if (!question.correct_answer || !userResponse) return false;

    const correct = question.correct_answer;

    // For each row listed in correct_answer
    for (const rowName of Object.keys(correct)) {

      const ca = correct[rowName];          // correct row (array)
      const ua = userResponse[rowName];     // user row (array)

      // If user_response does NOT contain this row → fail
      if (!Array.isArray(ua)) return false;

      // Length must match
      if (ua.length !== ca.length) return false;

      // Compare each position
      for (let i = 0; i < ca.length; i++) {
        const cVal = ca[i];
        const uVal = ua[i];

        // Empty correct-value ("") means ignore
        if (cVal === "" || cVal === null || cVal === undefined) {
          continue;
        }

        // Compare (case sensitivity depends on question)
        if (question.case_sensitive === false) {
          if (String(cVal).toLowerCase() !== String(uVal || "").toLowerCase()) {
            return false;
          }
        } else {
          if (String(cVal) !== String(uVal || "")) {
            return false;
          }
        }
      }
    }

    return true; // All checks passed
  }

  static formatUserAnswer(question, userResponse) {
    if (!question.correct_answer || !userResponse) return "";

    return Object.keys(question.correct_answer)
      .map(rowName => `${rowName}: ${FillInBlankOperationEvaluator.toRowString(userResponse[rowName])}`)
      .join(" | ");
  }

  static formatCorrectAnswer(question) {
    return Object.keys(question.correct_answer)
      .map(rowName => `${rowName}: ${FillInBlankOperationEvaluator.toRowString(question.correct_answer[rowName])}`)
      .join(" | ");
  }

  static toRowString(arr) {
    if (!Array.isArray(arr)) return "";
    return arr.map(v => (v === "" ? "?" : v)).join(" ");
  }
}
