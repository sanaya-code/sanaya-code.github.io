class FillInTheBlankMutiGraph {
    static checkAnswer(question, userAnswer) {
      if (!Array.isArray(userAnswer)) return false;
      return question.correct_answer.every((ans, idx) => userAnswer[idx] === ans);
    }
  
    static formatUserAnswer(question, userAnswer) {
      return question.blocks
        .map((block, idx) => `${block.a} ${block.b} ${userAnswer[idx] || "?"}  = ${question.center_label}`)
        .join("; ");
    }
  
    static formatCorrectAnswer(question) {
      return question.blocks
        .map((block, idx) => `${block.a} ${block.b} ${question.correct_answer[idx] || "?"}  = ${question.center_label}`)
        .join("; ");
    }
  }
  