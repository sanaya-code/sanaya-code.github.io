from dataclasses import dataclass


@dataclass
class QuestionBankCardViewModel:
    question_bank_id: str
    title: str
    subject: str
    grade: str
    total_questions: int


@dataclass
class QuestionBankSelectionViewModel:
    page_title: str
    subtitle: str
    question_banks: list[QuestionBankCardViewModel]