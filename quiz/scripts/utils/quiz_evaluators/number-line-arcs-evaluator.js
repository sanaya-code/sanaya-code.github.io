class NumberLineArcsEvaluator {
  static checkAnswer(question) {
    if (!Array.isArray(question.user_response)) return false;

    const correct = question.pairs.map(p => [...p].sort().join("-"));
    const user = question.user_response.map(p => [...p].sort().join("-"));

    return correct.length === user.length && correct.every(p => user.includes(p));
  }

  static formatUserAnswer(question) {
    return (question.user_response || [])
      .map(pair => `${pair[0]} ↔ ${pair[1]}`)
      .join("; ");
  }

  static formatCorrectAnswer(question) {
    return (question.pairs || [])
      .map(pair => `${pair[0]} ↔ ${pair[1]}`)
      .join("; ");
  }
}
