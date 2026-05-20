# ui/pages/add_new_student_page/add_new_student_page_signals.py

from PyQt6.QtCore import QObject, pyqtSignal


class AddNewStudentPageSignals(QObject):
    student_created = pyqtSignal()
    cancelled = pyqtSignal()