# quiz_app/state/student_selection_state.py

from dataclasses import dataclass, field
from models.student.student_summary import StudentSummary


@dataclass
class StudentSelectionState:
    summaries: list[StudentSummary] = field(default_factory=list)
    is_loading: bool = False
    error_message: str = ""
