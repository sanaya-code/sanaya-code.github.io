from dataclasses import dataclass

from ui.pages.question_bank_selection_page.question_bank_selection_page_controller import (
    QuestionBankSelectionPageController,
)
from ui.pages.quiz_page.quiz_page_controller import QuizPageController
from ui.pages.result_page.result_page_controller import ResultPageController
from ui.pages.student_selection_page.student_selection_page_controller import (
    StudentSelectionPageController,
)


@dataclass(frozen=True)
class UIPageBundle:
    student_selection_page: StudentSelectionPageController
    question_bank_selection_page: QuestionBankSelectionPageController
    quiz_page: QuizPageController
    result_page: ResultPageController