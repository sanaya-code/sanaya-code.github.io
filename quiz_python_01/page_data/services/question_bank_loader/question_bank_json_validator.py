class QuestionBankJsonValidator:
    def validate(self, data: dict) -> None:
        if not isinstance(data, dict):
            raise ValueError("Question bank JSON must be an object.")

        if "questions" not in data:
            raise ValueError("Question bank JSON must contain a 'questions' list.")

        if not isinstance(data["questions"], list):
            raise ValueError("'questions' must be a list.")

        if not data["questions"]:
            raise ValueError("Question bank must contain at least one question.")

        for index, question in enumerate(data["questions"]):
            self._validate_question(question, index)

    def _validate_question(self, question: dict, index: int) -> None:
        required_fields = [
            "question_id",
            "type",
            "question_text",
            "options",
            "correct_option_id",
        ]

        for field in required_fields:
            if field not in question:
                raise ValueError(f"Question {index + 1} missing field: {field}")

        if question["type"] != "mcq":
            raise ValueError(f"Only MCQ questions are supported now. Found: {question['type']}")

        if not isinstance(question["options"], list):
            raise ValueError(f"Question {index + 1}: options must be a list.")

        if not question["options"]:
            raise ValueError(f"Question {index + 1}: options cannot be empty.")

        option_ids = []

        for option in question["options"]:
            if "option_id" not in option or "text" not in option:
                raise ValueError(
                    f"Question {index + 1}: each option needs option_id and text."
                )

            option_ids.append(option["option_id"])

        if question["correct_option_id"] not in option_ids:
            raise ValueError(
                f"Question {index + 1}: correct_option_id must match one option_id."
            )