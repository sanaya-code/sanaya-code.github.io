# quiz_app/ui/components/common/empty_state_widget.py

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PyQt6.QtCore import Qt


class EmptyStateWidget(QWidget):

    def __init__(self, message: str = "Nothing here yet.", parent=None):
        super().__init__(parent)

        self.setMinimumHeight(200)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(24, 48, 24, 48)
        layout.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self._label = QLabel(message)
        self._label.setObjectName("SubTitle")
        self._label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self._label.setWordWrap(True)
        self._label.setStyleSheet(
            "font-size: 15px; color: #6B7280; padding: 12px 0px;"
        )

        layout.addWidget(self._label)

    def set_message(self, message: str) -> None:
        self._label.setText(message)
