from PyQt6.QtWidgets import QFrame, QLabel, QVBoxLayout

from page_data.result_page.view_model import ResultPageViewModel


class ResultSummaryCard(QFrame):
    def __init__(self, view_model: ResultPageViewModel):
        super().__init__()

        self.view_model = view_model
        self.setObjectName("resultSummaryCard")

        self._build_ui()

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)
        layout.setSpacing(12)

        score = QLabel(f"{self.view_model.score_percentage:.1f}%")
        score.setObjectName("resultScore")

        total = QLabel(f"Total Questions: {self.view_model.total_questions}")
        total.setObjectName("resultText")

        attempted = QLabel(
            f"Attempted Questions: {self.view_model.attempted_questions}"
        )
        attempted.setObjectName("resultText")

        correct = QLabel(f"Correct Answers: {self.view_model.correct_answers}")
        correct.setObjectName("resultText")

        wrong = QLabel(f"Wrong Answers: {self.view_model.wrong_answers}")
        wrong.setObjectName("resultText")

        unanswered = QLabel(
            f"Unanswered Questions: {self.view_model.unanswered_questions}"
        )
        unanswered.setObjectName("resultText")

        layout.addWidget(score)
        layout.addWidget(total)
        layout.addWidget(attempted)
        layout.addWidget(correct)
        layout.addWidget(wrong)
        layout.addWidget(unanswered)