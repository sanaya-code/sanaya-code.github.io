from page_data.student_selection.hardcoded_students import HARDCODED_STUDENTS
from page_data.student_selection.view_model import (
    StudentCardViewModel,
    StudentSelectionViewModel,
)


class StudentSelectionRenderDataBuilder:
    def build(self) -> StudentSelectionViewModel:
        students = [
            StudentCardViewModel(
                student_id=item["student_id"],
                name=item["name"],
                grade=item["grade"],
                avatar_text=item["avatar_text"],
            )
            for item in HARDCODED_STUDENTS
        ]

        return StudentSelectionViewModel(
            page_title="Select Student",
            subtitle="Choose a student to start the quiz",
            students=students,
        )