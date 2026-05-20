# quiz_app/ui/components/student_selection_page/add_student_card.py

from PyQt6.QtWidgets import QFrame, QVBoxLayout, QLabel
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QCursor


class AddStudentCard(QFrame):

    clicked = pyqtSignal()

    CARD_WIDTH  = 160
    CARD_HEIGHT = 180

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("AddStudentCard")
        self.setFixedSize(self.CARD_WIDTH, self.CARD_HEIGHT)
        self.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))

        layout = QVBoxLayout(self)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.setSpacing(8)
        layout.setContentsMargins(12, 16, 12, 16)

        icon = QLabel("＋")
        icon.setAlignment(Qt.AlignmentFlag.AlignCenter)
        icon.setStyleSheet("font-size: 36px; color: #4F46E5;")

        label = QLabel("Add New\nStudent")
        label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        label.setStyleSheet("font-size: 13px; color: #4F46E5; font-weight: 600;")

        layout.addWidget(icon)
        layout.addWidget(label)

    def mousePressEvent(self, event):
        if event.button() == Qt.MouseButton.LeftButton:
            self.clicked.emit()
        super().mousePressEvent(event)
