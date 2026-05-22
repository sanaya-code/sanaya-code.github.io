from PyQt6.QtCore import QObject

from page_data.quiz_page.view_model import QuizPageViewModel
from ui.pages.quiz_page.quiz_page import QuizPage


class QuizPageController(QObject):
    def __init__(self, page: QuizPage):
        super().__init__()
        self.page = page

    def get_page_widget(self) -> QuizPage:
        return self.page

    def bind_events(self, on_next_clicked) -> None:
        self.page.next_clicked.connect(on_next_clicked)

    def render(self, view_model: QuizPageViewModel) -> None:
        self.page.render(view_model)

    def get_current_answer(self):
        return self.page.get_current_answer()