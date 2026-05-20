# quiz_app/repositories/student/student_repository_interface.py

from abc import ABC, abstractmethod
from models.student.student_profile import StudentProfile


class StudentRepositoryInterface(ABC):

    @abstractmethod
    def get_all(self) -> list[StudentProfile]:
        pass

    @abstractmethod
    def get_by_id(self, student_id: str) -> StudentProfile | None:
        pass

    @abstractmethod
    def save(self, student: StudentProfile) -> None:
        pass

    @abstractmethod
    def delete(self, student_id: str) -> None:
        pass

    @abstractmethod
    def exists(self, student_id: str) -> bool:
        pass
