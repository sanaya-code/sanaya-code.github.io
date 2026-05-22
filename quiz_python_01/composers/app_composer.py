from PyQt6.QtWidgets import QMainWindow

from app.event_handlers.event_handler_composer import EventHandlerComposer
from app.main_controller import MainController
from app.state.app_state import AppState
from app.state.app_state_controller import AppStateController
from config.app_config import APP_TITLE, WINDOW_HEIGHT, WINDOW_WIDTH
from page_data.question_bank_selection.render_data_builder import (
    QuestionBankSelectionRenderDataBuilder,
)
from page_data.quiz_page.quiz_data_loader import QuizDataLoader
from page_data.quiz_page.render_data_builder import QuizPageRenderDataBuilder
from page_data.result_page.render_data_builder import ResultPageRenderDataBuilder
from page_data.review_page.render_data_builder import ReviewPageRenderDataBuilder
from page_data.student_selection.render_data_builder import (
    StudentSelectionRenderDataBuilder,
)
from ui.ui_composer import UIComposer


class AppComposer:
    def create_app(self) -> QMainWindow:
        main_window = QMainWindow()
        main_window.setWindowTitle(APP_TITLE)
        main_window.resize(WINDOW_WIDTH, WINDOW_HEIGHT)

        app_state = AppState()
        app_state_controller = AppStateController(app_state)

        ui_composer = UIComposer()
        router_controller = ui_composer.create_router_controller(main_window)
        ui_pages = ui_composer.create_ui()

        student_selection_data_builder = StudentSelectionRenderDataBuilder()
        question_bank_selection_data_builder = QuestionBankSelectionRenderDataBuilder()
        quiz_page_data_builder = QuizPageRenderDataBuilder()
        result_page_data_builder = ResultPageRenderDataBuilder()
        review_page_data_builder = ReviewPageRenderDataBuilder()
        quiz_data_loader = QuizDataLoader()

        event_handler_composer = EventHandlerComposer()
        event_handlers = event_handler_composer.create_event_handlers(
            app_state_controller=app_state_controller,
            ui_pages=ui_pages,
            router_controller=router_controller,
            question_bank_selection_data_builder=question_bank_selection_data_builder,
            quiz_page_data_builder=quiz_page_data_builder,
            result_page_data_builder=result_page_data_builder,
            review_page_data_builder=review_page_data_builder,
            student_selection_data_builder=student_selection_data_builder,
            quiz_data_loader=quiz_data_loader,
        )

        main_controller = MainController(
            router_controller=router_controller,
            ui_pages=ui_pages,
            event_handlers=event_handlers,
            student_selection_data_builder=student_selection_data_builder,
        )

        main_controller.start()

        main_window.main_controller = main_controller
        main_window.app_state_controller = app_state_controller

        return main_window