from PyQt6.QtCore import QObject

from page_data.student_selection.view_model import StudentSelectionViewModel
from ui.pages.student_selection_page.student_selection_page import StudentSelectionPage


class StudentSelectionPageController(QObject):
    def __init__(self, page: StudentSelectionPage):
        super().__init__()
        self.page = page

    def get_page_widget(self) -> StudentSelectionPage:
        return self.page

    def bind_events(self, on_student_selected) -> None:
        self.page.student_selected.connect(on_student_selected)

    def render(self, view_model: StudentSelectionViewModel) -> None:
        self.page.render(view_model)