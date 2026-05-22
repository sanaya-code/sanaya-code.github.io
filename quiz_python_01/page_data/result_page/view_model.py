from dataclasses import dataclass


@dataclass
class ResultPageViewModel:
    page_title: str
    total_questions: int
    attempted_questions: int
    correct_answers: int
    wrong_answers: int
    unanswered_questions: int
    score_percentage: float