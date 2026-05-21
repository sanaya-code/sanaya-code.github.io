from app.state.app_state import AppState


class SelectStudentHandler:
    def __init__(self, app_state: AppState):
        self.app_state = app_state

    def handle(self, student_id: str) -> None:
        self.app_state.selected_student_id = student_id
        print(f"Selected student id: {student_id}")