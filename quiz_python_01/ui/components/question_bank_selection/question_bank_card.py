from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtWidgets import QFrame, QLabel, QVBoxLayout, QSizePolicy

from page_data.question_bank_selection.view_model import QuestionBankCardViewModel


class QuestionBankCard(QFrame):
    clicked = pyqtSignal(str)

    def __init__(self, view_model: QuestionBankCardViewModel):
        super().__init__()

        self.view_model = view_model

        self.setObjectName("questionBankCard")
        self.setFixedSize(220, 170)
        self.setCursor(Qt.CursorShape.PointingHandCursor)
        self.setSizePolicy(QSizePolicy.Policy.Fixed, QSizePolicy.Policy.Fixed)

        self._build_ui()

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setContentsMargins(12, 12, 12, 12)
        layout.setSpacing(8)

        title = QLabel(self.view_model.title)
        title.setObjectName("questionBankTitle")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)

        subject = QLabel(self.view_model.subject)
        subject.setObjectName("questionBankSubject")
        subject.setAlignment(Qt.AlignmentFlag.AlignCenter)

        grade = QLabel(self.view_model.grade)
        grade.setObjectName("questionBankGrade")
        grade.setAlignment(Qt.AlignmentFlag.AlignCenter)

        count = QLabel(f"{self.view_model.total_questions} Questions")
        count.setObjectName("questionBankCount")
        count.setAlignment(Qt.AlignmentFlag.AlignCenter)

        layout.addStretch()
        layout.addWidget(title)
        layout.addWidget(subject)
        layout.addWidget(grade)
        layout.addWidget(count)
        layout.addStretch()

    def mousePressEvent(self, event) -> None:
        self.clicked.emit(self.view_model.question_bank_id)
        super().mousePressEvent(event)