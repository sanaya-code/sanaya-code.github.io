from app.event_handlers.event_handler_bundle import EventHandlerBundle
from page_data.student_selection.render_data_builder import (
    StudentSelectionRenderDataBuilder,
)
from ui.navigation.app_router_controller import AppRouterController
from ui.ui_page_bundle import UIPageBundle


class MainController:
    def __init__(
        self,
        router_controller: AppRouterController,
        ui_pages: UIPageBundle,
        event_handlers: EventHandlerBundle,
        student_selection_data_builder: StudentSelectionRenderDataBuilder,
    ):
        self.router_controller = router_controller
        self.ui_pages = ui_pages
        self.event_handlers = event_handlers
        self.student_selection_data_builder = student_selection_data_builder

    def start(self) -> None:
        self._bind_page_events()
        self._register_pages()
        self._load_student_selection_page()

    def _bind_page_events(self) -> None:
        self.ui_pages.student_selection_page.bind_events(
            on_student_selected=self.event_handlers.select_student_handler.handle
        )

        self.ui_pages.question_bank_selection_page.bind_events(
            on_question_bank_selected=self.event_handlers.select_question_bank_handler.handle
        )

        self.ui_pages.quiz_page.bind_events(
            on_next_clicked=self.event_handlers.next_question_handler.handle
        )

    def _register_pages(self) -> None:
        self.router_controller.register_student_selection_page(
            self.ui_pages.student_selection_page.get_page_widget()
        )

        self.router_controller.register_question_bank_selection_page(
            self.ui_pages.question_bank_selection_page.get_page_widget()
        )

        self.router_controller.register_quiz_page(
            self.ui_pages.quiz_page.get_page_widget()
        )

    def _load_student_selection_page(self) -> None:
        view_model = self.student_selection_data_builder.build()

        self.ui_pages.student_selection_page.render(view_model)
        self.router_controller.show_student_selection_page()