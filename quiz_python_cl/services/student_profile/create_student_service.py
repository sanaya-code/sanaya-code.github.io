# quiz_app/services/student_profile/create_student_service.py

import uuid
from datetime import datetime
from models.student.student_profile import StudentProfile
from repositories.student.student_repository_interface import StudentRepositoryInterface
from shared.validators.student_validator import validate_student_name


class CreateStudentService:

    def __init__(self, repository: StudentRepositoryInterface):
        self._repo = repository

    def execute(self, name: str, avatar: str = "default") -> tuple[bool, str, StudentProfile | None]:
        """
        Returns (success, error_message, created_profile).
        On failure, created_profile is None.
        """
        is_valid, error = validate_student_name(name)
        if not is_valid:
            return False, error, None

        now = datetime.now().isoformat(timespec="seconds")
        student = StudentProfile(
            student_id=str(uuid.uuid4()),
            name=name.strip(),
            avatar=avatar,
            created_at=now,
            last_active=now
        )
        self._repo.save(student)
        return True, "", student
