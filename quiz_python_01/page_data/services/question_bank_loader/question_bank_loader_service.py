from page_data.services.question_bank_loader.json_file_reader import JsonFileReader
from page_data.services.question_bank_loader.question_bank_json_validator import (
    QuestionBankJsonValidator,
)
from page_data.services.question_bank_loader.question_bank_parser import (
    QuestionBankParser,
)


class QuestionBankLoaderService:
    def __init__(self):
        self.reader = JsonFileReader()
        self.validator = QuestionBankJsonValidator()
        self.parser = QuestionBankParser()

    def load(self, file_path: str) -> list[dict]:
        data = self.reader.read(file_path)
        self.validator.validate(data)
        return self.parser.parse(data)