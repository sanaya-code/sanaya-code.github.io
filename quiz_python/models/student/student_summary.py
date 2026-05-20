# models/student/student_summary.py


from dataclasses import dataclass


@dataclass
class StudentSummary:
    student_id: str
    name: str
    grade: str
    quizzes_completed: int
    avatar_path: str = ""