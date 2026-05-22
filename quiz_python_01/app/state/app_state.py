from dataclasses import dataclass, field


@dataclass
class AppState:
    selected_student_id: str | None = None
    selected_question_bank_id: str | None = None
    current_question_index: int = 0
    answers: dict[str, str | None] = field(default_factory=dict)
    loaded_questions: list[dict] = field(default_factory=list)