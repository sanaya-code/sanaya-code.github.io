from PyQt6.QtWidgets import QFrame, QLabel, QVBoxLayout

from page_data.review_page.view_model import ReviewQuestionViewModel
from ui.components.review.review_answer_summary import ReviewAnswerSummary
from ui.components.review.review_status_badge import ReviewStatusBadge


class ReviewQuestionCard(QFrame):
    def __init__(self, view_model: ReviewQuestionViewModel):
        super().__init__()

        self.view_model = view_model
        self.setObjectName("reviewQuestionCard")

        self._build_ui()

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setSpacing(10)

        question_label = QLabel(self.view_model.question_text)
        question_label.setObjectName("reviewQuestionText")
        question_label.setWordWrap(True)

        status_badge = ReviewStatusBadge(self.view_model.status)

        answer_summary = ReviewAnswerSummary(
            user_answer=self.view_model.user_answer_display,
            correct_answer=self.view_model.correct_answer_display,
        )

        layout.addWidget(status_badge)
        layout.addWidget(question_label)
        layout.addWidget(answer_summary)