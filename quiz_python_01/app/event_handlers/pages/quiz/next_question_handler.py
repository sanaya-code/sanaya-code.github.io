from app.state.app_state_controller import AppStateController
from page_data.quiz_page.hardcoded_questions import HARDCODED_QUESTIONS
from page_data.quiz_page.render_data_builder import QuizPageRenderDataBuilder
from page_data.result_page.render_data_builder import ResultPageRenderDataBuilder
from question_types.base.answer_status import AnswerStatus
from question_types.registry.question_type_registry import QuestionTypeRegistry
from ui.navigation.app_router_controller import AppRouterController
from ui.ui_page_bundle import UIPageBundle


class NextQuestionHandler:
    def __init__(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
        quiz_page_data_builder: QuizPageRenderDataBuilder,
        result_page_data_builder: ResultPageRenderDataBuilder,
        router_controller: AppRouterController,
    ):
        self.app_state_controller = app_state_controller
        self.ui_pages = ui_pages
        self.quiz_page_data_builder = quiz_page_data_builder
        self.result_page_data_builder = result_page_data_builder
        self.router_controller = router_controller
        self.question_type_registry = QuestionTypeRegistry()

    def handle(self) -> None:
        current_index = self.app_state_controller.get_current_question_index()

        current_view_model = self.quiz_page_data_builder.build(current_index)

        answer = self.ui_pages.quiz_page.get_current_answer()

        self.app_state_controller.save_answer(
            question_id=current_view_model.question.question_id,
            answer=answer,
        )

        next_index = current_index + 1

        if next_index >= self.quiz_page_data_builder.get_total_questions():
            self._finish_quiz()
            return

        self.app_state_controller.set_current_question_index(next_index)

        next_view_model = self.quiz_page_data_builder.build(next_index)
        self.ui_pages.quiz_page.render(next_view_model)

    def _finish_quiz(self) -> None:
        answers = self.app_state_controller.get_answers()

        correct_answers = 0
        wrong_answers = 0
        unanswered_questions = 0

        for question_data in HARDCODED_QUESTIONS:
            question_id = question_data["question_id"]
            question_type = question_data["type"]
            user_answer = answers.get(question_id)

            scorer = self.question_type_registry.get_scorer(question_type)

            status = scorer.score(
                question_data=question_data,
                user_answer=user_answer,
            )

            if status == AnswerStatus.CORRECT:
                correct_answers += 1
            elif status == AnswerStatus.WRONG:
                wrong_answers += 1
            else:
                unanswered_questions += 1

        total_questions = self.quiz_page_data_builder.get_total_questions()
        attempted_questions = correct_answers + wrong_answers

        result_view_model = self.result_page_data_builder.build(
            total_questions=total_questions,
            attempted_questions=attempted_questions,
            correct_answers=correct_answers,
            wrong_answers=wrong_answers,
            unanswered_questions=unanswered_questions,
        )

        self.ui_pages.result_page.render(result_view_model)
        self.router_controller.show_result_page()