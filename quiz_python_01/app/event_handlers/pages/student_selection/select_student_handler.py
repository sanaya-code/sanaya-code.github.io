from app.state.app_state_controller import AppStateController
from page_data.question_bank_selection.render_data_builder import (
    QuestionBankSelectionRenderDataBuilder,
)
from ui.navigation.app_router_controller import AppRouterController
from ui.ui_page_bundle import UIPageBundle


class SelectStudentHandler:
    def __init__(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
        router_controller: AppRouterController,
        question_bank_selection_data_builder: QuestionBankSelectionRenderDataBuilder,
    ):
        self.app_state_controller = app_state_controller
        self.ui_pages = ui_pages
        self.router_controller = router_controller
        self.question_bank_selection_data_builder = question_bank_selection_data_builder

    def handle(self, student_id: str) -> None:
        self.app_state_controller.set_selected_student_id(student_id)

        view_model = self.question_bank_selection_data_builder.build()
        self.ui_pages.question_bank_selection_page.render(view_model)

        self.router_controller.show_question_bank_selection_page()