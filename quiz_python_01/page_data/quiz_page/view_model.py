from dataclasses import dataclass


@dataclass
class OptionViewModel:
    option_id: str
    text: str


@dataclass
class QuestionViewModel:
    question_id: str
    question_type: str
    question_text: str
    options: list[OptionViewModel]


@dataclass
class QuizPageViewModel:
    page_title: str
    current_question_number: int
    total_questions: int
    question: QuestionViewModel