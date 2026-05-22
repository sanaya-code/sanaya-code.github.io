from PyQt6.QtWidgets import QMainWindow

from ui.navigation.app_router import AppRouter
from ui.navigation.app_router_controller import AppRouterController
from ui.pages.question_bank_selection_page.question_bank_selection_page import (
    QuestionBankSelectionPage,
)
from ui.pages.question_bank_selection_page.question_bank_selection_page_controller import (
    QuestionBankSelectionPageController,
)
from ui.pages.quiz_page.quiz_page import QuizPage
from ui.pages.quiz_page.quiz_page_controller import QuizPageController
from ui.pages.student_selection_page.student_selection_page import StudentSelectionPage
from ui.pages.student_selection_page.student_selection_page_controller import (
    StudentSelectionPageController,
)
from ui.ui_page_bundle import UIPageBundle


class UIComposer:
    def create_router_controller(self, main_window: QMainWindow) -> AppRouterController:
        router = AppRouter(main_window)
        return AppRouterController(router)

    def create_ui(self) -> UIPageBundle:
        student_selection_page_widget = StudentSelectionPage()
        question_bank_selection_page_widget = QuestionBankSelectionPage()
        quiz_page_widget = QuizPage()

        student_selection_page_controller = StudentSelectionPageController(
            page=student_selection_page_widget,
        )

        question_bank_selection_page_controller = QuestionBankSelectionPageController(
            page=question_bank_selection_page_widget,
        )

        quiz_page_controller = QuizPageController(
            page=quiz_page_widget,
        )

        return UIPageBundle(
            student_selection_page=student_selection_page_controller,
            question_bank_selection_page=question_bank_selection_page_controller,
            quiz_page=quiz_page_controller,
        )