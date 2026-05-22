from page_data.quiz_page.view_model import QuestionViewModel
from ui.question_widgets.mcq.mcq_question_widget import MCQQuestionWidget


class QuestionWidgetFactory:
    def create_widget(self, question: QuestionViewModel):
        if question.question_type == "mcq":
            return MCQQuestionWidget(question)

        raise ValueError(f"Unsupported question type: {question.question_type}")