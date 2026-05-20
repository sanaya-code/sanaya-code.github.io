# quiz_app/services/student_profile/load_students_service.py

from models.student.student_summary import StudentSummary
from repositories.student.student_repository_interface import StudentRepositoryInterface


class LoadStudentsService:

    def __init__(self, repository: StudentRepositoryInterface):
        self._repo = repository

    def execute(self) -> list[StudentSummary]:
        profiles = self._repo.get_all()
        summaries = []
        for profile in profiles:
            # Statistics will be wired in step 23.
            # For now return zeroed summary.
            summaries.append(StudentSummary(
                profile=profile,
                total_quizzes=0,
                overall_success_percent=0.0
            ))
        return summaries
