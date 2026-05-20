from dataclasses import dataclass, asdict
from datetime import datetime
from uuid import uuid4


@dataclass
class StudentProfile:
    student_id: str
    name: str
    grade: str
    avatar_color: str
    created_at: str

    @staticmethod
    def create(name: str, grade: str, avatar_color: str = "#4CAF50") -> "StudentProfile":
        return StudentProfile(
            student_id=str(uuid4()),
            name=name.strip(),
            grade=grade.strip(),
            avatar_color=avatar_color,
            created_at=datetime.now().isoformat(timespec="seconds"),
        )

    def to_dict(self) -> dict:
        return asdict(self)

    @staticmethod
    def from_dict(data: dict) -> "StudentProfile":
        return StudentProfile(
            student_id=data["student_id"],
            name=data["name"],
            grade=data.get("grade", ""),
            avatar_color=data.get("avatar_color", "#4CAF50"),
            created_at=data.get("created_at", ""),
        )