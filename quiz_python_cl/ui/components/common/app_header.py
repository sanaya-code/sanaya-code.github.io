# quiz_app/ui/components/common/app_header.py

from PyQt6.QtWidgets import QWidget, QHBoxLayout, QLabel
from PyQt6.QtCore import Qt


class AppHeader(QWidget):

    def __init__(self, title: str = "Quiz App", parent=None):
        super().__init__(parent)
        self.setObjectName("AppHeader")
        self.setFixedHeight(56)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(24, 0, 24, 0)

        self._title_label = QLabel(title)
        self._title_label.setObjectName("AppTitle")
        self._title_label.setAlignment(Qt.AlignmentFlag.AlignVCenter)

        layout.addWidget(self._title_label)
        layout.addStretch()

    def set_title(self, title: str) -> None:
        self._title_label.setText(title)
