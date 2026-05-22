from page_data.services.question_bank_loader.question_bank_loader_service import (
    QuestionBankLoaderService,
)


class QuizDataLoader:
    def __init__(self):
        self.question_bank_loader_service = QuestionBankLoaderService()

    def load_questions_from_json(self, file_path: str) -> list[dict]:
        return self.question_bank_loader_service.load(file_path)