from page_data.quiz_page.hardcoded_questions import HARDCODED_QUESTIONS
from page_data.review_page.view_model import (
    ReviewPageViewModel,
    ReviewQuestionViewModel,
)
from question_types.base.answer_status import AnswerStatus
from question_types.registry.question_type_registry import QuestionTypeRegistry


class ReviewPageRenderDataBuilder:
    def __init__(self):
        self.question_type_registry = QuestionTypeRegistry()

    def build(
        self,
        user_answers: dict[str, str | None],
        active_tab: str = "wrong",
    ) -> ReviewPageViewModel:
        correct_questions: list[ReviewQuestionViewModel] = []
        wrong_questions: list[ReviewQuestionViewModel] = []
        unanswered_questions: list[ReviewQuestionViewModel] = []

        for question_data in HARDCODED_QUESTIONS:
            question_id = question_data["question_id"]
            question_type = question_data["type"]
            user_answer = user_answers.get(question_id)

            review_builder = self.question_type_registry.get_review_builder(
                question_type
            )

            review_model = review_builder.build(
                question_data=question_data,
                user_answer=user_answer,
            )

            question_vm = ReviewQuestionViewModel(
                question_id=review_model.question_id,
                question_text=review_model.question_text,
                status=review_model.status.value,
                user_answer_display=review_model.user_answer_display,
                correct_answer_display=review_model.correct_answer_display,
            )

            if review_model.status == AnswerStatus.CORRECT:
                correct_questions.append(question_vm)
            elif review_model.status == AnswerStatus.WRONG:
                wrong_questions.append(question_vm)
            else:
                unanswered_questions.append(question_vm)

        selected_questions = wrong_questions

        if active_tab == "correct":
            selected_questions = correct_questions
        elif active_tab == "unanswered":
            selected_questions = unanswered_questions

        return ReviewPageViewModel(
            page_title="Quiz Review",
            active_tab=active_tab,
            total_questions=len(HARDCODED_QUESTIONS),
            correct_count=len(correct_questions),
            wrong_count=len(wrong_questions),
            unanswered_count=len(unanswered_questions),
            questions=selected_questions,
        )