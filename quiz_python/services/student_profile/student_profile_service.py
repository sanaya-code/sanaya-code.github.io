# services/student_profile/student_profile_service.py

from models.student.student_profile import StudentProfile
from repositories.student.student_repository import StudentRepository


class StudentProfileService:
    def __init__(self, repository: StudentRepository):
        self.repository = repository

    def create_student(
        self,
        name: str,
        grade: str,
        avatar_color: str = "#4CAF50",
    ) -> StudentProfile:
        if not name.strip():
            raise ValueError("Student name is required.")

        if not grade.strip():
            raise ValueError("Grade is required.")

        profile = StudentProfile.create(
            name=name,
            grade=grade,
            avatar_color=avatar_color,
        )

        self.repository.save(profile)
        return profile

    def get_all_students(self) -> list[StudentProfile]:
        return self.repository.load_all()