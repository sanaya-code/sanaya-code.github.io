# quiz_app/repositories/student/student_json_repository.py

import json
import os
from models.student.student_profile import StudentProfile
from repositories.student.student_repository_interface import StudentRepositoryInterface
from config.paths import STUDENTS_JSON, STUDENTS_DIR


class StudentJsonRepository(StudentRepositoryInterface):

    def __init__(self):
        os.makedirs(STUDENTS_DIR, exist_ok=True)
        if not os.path.exists(STUDENTS_JSON):
            self._write([])

    def _read(self) -> list[dict]:
        with open(STUDENTS_JSON, "r", encoding="utf-8") as f:
            return json.load(f)

    def _write(self, data: list[dict]) -> None:
        with open(STUDENTS_JSON, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _to_model(self, d: dict) -> StudentProfile:
        return StudentProfile(
            student_id=d["student_id"],
            name=d["name"],
            avatar=d.get("avatar", "default"),
            created_at=d.get("created_at", ""),
            last_active=d.get("last_active", "")
        )

    def _to_dict(self, student: StudentProfile) -> dict:
        return {
            "student_id": student.student_id,
            "name": student.name,
            "avatar": student.avatar,
            "created_at": student.created_at,
            "last_active": student.last_active
        }

    def get_all(self) -> list[StudentProfile]:
        return [self._to_model(d) for d in self._read()]

    def get_by_id(self, student_id: str) -> StudentProfile | None:
        for d in self._read():
            if d["student_id"] == student_id:
                return self._to_model(d)
        return None

    def save(self, student: StudentProfile) -> None:
        data = self._read()
        for i, d in enumerate(data):
            if d["student_id"] == student.student_id:
                data[i] = self._to_dict(student)
                self._write(data)
                return
        data.append(self._to_dict(student))
        self._write(data)

    def delete(self, student_id: str) -> None:
        data = [d for d in self._read() if d["student_id"] != student_id]
        self._write(data)

    def exists(self, student_id: str) -> bool:
        return any(d["student_id"] == student_id for d in self._read())
