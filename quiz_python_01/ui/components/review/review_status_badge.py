from PyQt6.QtWidgets import QLabel


class ReviewStatusBadge(QLabel):
    def __init__(self, status: str):
        super().__init__(status.title())

        self.setObjectName(f"reviewStatusBadge_{status}")