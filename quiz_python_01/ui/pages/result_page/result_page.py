from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import QLabel, QPushButton, QVBoxLayout, QWidget

from page_data.result_page.view_model import ResultPageViewModel
from ui.components.result.result_summary_card import ResultSummaryCard


class ResultPage(QWidget):
    restart_clicked = pyqtSignal()

    def __init__(self):
        super().__init__()

        self.setObjectName("resultPage")

        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(40, 40, 40, 40)
        self.main_layout.setSpacing(20)

    def render(self, view_model: ResultPageViewModel) -> None:
        self._clear_layout()

        title = QLabel(view_model.page_title)
        title.setObjectName("pageTitle")

        summary_card = ResultSummaryCard(view_model)

        restart_button = QPushButton("Back To Home")
        restart_button.setObjectName("primaryButton")
        restart_button.clicked.connect(self.restart_clicked.emit)

        self.main_layout.addWidget(title)
        self.main_layout.addWidget(summary_card)
        self.main_layout.addStretch()
        self.main_layout.addWidget(restart_button)

    def _clear_layout(self) -> None:
        while self.main_layout.count():
            item = self.main_layout.takeAt(0)

            widget = item.widget()

            if widget is not None:
                widget.deleteLater()