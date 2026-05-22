from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import (
    QLabel,
    QPushButton,
    QHBoxLayout,
    QScrollArea,
    QVBoxLayout,
    QWidget,
)

from page_data.review_page.view_model import ReviewPageViewModel
from ui.components.review.review_question_card import ReviewQuestionCard


class ReviewPage(QWidget):
    wrong_tab_clicked = pyqtSignal()
    unanswered_tab_clicked = pyqtSignal()
    correct_tab_clicked = pyqtSignal()
    back_to_home_clicked = pyqtSignal()

    def __init__(self):
        super().__init__()

        self.setObjectName("reviewPage")

        self.main_layout = QVBoxLayout(self)
        self.main_layout.setContentsMargins(40, 40, 40, 40)
        self.main_layout.setSpacing(20)

    def render(self, view_model: ReviewPageViewModel) -> None:
        self._clear_layout()

        title = QLabel(view_model.page_title)
        title.setObjectName("pageTitle")

        summary = QLabel(
            f"Total: {view_model.total_questions} | "
            f"Correct: {view_model.correct_count} | "
            f"Wrong: {view_model.wrong_count} | "
            f"Unanswered: {view_model.unanswered_count}"
        )
        summary.setObjectName("pageSubtitle")

        tab_layout = self._build_tab_layout(view_model)

        content_widget = QWidget()
        content_layout = QVBoxLayout(content_widget)
        content_layout.setSpacing(14)

        if not view_model.questions:
            empty_label = QLabel("No questions in this tab.")
            empty_label.setObjectName("reviewEmptyText")
            content_layout.addWidget(empty_label)
        else:
            for question_vm in view_model.questions:
                content_layout.addWidget(ReviewQuestionCard(question_vm))

        content_layout.addStretch()

        scroll_area = QScrollArea()
        scroll_area.setObjectName("reviewScrollArea")
        scroll_area.setWidgetResizable(True)
        scroll_area.setWidget(content_widget)

        back_button = QPushButton("Back To Home")
        back_button.setObjectName("secondaryButton")
        back_button.clicked.connect(self.back_to_home_clicked.emit)

        self.main_layout.addWidget(title)
        self.main_layout.addWidget(summary)
        self.main_layout.addLayout(tab_layout)
        self.main_layout.addWidget(scroll_area)
        self.main_layout.addWidget(back_button)

    def _build_tab_layout(self, view_model: ReviewPageViewModel) -> QHBoxLayout:
        tab_layout = QHBoxLayout()
        tab_layout.setSpacing(10)

        wrong_button = QPushButton(f"Wrong ({view_model.wrong_count})")
        wrong_button.setObjectName(
            "activeReviewTab" if view_model.active_tab == "wrong" else "reviewTab"
        )
        wrong_button.clicked.connect(self.wrong_tab_clicked.emit)

        unanswered_button = QPushButton(f"Left ({view_model.unanswered_count})")
        unanswered_button.setObjectName(
            "activeReviewTab"
            if view_model.active_tab == "unanswered"
            else "reviewTab"
        )
        unanswered_button.clicked.connect(self.unanswered_tab_clicked.emit)

        correct_button = QPushButton(f"Correct ({view_model.correct_count})")
        correct_button.setObjectName(
            "activeReviewTab" if view_model.active_tab == "correct" else "reviewTab"
        )
        correct_button.clicked.connect(self.correct_tab_clicked.emit)

        tab_layout.addWidget(wrong_button)
        tab_layout.addWidget(unanswered_button)
        tab_layout.addWidget(correct_button)

        return tab_layout

    def _clear_layout(self) -> None:
        while self.main_layout.count():
            item = self.main_layout.takeAt(0)

            widget = item.widget()
            if widget is not None:
                widget.deleteLater()

            child_layout = item.layout()
            if child_layout is not None:
                self._clear_child_layout(child_layout)

    def _clear_child_layout(self, layout) -> None:
        while layout.count():
            item = layout.takeAt(0)

            widget = item.widget()
            if widget is not None:
                widget.deleteLater()