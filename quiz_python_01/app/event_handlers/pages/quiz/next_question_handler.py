from app.state.app_state_controller import AppStateController
from page_data.quiz_page.render_data_builder import QuizPageRenderDataBuilder
from ui.ui_page_bundle import UIPageBundle


class NextQuestionHandler:
    def __init__(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
        quiz_page_data_builder: QuizPageRenderDataBuilder,
    ):
        self.app_state_controller = app_state_controller
        self.ui_pages = ui_pages
        self.quiz_page_data_builder = quiz_page_data_builder

    def handle(self) -> None:
        current_index = self.app_state_controller.get_current_question_index()
        view_model = self.quiz_page_data_builder.build(current_index)

        answer = self.ui_pages.quiz_page.get_current_answer()
        self.app_state_controller.save_answer(
            question_id=view_model.question.question_id,
            answer=answer,
        )

        next_index = current_index + 1

        if next_index >= self.quiz_page_data_builder.get_total_questions():
            print("Quiz finished")
            print(self.app_state_controller.get_answers())
            return

        self.app_state_controller.set_current_question_index(next_index)

        next_view_model = self.quiz_page_data_builder.build(next_index)
        self.ui_pages.quiz_page.render(next_view_model)