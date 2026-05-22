from dataclasses import dataclass


@dataclass
class ResultPageViewModel:
    page_title: str
    total_questions: int
    attempted_questions: int
    correct_answers: int
    score_percentage: float