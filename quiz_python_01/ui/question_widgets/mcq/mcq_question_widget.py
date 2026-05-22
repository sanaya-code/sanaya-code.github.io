from PyQt6.QtWidgets import QButtonGroup, QLabel, QRadioButton, QVBoxLayout

from page_data.quiz_page.view_model import QuestionViewModel
from ui.question_widgets.base_question_widget import BaseQuestionWidget


class MCQQuestionWidget(BaseQuestionWidget):
    def __init__(self, question: QuestionViewModel):
        super().__init__()

        self.question = question
        self.button_group = QButtonGroup(self)
        self.button_group.setExclusive(True)

        self.setObjectName("mcqQuestionWidget")

        self._build_ui()

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setSpacing(12)

        question_label = QLabel(self.question.question_text)
        question_label.setObjectName("questionText")
        question_label.setWordWrap(True)

        layout.addWidget(question_label)

        for option in self.question.options:
            radio = QRadioButton(option.text)
            radio.setObjectName("mcqOption")
            radio.option_id = option.option_id

            self.button_group.addButton(radio)
            layout.addWidget(radio)

        layout.addStretch()

    def get_user_answer(self) -> str | None:
        checked = self.button_group.checkedButton()

        if checked is None:
            return None

        return checked.option_id