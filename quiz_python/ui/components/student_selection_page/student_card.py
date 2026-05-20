# ui/components/student_selection_page/student_card.py

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel


class StudentCard(QWidget):
    def __init__(self, student):
        super().__init__()

        self.student = student
        self.setObjectName("studentCard")

        layout = QVBoxLayout()
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(12)

        avatar = QLabel("👦")
        avatar.setObjectName("studentAvatar")

        name = QLabel(student.name)
        name.setObjectName("studentName")

        details = QLabel(f"{student.grade}  •  {student.quizzes_completed} Quizzes")
        details.setObjectName("studentDetails")

        arrow = QLabel("›")
        arrow.setObjectName("studentArrow")

        layout.addWidget(avatar)
        layout.addWidget(name)
        layout.addWidget(details)
        layout.addWidget(arrow)

        self.setLayout(layout)