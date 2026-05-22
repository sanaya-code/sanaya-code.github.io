from app.event_handlers.event_handler_bundle import EventHandlerBundle
from app.event_handlers.pages.question_bank_selection.select_question_bank_handler import (
    SelectQuestionBankHandler,
)
from app.event_handlers.pages.quiz.next_question_handler import NextQuestionHandler
from app.event_handlers.pages.result.restart_quiz_handler import RestartQuizHandler
from app.event_handlers.pages.student_selection.select_student_handler import (
    SelectStudentHandler,
)
from app.state.app_state_controller import AppStateController
from page_data.question_bank_selection.render_data_builder import (
    QuestionBankSelectionRenderDataBuilder,
)
from page_data.quiz_page.render_data_builder import QuizPageRenderDataBuilder
from page_data.result_page.render_data_builder import ResultPageRenderDataBuilder
from page_data.student_selection.render_data_builder import (
    StudentSelectionRenderDataBuilder,
)
from ui.navigation.app_router_controller import AppRouterController
from ui.ui_page_bundle import UIPageBundle


class EventHandlerComposer:
    def create_event_handlers(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
        router_controller: AppRouterController,
        question_bank_selection_data_builder: QuestionBankSelectionRenderDataBuilder,
        quiz_page_data_builder: QuizPageRenderDataBuilder,
        result_page_data_builder: ResultPageRenderDataBuilder,
        student_selection_data_builder: StudentSelectionRenderDataBuilder,
    ) -> EventHandlerBundle:
        select_student_handler = SelectStudentHandler(
            app_state_controller=app_state_controller,
            ui_pages=ui_pages,
            router_controller=router_controller,
            question_bank_selection_data_builder=question_bank_selection_data_builder,
        )

        select_question_bank_handler = SelectQuestionBankHandler(
            app_state_controller=app_state_controller,
            ui_pages=ui_pages,
            router_controller=router_controller,
            quiz_page_data_builder=quiz_page_data_builder,
        )

        next_question_handler = NextQuestionHandler(
            app_state_controller=app_state_controller,
            ui_pages=ui_pages,
            quiz_page_data_builder=quiz_page_data_builder,
            result_page_data_builder=result_page_data_builder,
            router_controller=router_controller,
        )

        restart_quiz_handler = RestartQuizHandler(
            app_state_controller=app_state_controller,
            ui_pages=ui_pages,
            router_controller=router_controller,
            student_selection_data_builder=student_selection_data_builder,
        )

        return EventHandlerBundle(
            select_student_handler=select_student_handler,
            select_question_bank_handler=select_question_bank_handler,
            next_question_handler=next_question_handler,
            restart_quiz_handler=restart_quiz_handler,
        )