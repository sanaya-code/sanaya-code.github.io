from dataclasses import dataclass


@dataclass
class ReviewQuestionViewModel:
    question_id: str
    question_text: str
    status: str
    user_answer_display: str
    correct_answer_display: str


@dataclass
class ReviewPageViewModel:
    page_title: str
    active_tab: str
    total_questions: int
    correct_count: int
    wrong_count: int
    unanswered_count: int
    questions: list[ReviewQuestionViewModel]