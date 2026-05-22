from PyQt6.QtWidgets import QLabel, QVBoxLayout, QWidget

from page_data.review_page.view_model import ReviewSectionViewModel
from ui.components.review.review_question_card import ReviewQuestionCard


class ReviewSection(QWidget):
    def __init__(self, view_model: ReviewSectionViewModel):
        super().__init__()

        self.view_model = view_model
        self.setObjectName("reviewSection")

        self._build_ui()

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setSpacing(12)

        title = QLabel(
            f"{self.view_model.section_title} ({len(self.view_model.questions)})"
        )
        title.setObjectName("reviewSectionTitle")

        layout.addWidget(title)

        if not self.view_model.questions:
            empty_label = QLabel("No questions in this section.")
            empty_label.setObjectName("reviewEmptyText")
            layout.addWidget(empty_label)
            return

        for question_vm in self.view_model.questions:
            layout.addWidget(ReviewQuestionCard(question_vm))