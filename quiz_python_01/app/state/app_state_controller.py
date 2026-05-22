from app.state.app_state import AppState


class AppStateController:
    def __init__(self, app_state: AppState):
        self._app_state = app_state

    def set_selected_student_id(self, student_id: str) -> None:
        self._app_state.selected_student_id = student_id

    def get_selected_student_id(self) -> str | None:
        return self._app_state.selected_student_id

    def set_selected_question_bank_id(self, question_bank_id: str) -> None:
        self._app_state.selected_question_bank_id = question_bank_id

    def get_selected_question_bank_id(self) -> str | None:
        return self._app_state.selected_question_bank_id

    def set_current_question_index(self, index: int) -> None:
        self._app_state.current_question_index = index

    def get_current_question_index(self) -> int:
        return self._app_state.current_question_index

    def move_to_next_question(self) -> None:
        self._app_state.current_question_index += 1

    def save_answer(self, question_id: str, answer: str | None) -> None:
        self._app_state.answers[question_id] = answer

    def get_answers(self) -> dict[str, str | None]:
        return self._app_state.answers