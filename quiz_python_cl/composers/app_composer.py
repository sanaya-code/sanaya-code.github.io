# quiz_app/composers/app_composer.py

from PyQt6.QtWidgets import QApplication
from ui.themes.theme_manager import ThemeManager
from ui.layouts.app_layout import AppLayout
from ui.navigation.stacked_page_manager import StackedPageManager
from ui.navigation.page_router import PageRouter
from ui.navigation.route_names import STUDENT_SELECTION
from ui.main_window import MainWindow
from ui.pages.student_selection_page.student_selection_page import StudentSelectionPage
from ui.pages.student_selection_page.student_selection_page_state import StudentSelectionPageState
from ui.pages.student_selection_page.student_selection_page_signals import StudentSelectionPageSignals
from ui.pages.student_selection_page.student_selection_page_controller import StudentSelectionPageController
from state.app_state import AppState
from repositories.student.student_json_repository import StudentJsonRepository
from services.student_profile.load_students_service import LoadStudentsService
from app_logging.app_logger import get_logger

logger = get_logger(__name__)


class AppComposer:

    def compose(self) -> MainWindow:
        logger.info("Composing application")

        app = QApplication.instance()
        ThemeManager.apply_base_theme(app)

        # ── State ──────────────────────────────────────────
        app_state = AppState()

        # ── Repositories ───────────────────────────────────
        student_repo = StudentJsonRepository()

        # ── Services ───────────────────────────────────────
        load_students_svc = LoadStudentsService(student_repo)

        # ── Navigation ─────────────────────────────────────
        # MainWindow owns the AppLayout and QStackedWidget
        window = MainWindow()
        page_manager = StackedPageManager(window.stack)
        router = PageRouter(page_manager, app_state)

        # ── Student Selection Page ──────────────────────────
        ss_state      = StudentSelectionPageState()
        ss_signals    = StudentSelectionPageSignals()
        ss_controller = StudentSelectionPageController(
            page_state   = ss_state,
            signals      = ss_signals,
            load_service = load_students_svc,
            app_state    = app_state,
            router       = router,
            repository   = student_repo,
        )
        ss_page = StudentSelectionPage(ss_state, ss_signals, ss_controller)
        page_manager.register(STUDENT_SELECTION, ss_page)

        # ── Navigate and refresh ────────────────────────────
        router.go_to(STUDENT_SELECTION)
        ss_page.refresh()

        logger.info("Application composed successfully")
        return window
