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


/*

<link rel="stylesheet" href="../styles/multi-select-two.css" />

<script src="../scripts/components/multi-select-two.js"></script>
<script src="../scripts/utils/quiz_evaluators/MultiSelectTwo.js"></script>

<script>
    const config = {
      type: "select_two_quantities",
      id: "18",
      question: "Highlight the largest and smallest numbers.",
      quantities: [
        { id: "1", value: 12 },
        { id: "2", value: 45 },
        { id: "3", value: 7 },
        { id: "4", value: 28 },
        { id: "5", value: 33 },
      ],
      required_selections: [
        {
          label: "Smallest",
          key: "smallest",
          highlight_style: { type: "color", value: "green" },
        },
        {
          label: "Greatest",
          key: "greatest",
          highlight_style: { type: "mark", value: "square" },
        },
      ],
      available_highlight_styles: [
        { type: "shape", value: "circle", description: "Encircle the selection" },
        { type: "shape", value: "square", description: "Square border" },
        { type: "color", value: "red", description: "Fill background with red" },
        { type: "color", value: "green", description: "Fill background with green" },
        { type: "mark", value: "tick", description: "Tick mark next to selection" },
      ],
      correct_answer: { smallest: "3", greatest: "2" },
      user_response: { smallest: "", greatest: "" },
      explanation: "7 is the smallest number and 45 is the greatest number in the list.",
      difficulty: "medium",
      tags: ["math", "number_comparison"],
      points: 2,
      time_limit: 45,
    };

    const comp = document.getElementById("q1");
    comp.setAttribute("config", JSON.stringify(config));

    comp.addEventListener("input-change", (e) => {
      console.log("Updated response:", e.detail.user_response);
    });

    // Example evaluation after 5 seconds
    setTimeout(() => {
      const userAnswer = comp.getUserAnswer();
      console.log("User Answer:", userAnswer);
      console.log(
        "Correct?",
        SelectTwoQuantitiesEvaluator.checkAnswer(config, userAnswer)
      );
      console.log(
        "Formatted User Answer:",
        SelectTwoQuantitiesEvaluator.formatUserAnswer(config, userAnswer)
      );
      console.log(
        "Correct Answer:",
        SelectTwoQuantitiesEvaluator.formatCorrectAnswer(config)
      );
    }, 5000);
  </script>


*/