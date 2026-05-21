from app.state.app_state import AppState


class AppStateController:
    def __init__(self, app_state: AppState):
        self._app_state = app_state

    def set_selected_student_id(self, student_id: str) -> None:
        self._app_state.selected_student_id = student_id

    def get_selected_student_id(self) -> str | None:
        return self._app_state.selected_student_id

    def clear_selected_student_id(self) -> None:
        self._app_state.selected_student_id = None