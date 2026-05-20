# quiz_app/shared/enums/page_enums.py

from enum import Enum


class PageName(Enum):
    STUDENT_SELECTION       = "student_selection"
    ADD_NEW_STUDENT         = "add_new_student"
    QUESTION_BANK_SELECTION = "question_bank_selection"
    QUIZ_INFO               = "quiz_info"
    QUIZ                    = "quiz"
    RESULT                  = "result"
    REVIEW                  = "review"
    STATISTICS              = "statistics"
    SETTINGS                = "settings"
