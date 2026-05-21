from app.event_handlers.student_selection.select_student_handler import (
    SelectStudentHandler,
)
from page_data.student_selection.render_data_builder import (
    StudentSelectionRenderDataBuilder,
)
from ui.navigation.app_router import AppRouter
from ui.pages.student_selection_page.student_selection_page import StudentSelectionPage


class MainController:
    def __init__(
        self,
        router: AppRouter,
        student_selection_page: StudentSelectionPage,
        student_selection_data_builder: StudentSelectionRenderDataBuilder,
        select_student_handler: SelectStudentHandler,
    ):
        self.router = router
        self.student_selection_page = student_selection_page
        self.student_selection_data_builder = student_selection_data_builder
        self.select_student_handler = select_student_handler

    def start(self) -> None:
        self._connect_signals()
        self._register_pages()
        self._load_student_selection_page()

    def _connect_signals(self) -> None:
        self.student_selection_page.student_selected.connect(
            self.select_student_handler.handle
        )

    def _register_pages(self) -> None:
        self.router.register_page(
            "student_selection_page",
            self.student_selection_page,
        )

    def _load_student_selection_page(self) -> None:
        view_model = self.student_selection_data_builder.build()
        self.student_selection_page.render(view_model)
        self.router.show_page("student_selection_page")