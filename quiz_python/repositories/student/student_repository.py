import json
from pathlib import Path

from models.student.student_profile import StudentProfile


class StudentRepository:
    def __init__(self, storage_dir: str = "storage/students"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

    def save(self, profile: StudentProfile) -> None:
        student_folder = self.storage_dir / profile.student_id
        student_folder.mkdir(parents=True, exist_ok=True)

        profile_file = student_folder / "profile.json"

        with profile_file.open("w", encoding="utf-8") as file:
            json.dump(profile.to_dict(), file, indent=4)

    def load_all(self) -> list[StudentProfile]:
        students: list[StudentProfile] = []

        for student_folder in self.storage_dir.iterdir():
            profile_file = student_folder / "profile.json"

            if profile_file.exists():
                with profile_file.open("r", encoding="utf-8") as file:
                    data = json.load(file)
                    students.append(StudentProfile.from_dict(data))

        return students