# quiz_app/state/app_state.py

from dataclasses import dataclass, field
from models.student.student_profile import StudentProfile


@dataclass
class AppState:
    active_student: StudentProfile | None = None
    active_question_bank_path: str = ""
    current_page: str = ""
