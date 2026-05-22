from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QLabel, QGridLayout, QVBoxLayout, QWidget

from page_data.question_bank_selection.view_model import (
    QuestionBankSelectionViewModel,
)
from ui.components.common.file_picker_button.file_picker_button import FilePickerButton
from ui.components.question_bank_selection.question_bank_card import QuestionBankCard


class QuestionBankSelectionPage(QWidget):
    question_bank_selected = pyqtSignal(str)
    question_bank_json_selected = pyqtSignal(str)

    def __init__(self):
        super().__init__()

        self.setObjectName("questionBankSelectionPage")

        self.main_layout = QVBoxLayout()
        self.main_layout.setContentsMargins(40, 40, 40, 40)
        self.main_layout.setSpacing(20)

        self.setLayout(self.main_layout)

    def render(self, view_model: QuestionBankSelectionViewModel) -> None:
        self._clear_layout()

        title = QLabel(view_model.page_title)
        title.setObjectName("pageTitle")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)

        subtitle = QLabel(view_model.subtitle)
        subtitle.setObjectName("pageSubtitle")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)

        file_picker_button = FilePickerButton("Load Question Bank JSON")
        file_picker_button.file_selected.connect(self.question_bank_json_selected.emit)

        grid = QGridLayout()
        grid.setSpacing(20)

        for index, question_bank_vm in enumerate(view_model.question_banks):
            card = QuestionBankCard(question_bank_vm)
            card.clicked.connect(self.question_bank_selected.emit)

            row = index // 3
            col = index % 3
            grid.addWidget(card, row, col)

        self.main_layout.addWidget(title)
        self.main_layout.addWidget(subtitle)
        self.main_layout.addWidget(file_picker_button, alignment=Qt.AlignmentFlag.AlignCenter)
        self.main_layout.addSpacing(20)
        self.main_layout.addLayout(grid)
        self.main_layout.addStretch()

    def _clear_layout(self) -> None:
        while self.main_layout.count():
            item = self.main_layout.takeAt(0)

            widget = item.widget()
            if widget is not None:
                widget.deleteLater()

            child_layout = item.layout()
            if child_layout is not None:
                self._clear_child_layout(child_layout)

    def _clear_child_layout(self, layout) -> None:
        while layout.count():
            item = layout.takeAt(0)

            widget = item.widget()
            if widget is not None:
                widget.deleteLater()