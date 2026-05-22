from dataclasses import dataclass

from app.event_handlers.pages.question_bank_selection.select_question_bank_handler import (
    SelectQuestionBankHandler,
)
from app.event_handlers.pages.quiz.next_question_handler import NextQuestionHandler
from app.event_handlers.pages.result.open_review_handler import OpenReviewHandler
from app.event_handlers.pages.result.restart_quiz_handler import RestartQuizHandler
from app.event_handlers.pages.review.back_to_home_from_review_handler import (
    BackToHomeFromReviewHandler,
)
from app.event_handlers.pages.review.show_correct_questions_handler import (
    ShowCorrectQuestionsHandler,
)
from app.event_handlers.pages.review.show_unanswered_questions_handler import (
    ShowUnansweredQuestionsHandler,
)
from app.event_handlers.pages.review.show_wrong_questions_handler import (
    ShowWrongQuestionsHandler,
)
from app.event_handlers.pages.student_selection.select_student_handler import (
    SelectStudentHandler,
)


@dataclass(frozen=True)
class EventHandlerBundle:
    select_student_handler: SelectStudentHandler
    select_question_bank_handler: SelectQuestionBankHandler
    next_question_handler: NextQuestionHandler
    restart_quiz_handler: RestartQuizHandler
    open_review_handler: OpenReviewHandler
    show_wrong_questions_handler: ShowWrongQuestionsHandler
    show_unanswered_questions_handler: ShowUnansweredQuestionsHandler
    show_correct_questions_handler: ShowCorrectQuestionsHandler
    back_to_home_from_review_handler: BackToHomeFromReviewHandler