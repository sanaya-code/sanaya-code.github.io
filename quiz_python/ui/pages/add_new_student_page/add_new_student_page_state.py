# ui/pages/add_new_student_page/add_new_student_page_state.py

from dataclasses import dataclass


@dataclass
class AddNewStudentPageState:
    name: str = ""
    grade: str = ""
    avatar_color: str = "#4CAF50"
    error_message: str = ""