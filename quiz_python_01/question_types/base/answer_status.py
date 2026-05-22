from enum import Enum


class AnswerStatus(str, Enum):
    CORRECT = "correct"
    WRONG = "wrong"
    UNANSWERED = "unanswered"