from PyQt6.QtWidgets import QMainWindow

from app.event_handlers.student_selection.select_student_handler import (
    SelectStudentHandler,
)
from app.main_controller import MainController
from app.state.app_state import AppState
from config.app_config import APP_TITLE, WINDOW_HEIGHT, WINDOW_WIDTH
from page_data.student_selection.render_data_builder import (
    StudentSelectionRenderDataBuilder,
)
from ui.navigation.app_router import AppRouter
from ui.pages.student_selection_page.student_selection_page import StudentSelectionPage


class AppComposer:
    def create_app(self) -> QMainWindow:
        main_window = QMainWindow()
        main_window.setWindowTitle(APP_TITLE)
        main_window.resize(WINDOW_WIDTH, WINDOW_HEIGHT)

        app_state = AppState()

        router = AppRouter(main_window)

        student_selection_page = StudentSelectionPage()
        student_selection_data_builder = StudentSelectionRenderDataBuilder()

        select_student_handler = SelectStudentHandler(app_state)

        main_controller = MainController(
            router=router,
            student_selection_page=student_selection_page,
            student_selection_data_builder=student_selection_data_builder,
            select_student_handler=select_student_handler,
        )

        main_controller.start()

        main_window.main_controller = main_controller
        main_window.app_state = app_state

        return main_window