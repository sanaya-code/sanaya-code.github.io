# quiz_app/ui/components/student_selection_page/student_card.py

from PyQt6.QtWidgets import QFrame, QVBoxLayout, QLabel
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QCursor
from models.student.student_summary import StudentSummary
from ui.components.student_selection_page.student_statistics_badge import StudentStatisticsBadge


class StudentCard(QFrame):

    clicked = pyqtSignal(str)   # emits student_id

    CARD_WIDTH  = 160
    CARD_HEIGHT = 180

    def __init__(self, summary: StudentSummary, parent=None):
        super().__init__(parent)
        self._student_id = summary.profile.student_id
        self.setObjectName("StudentCard")
        self.setFixedSize(self.CARD_WIDTH, self.CARD_HEIGHT)
        self.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))

        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setSpacing(6)
        layout.setContentsMargins(12, 16, 12, 16)

        avatar = QLabel("👤")
        avatar.setAlignment(Qt.AlignmentFlag.AlignCenter)
        avatar.setStyleSheet("font-size: 36px;")

        name = QLabel(summary.profile.name)
        name.setObjectName("SectionTitle")
        name.setAlignment(Qt.AlignmentFlag.AlignCenter)
        name.setStyleSheet("font-size: 14px; font-weight: 600;")
        name.setWordWrap(True)

        badge = StudentStatisticsBadge(
            summary.overall_success_percent,
            summary.total_quizzes
        )

        layout.addWidget(avatar)
        layout.addWidget(name)
        layout.addWidget(badge)

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.clicked.emit(self._student_id)
        super().mousePressEvent(event)
