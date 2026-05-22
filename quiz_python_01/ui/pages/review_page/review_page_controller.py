from PyQt6.QtCore import QObject

from page_data.review_page.view_model import ReviewPageViewModel
from ui.pages.review_page.review_page import ReviewPage


class ReviewPageController(QObject):
    def __init__(self, page: ReviewPage):
        super().__init__()
        self.page = page

    def get_page_widget(self) -> ReviewPage:
        return self.page

    def bind_events(
        self,
        on_wrong_tab_clicked,
        on_unanswered_tab_clicked,
        on_correct_tab_clicked,
        on_back_to_home_clicked,
    ) -> None:
        self.page.wrong_tab_clicked.connect(on_wrong_tab_clicked)
        self.page.unanswered_tab_clicked.connect(on_unanswered_tab_clicked)
        self.page.correct_tab_clicked.connect(on_correct_tab_clicked)
        self.page.back_to_home_clicked.connect(on_back_to_home_clicked)

    def render(self, view_model: ReviewPageViewModel) -> None:
        self.page.render(view_model)