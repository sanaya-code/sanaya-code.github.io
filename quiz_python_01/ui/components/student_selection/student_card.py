from PyQt6.QtCore import pyqtSignal, Qt
from PyQt6.QtWidgets import QFrame, QLabel, QVBoxLayout

from page_data.student_selection.view_model import StudentCardViewModel


class StudentCard(QFrame):
    clicked = pyqtSignal(str)

    def __init__(self, view_model: StudentCardViewModel):
        super().__init__()

        self.view_model = view_model

        self.setObjectName("studentCard")
        self.setFixedSize(180, 160)
        self.setCursor(Qt.CursorShape.PointingHandCursor)

        self._build_ui()

    def _build_ui(self) -> None:
        layout = QVBoxLayout()
        layout.setSpacing(8)

        avatar = QLabel(self.view_model.avatar_text)
        avatar.setObjectName("studentAvatar")
        avatar.setFixedSize(60, 60)
        avatar.setAlignment(Qt.AlignmentFlag.AlignCenter)

        name_label = QLabel(self.view_model.name)
        name_label.setObjectName("studentName")
        name_label.setAlignment(Qt.AlignmentFlag.AlignCenter)

        grade_label = QLabel(self.view_model.grade)
        grade_label.setObjectName("studentGrade")
        grade_label.setAlignment(Qt.AlignmentFlag.AlignCenter)

        layout.addStretch()
        layout.addWidget(avatar, alignment=Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(name_label)
        layout.addWidget(grade_label)
        layout.addStretch()

        self.setLayout(layout)

    def mousePressEvent(self, event) -> None:
        self.clicked.emit(self.view_model.student_id)