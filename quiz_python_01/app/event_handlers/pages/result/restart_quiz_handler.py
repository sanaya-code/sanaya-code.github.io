from app.state.app_state_controller import AppStateController
from page_data.student_selection.render_data_builder import (
    StudentSelectionRenderDataBuilder,
)
from ui.navigation.app_router_controller import AppRouterController
from ui.ui_page_bundle import UIPageBundle


class RestartQuizHandler:
    def __init__(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
        router_controller: AppRouterController,
        student_selection_data_builder: StudentSelectionRenderDataBuilder,
    ):
        self.app_state_controller = app_state_controller
        self.ui_pages = ui_pages
        self.router_controller = router_controller
        self.student_selection_data_builder = student_selection_data_builder

    def handle(self) -> None:
        self.app_state_controller.reset_quiz_session()

        view_model = self.student_selection_data_builder.build()

        self.ui_pages.student_selection_page.render(view_model)

        self.router_controller.show_student_selection_page()