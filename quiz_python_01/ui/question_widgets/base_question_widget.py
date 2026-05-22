from PyQt6.QtWidgets import QWidget


class BaseQuestionWidget(QWidget):
    def get_user_answer(self):
        raise NotImplementedError