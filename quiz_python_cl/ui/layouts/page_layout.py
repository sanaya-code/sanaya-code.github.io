# quiz_app/ui/layouts/page_layout.py

from PyQt6.QtWidgets import QWidget, QVBoxLayout
from PyQt6.QtCore import Qt


class PageLayout(QWidget):
    """
    Standard page wrapper: full-size widget with
    vertical layout, consistent padding, scrollable.
    Each page inherits or composes this.
    """

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("PageContainer")

        self._layout = QVBoxLayout(self)
        self._layout.setContentsMargins(32, 24, 32, 24)
        self._layout.setSpacing(16)
        self._layout.setAlignment(Qt.AlignmentFlag.AlignTop)

    def add_widget(self, widget: QWidget, stretch: int = 0) -> None:
        self._layout.addWidget(widget, stretch)

    def add_stretch(self) -> None:
        self._layout.addStretch()

    def page_layout(self) -> QVBoxLayout:
        return self._layout
