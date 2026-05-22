from dataclasses import dataclass

from app.event_handlers.pages.question_bank_selection.select_question_bank_handler import (
    SelectQuestionBankHandler,
)
from app.event_handlers.pages.quiz.next_question_handler import NextQuestionHandler
from app.event_handlers.pages.student_selection.select_student_handler import (
    SelectStudentHandler,
)


@dataclass(frozen=True)
class EventHandlerBundle:
    select_student_handler: SelectStudentHandler
    select_question_bank_handler: SelectQuestionBankHandler
    next_question_handler: NextQuestionHandler