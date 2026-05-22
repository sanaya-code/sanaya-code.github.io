
from ui.question_widgets.widget_registry import QUESTION_WIDGET_REGISTRY

class QuestionWidgetFactory:
    def create_widget(self, question):
        widget_class = QUESTION_WIDGET_REGISTRY.get(
            question.question_type
        )

        if widget_class is None:
            raise ValueError(
                f"Unsupported question type: {question.question_type}"
            )

        return widget_class(question)