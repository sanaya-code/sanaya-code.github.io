from dataclasses import dataclass

from app.event_handlers.student_selection.select_student_handler import (
    SelectStudentHandler,
)


@dataclass(frozen=True)
class EventHandlerBundle:
    select_student_handler: SelectStudentHandler