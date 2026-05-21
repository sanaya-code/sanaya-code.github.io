from dataclasses import dataclass


@dataclass
class StudentCardViewModel:
    student_id: str
    name: str
    grade: str
    avatar_text: str


@dataclass
class StudentSelectionViewModel:
    page_title: str
    subtitle: str
    students: list[StudentCardViewModel]