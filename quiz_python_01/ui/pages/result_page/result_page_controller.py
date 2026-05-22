from PyQt6.QtCore import QObject

from page_data.result_page.view_model import ResultPageViewModel
from ui.pages.result_page.result_page import ResultPage


class ResultPageController(QObject):
    def __init__(self, page: ResultPage):
        super().__init__()

        self.page = page

    def get_page_widget(self) -> ResultPage:
        return self.page

    def bind_events(self, on_restart_clicked) -> None:
        self.page.restart_clicked.connect(on_restart_clicked)

    def render(self, view_model: ResultPageViewModel) -> None:
        self.page.render(view_model)