from app.state.app_state_controller import AppStateController
from page_data.quiz_page.quiz_data_loader import QuizDataLoader
from page_data.quiz_page.render_data_builder import QuizPageRenderDataBuilder
from ui.navigation.app_router_controller import AppRouterController
from ui.ui_page_bundle import UIPageBundle


class LoadQuestionBankJsonHandler:
    def __init__(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
        router_controller: AppRouterController,
        quiz_data_loader: QuizDataLoader,
        quiz_page_data_builder: QuizPageRenderDataBuilder,
    ):
        self.app_state_controller = app_state_controller
        self.ui_pages = ui_pages
        self.router_controller = router_controller
        self.quiz_data_loader = quiz_data_loader
        self.quiz_page_data_builder = quiz_page_data_builder

    def handle(self, file_path: str) -> None:
        try:
            questions = self.quiz_data_loader.load_questions_from_json(file_path)

            self.app_state_controller.set_loaded_questions(questions)
            self.app_state_controller.set_current_question_index(0)

            view_model = self.quiz_page_data_builder.build(
                question_index=0,
                questions=questions,
            )

            self.ui_pages.quiz_page.render(view_model)
            self.router_controller.show_quiz_page()

        except Exception as error:
            print(f"Failed to load question bank JSON: {error}")