from page_data.quiz_page.hardcoded_questions import HARDCODED_QUESTIONS
from page_data.quiz_page.view_model import (
    OptionViewModel,
    QuestionViewModel,
    QuizPageViewModel,
)


class QuizPageRenderDataBuilder:
    def build(
        self,
        question_index: int = 0,
        questions: list[dict] | None = None,
    ) -> QuizPageViewModel:
        question_list = questions or HARDCODED_QUESTIONS
        question_data = question_list[question_index]

        question = QuestionViewModel(
            question_id=question_data["question_id"],
            question_type=question_data["type"],
            question_text=question_data["question_text"],
            options=[
                OptionViewModel(
                    option_id=option["option_id"],
                    text=option["text"],
                )
                for option in question_data["options"]
            ],
        )

        return QuizPageViewModel(
            page_title="Quiz",
            current_question_number=question_index + 1,
            total_questions=len(question_list),
            question=question,
        )

    def get_total_questions(self, questions: list[dict] | None = None) -> int:
        question_list = questions or HARDCODED_QUESTIONS
        return len(question_list)