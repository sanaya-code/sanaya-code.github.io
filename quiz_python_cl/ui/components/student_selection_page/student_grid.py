# quiz_app/ui/components/student_selection_page/student_grid.py

from PyQt6.QtWidgets import QWidget
from PyQt6.QtCore import pyqtSignal
from models.student.student_summary import StudentSummary
from ui.layouts.responsive_grid_layout import ResponsiveGridLayout
from ui.components.student_selection_page.student_card import StudentCard
from ui.components.student_selection_page.add_student_card import AddStudentCard


class StudentGrid(QWidget):

    student_selected = pyqtSignal(str)   # student_id
    add_student_requested = pyqtSignal()

    def __init__(self, parent=None):
        super().__init__(parent)
        from PyQt6.QtWidgets import QVBoxLayout
        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)

        self._grid = ResponsiveGridLayout(columns=4, h_spacing=16, v_spacing=16)
        layout.addWidget(self._grid)

    def populate(self, summaries: list[StudentSummary]) -> None:
        self._grid.clear_items()

        for summary in summaries:
            card = StudentCard(summary)
            card.clicked.connect(self.student_selected)
            self._grid.add_item(card)

        add_card = AddStudentCard()
        add_card.clicked.connect(self.add_student_requested)
        self._grid.add_item(add_card)
