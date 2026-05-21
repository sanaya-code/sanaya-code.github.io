from PyQt6.QtCore import pyqtSignal, Qt
from PyQt6.QtWidgets import QLabel, QVBoxLayout, QWidget, QGridLayout

from page_data.student_selection.view_model import StudentSelectionViewModel
from ui.components.student_selection.student_card import StudentCard


class StudentSelectionPage(QWidget):
    student_selected = pyqtSignal(str)

    def __init__(self):
        super().__init__()

        self.setObjectName("studentSelectionPage")

        self.main_layout = QVBoxLayout()
        self.main_layout.setContentsMargins(40, 40, 40, 40)
        self.main_layout.setSpacing(20)

        self.setLayout(self.main_layout)

    def render(self, view_model: StudentSelectionViewModel) -> None:
        self._clear_layout()

        title = QLabel(view_model.page_title)
        title.setObjectName("pageTitle")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)

        subtitle = QLabel(view_model.subtitle)
        subtitle.setObjectName("pageSubtitle")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)

        grid = QGridLayout()
        grid.setSpacing(20)

        for index, student_vm in enumerate(view_model.students):
            card = StudentCard(student_vm)
            card.clicked.connect(self.student_selected.emit)

            row = index // 3
            col = index % 3
            grid.addWidget(card, row, col)

        self.main_layout.addWidget(title)
        self.main_layout.addWidget(subtitle)
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