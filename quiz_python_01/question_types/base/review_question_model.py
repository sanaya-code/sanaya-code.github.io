from dataclasses import dataclass

from question_types.base.answer_status import AnswerStatus


@dataclass
class ReviewQuestionModel:
    question_id: str
    question_text: str
    status: AnswerStatus
    user_answer_display: str
    correct_answer_display: str