# quiz_app/ui/pages/student_selection_page/student_selection_page_controller.py

from services.student_profile.load_students_service import LoadStudentsService
from ui.pages.student_selection_page.student_selection_page_state import StudentSelectionPageState
from ui.pages.student_selection_page.student_selection_page_signals import StudentSelectionPageSignals
from state.app_state import AppState
from ui.navigation.page_router import PageRouter
from ui.navigation.route_names import ADD_NEW_STUDENT, QUESTION_BANK_SELECTION
from repositories.student.student_repository_interface import StudentRepositoryInterface


class StudentSelectionPageController:

    def __init__(
        self,
        page_state: StudentSelectionPageState,
        signals: StudentSelectionPageSignals,
        load_service: LoadStudentsService,
        app_state: AppState,
        router: PageRouter,
        repository: StudentRepositoryInterface,
    ):
        self._page_state   = page_state
        self._signals      = signals
        self._load_service = load_service
        self._app_state    = app_state
        self._router       = router
        self._repo         = repository

        self._signals.student_selected.connect(self._on_student_selected)
        self._signals.add_student_clicked.connect(self._on_add_student_clicked)

    def load(self) -> None:
        self._page_state.set_loading(True)
        try:
            summaries = self._load_service.execute()
            self._page_state.set_summaries(summaries)
        except Exception as e:
            self._page_state.set_error(str(e))
        finally:
            self._page_state.set_loading(False)

    def _on_student_selected(self, student_id: str) -> None:
        profile = self._repo.get_by_id(student_id)
        if profile:
            self._app_state.active_student = profile
            self._router.go_to(QUESTION_BANK_SELECTION)

    def _on_add_student_clicked(self) -> None:
        self._router.go_to(ADD_NEW_STUDENT)
