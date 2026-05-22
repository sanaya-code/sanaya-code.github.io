from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import QLabel, QPushButton, QVBoxLayout, QWidget

from page_data.quiz_page.view_model import QuizPageViewModel
from ui.question_widgets.widget_factory import QuestionWidgetFactory

class QuizPage(QWidget):
    next_clicked = pyqtSignal()

    def __init__(self):
        super().__init__()

        self.setObjectName("quizPage")

        self.question_widget_factory = QuestionWidgetFactory()
        self.current_question_widget = None

        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(40, 40, 40, 40)
        self.main_layout.setSpacing(20)

    def render(self, view_model: QuizPageViewModel) -> None:
        self._clear_layout()

        title = QLabel(view_model.page_title)
        title.setObjectName("pageTitle")

        progress = QLabel(
            f"Question {view_model.current_question_number} of {view_model.total_questions}"
        )
        progress.setObjectName("pageSubtitle")

        self.current_question_widget = self.question_widget_factory.create_widget(
            view_model.question
        )

        next_button = QPushButton("Next")
        next_button.setObjectName("primaryButton")
        next_button.clicked.connect(self.next_clicked.emit)

        self.main_layout.addWidget(title)
        self.main_layout.addWidget(progress)
        self.main_layout.addWidget(self.current_question_widget)
        self.main_layout.addStretch()
        self.main_layout.addWidget(next_button)

    def get_current_answer(self):
        if self.current_question_widget is None:
            return None

        return self.current_question_widget.get_user_answer()

    def _clear_layout(self) -> None:
        while self.main_layout.count():
            item = self.main_layout.takeAt(0)

            widget = item.widget()
            if widget is not None:
                widget.deleteLater()