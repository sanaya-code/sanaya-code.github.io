# ui/pages/student_selection_page/student_selection_page.py

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel, QPushButton, QHBoxLayout

from ui.components.student_selection_page.student_grid import StudentGrid


class StudentSelectionPage(QWidget):
    def __init__(self, load_students_service):
        super().__init__()

        self.load_students_service = load_students_service

        self.main_layout = QVBoxLayout()
        self.main_layout.setContentsMargins(32, 32, 32, 24)
        self.main_layout.setSpacing(24)

        self.setLayout(self.main_layout)

        self.build_ui()
        self.load_students()

    def build_ui(self):
        header_layout = QHBoxLayout()

        title_area = QVBoxLayout()

        title = QLabel("Welcome! 👋")
        title.setObjectName("pageTitle")

        subtitle = QLabel("Select a student profile to start a quiz")
        subtitle.setObjectName("pageSubtitle")

        title_area.addWidget(title)
        title_area.addWidget(subtitle)

        add_button = QPushButton("+ Add New Student")
        add_button.setObjectName("primaryButton")

        settings_button = QPushButton("⚙")
        settings_button.setObjectName("iconButton")

        header_layout.addLayout(title_area)
        header_layout.addStretch()
        header_layout.addWidget(add_button)
        header_layout.addWidget(settings_button)

        section_title = QLabel("Students")
        section_title.setObjectName("sectionTitle")

        self.student_grid = StudentGrid()

        footer = QLabel("📖 Quiz App v1.0.0                                      💡 Tip: You can add a new student anytime.")
        footer.setObjectName("footerText")

        self.main_layout.addLayout(header_layout)
        self.main_layout.addWidget(section_title)
        self.main_layout.addWidget(self.student_grid)
        self.main_layout.addStretch()
        self.main_layout.addWidget(footer)

    def load_students(self):
        students = self.load_students_service.execute()
        self.student_grid.set_students(students)