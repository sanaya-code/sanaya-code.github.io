from ui.navigation.app_router import AppRouter
from ui.navigation.route_names import RouteNames


class AppRouterController:
    def __init__(self, router: AppRouter):
        self.router = router

    def register_student_selection_page(self, page_widget) -> None:
        self.router.register_page(RouteNames.STUDENT_SELECTION_PAGE, page_widget)

    def register_question_bank_selection_page(self, page_widget) -> None:
        self.router.register_page(RouteNames.QUESTION_BANK_SELECTION_PAGE, page_widget)

    def register_quiz_page(self, page_widget) -> None:
        self.router.register_page(RouteNames.QUIZ_PAGE, page_widget)

    def show_student_selection_page(self) -> None:
        self.router.show_page(RouteNames.STUDENT_SELECTION_PAGE)

    def show_question_bank_selection_page(self) -> None:
        self.router.show_page(RouteNames.QUESTION_BANK_SELECTION_PAGE)

    def show_quiz_page(self) -> None:
        self.router.show_page(RouteNames.QUIZ_PAGE)