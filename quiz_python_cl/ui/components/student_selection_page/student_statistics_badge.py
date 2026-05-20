# quiz_app/ui/components/student_selection_page/student_statistics_badge.py

from PyQt6.QtWidgets import QWidget, QHBoxLayout, QLabel
from PyQt6.QtCore import Qt


class StudentStatisticsBadge(QWidget):

    def __init__(self, success_percent: float = 0.0,
                 total_quizzes: int = 0, parent=None):
        super().__init__(parent)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(8)

        self._percent_label = QLabel()
        self._percent_label.setObjectName("SubTitle")
        self._percent_label.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self._quizzes_label = QLabel()
        self._quizzes_label.setObjectName("SubTitle")
        self._quizzes_label.setAlignment(Qt.AlignmentFlag.AlignCenter)

        layout.addWidget(self._percent_label)
        layout.addWidget(self._quizzes_label)

        self.update_stats(success_percent, total_quizzes)

    def update_stats(self, success_percent: float, total_quizzes: int) -> None:
        if total_quizzes == 0:
            self._percent_label.setText("No quizzes yet")
            self._quizzes_label.setText("")
        else:
            self._percent_label.setText(f"⭐ {success_percent:.0f}%")
            self._quizzes_label.setText(f"{total_quizzes} quiz{'zes' if total_quizzes != 1 else ''}")
