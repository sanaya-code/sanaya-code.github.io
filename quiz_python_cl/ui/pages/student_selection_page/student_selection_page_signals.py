# quiz_app/ui/pages/student_selection_page/student_selection_page_signals.py

from PyQt6.QtCore import QObject, pyqtSignal


class StudentSelectionPageSignals(QObject):

    student_selected    = pyqtSignal(str)   # student_id
    add_student_clicked = pyqtSignal()
