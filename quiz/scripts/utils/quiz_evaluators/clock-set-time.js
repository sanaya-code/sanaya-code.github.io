class ClockSetTimeOperationEvaluator {

    static checkAnswer(question, userResponse) {
      if (!question.correct_answer || !userResponse) return false;
  
      const correct = question.correct_answer;
      // For clock, correct_answer has { hour: number|null, minute: number|null }
      // userResponse is expected same shape
  
      if (typeof userResponse.hour !== "number" || typeof userResponse.minute !== "number") {
        return false; // both hands must be set
      }
  
      // Compare hour and minute with exact match
      // Allow small tolerance for floating numbers on hour (e.g., 4.5 for 4:30)
      const hourMatch = Math.abs(correct.hour - userResponse.hour) < 0.01;
      const minuteMatch = Math.abs(correct.minute - userResponse.minute) < 0.01;
  
      return hourMatch && minuteMatch;
    }
  
    static formatUserAnswer(question, userResponse) {
      if (!question.correct_answer || !userResponse) return "";
  
      const hour = userResponse.hour !== null && userResponse.hour !== undefined ? userResponse.hour : "?";
      const minute = userResponse.minute !== null && userResponse.minute !== undefined ? userResponse.minute : "?";
  
      return `hour: ${hour}, minute: ${minute}`;
    }
  
    static formatCorrectAnswer(question) {
      if (!question.correct_answer) return "";
  
      const hour = question.correct_answer.hour !== null && question.correct_answer.hour !== undefined ? question.correct_answer.hour : "?";
      const minute = question.correct_answer.minute !== null && question.correct_answer.minute !== undefined ? question.correct_answer.minute : "?";
  
      return `hour: ${hour}, minute: ${minute}`;
    }
  }
  