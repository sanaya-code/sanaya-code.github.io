# quiz_app/models/student/student_summary.py

from dataclasses import dataclass
from models.student.student_profile import StudentProfile


@dataclass
class StudentSummary:
    profile: StudentProfile
    total_quizzes: int = 0
    overall_success_percent: float = 0.0
