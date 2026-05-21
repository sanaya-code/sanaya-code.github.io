from page_data.question_bank_selection.hardcoded_question_banks import (
    HARDCODED_QUESTION_BANKS,
)
from page_data.question_bank_selection.view_model import (
    QuestionBankCardViewModel,
    QuestionBankSelectionViewModel,
)


class QuestionBankSelectionRenderDataBuilder:
    def build(self) -> QuestionBankSelectionViewModel:
        question_banks = [
            QuestionBankCardViewModel(
                question_bank_id=item["question_bank_id"],
                title=item["title"],
                subject=item["subject"],
                grade=item["grade"],
                total_questions=item["total_questions"],
            )
            for item in HARDCODED_QUESTION_BANKS
        ]

        return QuestionBankSelectionViewModel(
            page_title="Select Question Bank",
            subtitle="Choose a quiz to continue",
            question_banks=question_banks,
        )