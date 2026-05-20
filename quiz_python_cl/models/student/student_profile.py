# quiz_app/models/student/student_profile.py

from dataclasses import dataclass, field


@dataclass
class StudentProfile:
    student_id: str
    name: str
    avatar: str = "default"
    created_at: str = ""
    last_active: str = ""
