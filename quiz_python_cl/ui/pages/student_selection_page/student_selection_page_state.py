# quiz_app/ui/pages/student_selection_page/student_selection_page_state.py

from state.student_selection_state import StudentSelectionState


class StudentSelectionPageState:
    """
    Thin wrapper that holds and mutates the page-local state.
    Controllers read and write through this object.
    """

    def __init__(self):
        self._state = StudentSelectionState()

    @property
    def state(self) -> StudentSelectionState:
        return self._state

    def set_loading(self, loading: bool) -> None:
        self._state.is_loading = loading

    def set_summaries(self, summaries: list) -> None:
        self._state.summaries = summaries
        self._state.error_message = ""

    def set_error(self, message: str) -> None:
        self._state.error_message = message
        self._state.is_loading = False
