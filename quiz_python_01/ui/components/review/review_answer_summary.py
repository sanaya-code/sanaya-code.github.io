from PyQt6.QtWidgets import QLabel, QVBoxLayout, QWidget


class ReviewAnswerSummary(QWidget):
    def __init__(self, user_answer: str, correct_answer: str):
        super().__init__()

        self.user_answer = user_answer
        self.correct_answer = correct_answer

        self._build_ui()

    def _build_ui(self) -> None:
        layout = QVBoxLayout(self)

        user_answer_label = QLabel(f"Your Answer: {self.user_answer}")
        user_answer_label.setObjectName("reviewAnswerText")

        correct_answer_label = QLabel(f"Correct Answer: {self.correct_answer}")
        correct_answer_label.setObjectName("reviewAnswerText")

        layout.addWidget(user_answer_label)
        layout.addWidget(correct_answer_label)