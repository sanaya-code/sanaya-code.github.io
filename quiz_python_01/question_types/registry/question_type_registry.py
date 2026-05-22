from question_types.mcq.review_builder import MCQReviewBuilder
from question_types.mcq.scorer import MCQScorer


QUESTION_TYPE_REGISTRY = {
    "mcq": {
        "scorer": MCQScorer(),
        "review_builder": MCQReviewBuilder(),
    }
}


class QuestionTypeRegistry:
    def get_scorer(self, question_type: str):
        entry = QUESTION_TYPE_REGISTRY.get(question_type)

        if entry is None:
            raise ValueError(f"Unsupported question type: {question_type}")

        return entry["scorer"]

    def get_review_builder(self, question_type: str):
        entry = QUESTION_TYPE_REGISTRY.get(question_type)

        if entry is None:
            raise ValueError(f"Unsupported question type: {question_type}")

        return entry["review_builder"]