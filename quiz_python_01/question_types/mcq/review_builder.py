from question_types.base.review_question_model import ReviewQuestionModel
from question_types.mcq.scorer import MCQScorer


class MCQReviewBuilder:
    def __init__(self):
        self.scorer = MCQScorer()

    def build(self, question_data: dict, user_answer: str | None) -> ReviewQuestionModel:
        status = self.scorer.score(
            question_data=question_data,
            user_answer=user_answer,
        )

        option_text_map = {
            option["option_id"]: option["text"]
            for option in question_data["options"]
        }

        correct_option_id = question_data["correct_option_id"]

        user_answer_display = "Not answered"
        if user_answer is not None:
            user_answer_display = option_text_map.get(user_answer, "Unknown answer")

        correct_answer_display = option_text_map.get(
            correct_option_id,
            "Unknown correct answer",
        )

        return ReviewQuestionModel(
            question_id=question_data["question_id"],
            question_text=question_data["question_text"],
            status=status,
            user_answer_display=user_answer_display,
            correct_answer_display=correct_answer_display,
        )