# ui/components/student_selection_page/student_grid.py

from PyQt6.QtWidgets import QWidget, QGridLayout

from ui.components.student_selection_page.student_card import StudentCard


class StudentGrid(QWidget):
    def __init__(self):
        super().__init__()

        self.grid_layout = QGridLayout()
        self.grid_layout.setSpacing(24)
        self.setLayout(self.grid_layout)

    def set_students(self, students):
        self.clear_grid()

        columns = 3

        for index, student in enumerate(students):
            row = index // columns
            col = index % columns

            card = StudentCard(student)
            self.grid_layout.addWidget(card, row, col)

    def clear_grid(self):
        while self.grid_layout.count():
            item = self.grid_layout.takeAt(0)
            widget = item.widget()

            if widget:
                widget.deleteLater()