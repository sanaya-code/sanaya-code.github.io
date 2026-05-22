from question_types.base.answer_status import AnswerStatus


class MCQScorer:
    def score(self, question_data: dict, user_answer: str | None) -> AnswerStatus:
        if user_answer is None:
            return AnswerStatus.UNANSWERED

        correct_option_id = question_data["correct_option_id"]

        if user_answer == correct_option_id:
            return AnswerStatus.CORRECT

        return AnswerStatus.WRONG