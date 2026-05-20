# ui/main_window.py

from PyQt6.QtWidgets import QMainWindow

from ui.pages.student_selection_page.student_selection_page import StudentSelectionPage
from config.paths import MAIN_QSS_PATH


class MainWindow(QMainWindow):
    def __init__(self, load_students_service):
        super().__init__()

        self.load_students_service = load_students_service

        self.setWindowTitle("Quiz App")
        self.resize(1200, 750)

        self.apply_theme()
        self.show_student_selection_page()

    def apply_theme(self):
        if MAIN_QSS_PATH.exists():
            with open(MAIN_QSS_PATH, "r", encoding="utf-8") as file:
                self.setStyleSheet(file.read())

    def show_student_selection_page(self):
        page = StudentSelectionPage(self.load_students_service)
        self.setCentralWidget(page)