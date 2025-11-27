class OptionsFillInBlankEvaluator {

    static checkAnswer(question, userResponse) {
      if (!question.options || !userResponse) return false;
  
      const opts = question.options;
  
      for (let i = 0; i < opts.length; i++) {
        const option = opts[i];
        const correctArr = option.correct_answer;     // array of correct values
        const userArr = userResponse[i];              // array of user values
  
        if (!Array.isArray(correctArr) || !Array.isArray(userArr)) {
          return false;
        }
  
        if (correctArr.length !== userArr.length) {
          return false;
        }
  
        for (let j = 0; j < correctArr.length; j++) {
          const cVal = correctArr[j];
          const uVal = userArr[j] || "";
  
          // If correct is empty string => ignore this blank
          if (cVal === "" || cVal === null || cVal === undefined) {
            continue;
          }
  
          // Check acceptable answers if they exist
          const acceptable = Array.isArray(option.acceptable_answers?.[j])
            ? option.acceptable_answers[j]
            : [cVal];
  
          let matchFound = false;
  
          for (const acc of acceptable) {
            if (question.case_sensitive === false) {
              if (String(acc).toLowerCase() === String(uVal).toLowerCase()) {
                matchFound = true;
                break;
              }
            } else {
              if (String(acc) === String(uVal)) {
                matchFound = true;
                break;
              }
            }
          }
  
          if (!matchFound) return false;
        }
      }
  
      return true;
    }
  
    static formatUserAnswer(question, userResponse) {
      if (!question.options || !userResponse) return "";
  
      return question.options
        .map((opt, idx) => {
          const arr = userResponse[idx] || [];
          return `Option ${opt.id}: ${OptionsFillInBlankEvaluator.toRowString(arr)}`;
        })
        .join(" | ");
    }
  
    static formatCorrectAnswer(question) {
      return question.options
        .map((opt, idx) => {
          const arr = opt.correct_answer || [];
          return `Option ${opt.id}: ${OptionsFillInBlankEvaluator.toRowString(arr)}`;
        })
        .join(" | ");
    }
  
    static toRowString(arr) {
      if (!Array.isArray(arr)) return "";
      return arr.map(v => (v === "" ? "?" : v)).join(" ");
    }
  }
  