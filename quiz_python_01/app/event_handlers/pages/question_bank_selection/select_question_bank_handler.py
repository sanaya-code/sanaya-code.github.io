from app.state.app_state_controller import AppStateController
from page_data.quiz_page.render_data_builder import QuizPageRenderDataBuilder
from ui.navigation.app_router_controller import AppRouterController
from ui.ui_page_bundle import UIPageBundle


class SelectQuestionBankHandler:
    def __init__(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
        router_controller: AppRouterController,
        quiz_page_data_builder: QuizPageRenderDataBuilder,
    ):
        self.app_state_controller = app_state_controller
        self.ui_pages = ui_pages
        self.router_controller = router_controller
        self.quiz_page_data_builder = quiz_page_data_builder

    def handle(self, question_bank_id: str) -> None:
        self.app_state_controller.set_selected_question_bank_id(question_bank_id)
        self.app_state_controller.set_current_question_index(0)

        questions = self.app_state_controller.get_loaded_questions()

        view_model = self.quiz_page_data_builder.build(
            question_index=0,
            questions=questions if questions else None,
        )

        self.ui_pages.quiz_page.render(view_model)
        self.router_controller.show_quiz_page()