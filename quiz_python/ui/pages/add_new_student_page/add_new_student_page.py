# ui/pages/add_new_student_page/add_new_student_page.py

from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel,
    QLineEdit, QPushButton
)


class AddNewStudentPage(QWidget):
    def __init__(self):
        super().__init__()

        self.title_label = QLabel("Add New Student")

        self.name_input = QLineEdit()
        self.name_input.setPlaceholderText("Enter student name")

        self.grade_input = QLineEdit()
        self.grade_input.setPlaceholderText("Enter class / grade")

        self.color_button = QPushButton("Choose Avatar Color")

        self.color_preview = QLabel()
        self.color_preview.setFixedSize(40, 40)

        self.create_button = QPushButton("Create Student")
        self.cancel_button = QPushButton("Cancel")

        self.error_label = QLabel("")
        self.error_label.setStyleSheet("color: red;")

        self._build_layout()

    def _build_layout(self):
        main_layout = QVBoxLayout(self)

        self.title_label.setStyleSheet("font-size: 24px; font-weight: bold;")

        color_layout = QHBoxLayout()
        color_layout.addWidget(self.color_button)
        color_layout.addWidget(self.color_preview)
        color_layout.addStretch()

        button_layout = QHBoxLayout()
        button_layout.addWidget(self.create_button)
        button_layout.addWidget(self.cancel_button)

        main_layout.addWidget(self.title_label)
        main_layout.addWidget(QLabel("Student Name"))
        main_layout.addWidget(self.name_input)
        main_layout.addWidget(QLabel("Class / Grade"))
        main_layout.addWidget(self.grade_input)
        main_layout.addLayout(color_layout)
        main_layout.addWidget(self.error_label)
        main_layout.addStretch()
        main_layout.addLayout(button_layout)

    def get_name(self) -> str:
        return self.name_input.text()

    def get_grade(self) -> str:
        return self.grade_input.text()

    def set_error(self, message: str):
        self.error_label.setText(message)

    def clear_form(self):
        self.name_input.clear()
        self.grade_input.clear()
        self.error_label.clear()

    def set_avatar_color_preview(self, color: str):
        self.color_preview.setStyleSheet(
            f"""
            background-color: {color};
            border-radius: 20px;
            border: 1px solid #333;
            """
        )