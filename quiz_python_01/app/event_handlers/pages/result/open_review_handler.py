from app.state.app_state_controller import AppStateController
from page_data.review_page.render_data_builder import ReviewPageRenderDataBuilder
from ui.navigation.app_router_controller import AppRouterController
from ui.ui_page_bundle import UIPageBundle


class OpenReviewHandler:
    def __init__(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
        router_controller: AppRouterController,
        review_page_data_builder: ReviewPageRenderDataBuilder,
    ):
        self.app_state_controller = app_state_controller
        self.ui_pages = ui_pages
        self.router_controller = router_controller
        self.review_page_data_builder = review_page_data_builder

    def handle(self) -> None:
        answers = self.app_state_controller.get_answers()
        questions = self.app_state_controller.get_loaded_questions()

        view_model = self.review_page_data_builder.build(
            user_answers=answers,
            active_tab="wrong",
            questions=questions if questions else None,
        )

        self.ui_pages.review_page.render(view_model)
        self.router_controller.show_review_page()