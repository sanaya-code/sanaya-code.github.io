from dataclasses import dataclass


@dataclass
class AppState:
    selected_student_id: str | None = None