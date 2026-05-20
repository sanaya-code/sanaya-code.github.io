# main.py

import sys
from PyQt6.QtWidgets import QApplication

from ui.main_window import MainWindow
from repositories.student.student_json_repository import StudentJsonRepository
from services.student_profile.load_students_service import LoadStudentsService
from config.paths import STUDENTS_FILE_PATH


def main():
    app = QApplication(sys.argv)

    student_repository = StudentJsonRepository(STUDENTS_FILE_PATH)
    load_students_service = LoadStudentsService(student_repository)

    window = MainWindow(load_students_service)
    window.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()