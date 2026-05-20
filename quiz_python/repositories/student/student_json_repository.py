# repositories/student/student_json_repository.py

import json
from pathlib import Path

from models.student.student_summary import StudentSummary


class StudentJsonRepository:
    def __init__(self, file_path: Path):
        self.file_path = file_path

    def get_all_students(self) -> list[StudentSummary]:
        if not self.file_path.exists():
            return []

        with open(self.file_path, "r", encoding="utf-8") as file:
            data = json.load(file)

        students = []

        for item in data.get("students", []):
            students.append(
                StudentSummary(
                    student_id=item["student_id"],
                    name=item["name"],
                    grade=item["grade"],
                    quizzes_completed=item.get("quizzes_completed", 0),
                    avatar_path=item.get("avatar_path", ""),
                )
            )

        return students