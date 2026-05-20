# quiz_app/ui/components/common/section_title.py

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PyQt6.QtCore import Qt


class SectionTitle(QWidget):

    def __init__(self, title: str, subtitle: str = "", parent=None):
        super().__init__(parent)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(4)

        self._title = QLabel(title)
        self._title.setObjectName("SectionTitle")
        self._title.setAlignment(Qt.AlignmentFlag.AlignLeft)
        layout.addWidget(self._title)

        if subtitle:
            self._subtitle = QLabel(subtitle)
            self._subtitle.setObjectName("SubTitle")
            self._subtitle.setAlignment(Qt.AlignmentFlag.AlignLeft)
            layout.addWidget(self._subtitle)

    def set_title(self, text: str) -> None:
        self._title.setText(text)
