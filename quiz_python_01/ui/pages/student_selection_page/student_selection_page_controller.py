from PyQt6.QtCore import QObject

from page_data.student_selection.view_model import StudentSelectionViewModel
from ui.navigation.app_router import AppRouter
from ui.pages.student_selection_page.student_selection_page import StudentSelectionPage


class StudentSelectionPageController(QObject):
    def __init__(self, page: StudentSelectionPage, router: AppRouter):
        super().__init__()

        self.page = page
        self.router = router

    def bind_events(self, on_student_selected) -> None:
        self.page.student_selected.connect(on_student_selected)

    def register_page(self) -> None:
        self.router.register_page(
            "student_selection_page",
            self.page,
        )

    def show_page(self) -> None:
        self.router.show_page("student_selection_page")

    def render(self, view_model: StudentSelectionViewModel) -> None:
        self.page.render(view_model)