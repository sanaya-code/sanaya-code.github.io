from page_data.result_page.view_model import ResultPageViewModel


class ResultPageRenderDataBuilder:
    def build(
        self,
        total_questions: int,
        attempted_questions: int,
        correct_answers: int,
        wrong_answers: int,
        unanswered_questions: int,
    ) -> ResultPageViewModel:
        percentage = 0.0

        if total_questions > 0:
            percentage = (correct_answers / total_questions) * 100

        return ResultPageViewModel(
            page_title="Quiz Result",
            total_questions=total_questions,
            attempted_questions=attempted_questions,
            correct_answers=correct_answers,
            wrong_answers=wrong_answers,
            unanswered_questions=unanswered_questions,
            score_percentage=percentage,
        )