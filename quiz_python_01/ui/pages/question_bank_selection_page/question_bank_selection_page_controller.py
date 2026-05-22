from PyQt6.QtCore import QObject

from page_data.question_bank_selection.view_model import (
    QuestionBankSelectionViewModel,
)
from ui.pages.question_bank_selection_page.question_bank_selection_page import (
    QuestionBankSelectionPage,
)


class QuestionBankSelectionPageController(QObject):
    def __init__(self, page: QuestionBankSelectionPage):
        super().__init__()
        self.page = page

    def get_page_widget(self) -> QuestionBankSelectionPage:
        return self.page

    def bind_events(
        self,
        on_question_bank_selected,
        on_question_bank_json_selected,
    ) -> None:
        self.page.question_bank_selected.connect(on_question_bank_selected)
        self.page.question_bank_json_selected.connect(on_question_bank_json_selected)

    def render(self, view_model: QuestionBankSelectionViewModel) -> None:
        self.page.render(view_model)