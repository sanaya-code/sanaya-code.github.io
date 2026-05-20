# quiz_app/ui/layouts/app_layout.py

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QStackedWidget


class AppLayout(QWidget):
    """
    Root layout: vertical stack of header + page area.
    Header slot is populated by MainWindow.
    Page area is the QStackedWidget.
    """

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setObjectName("AppRoot")

        self._root_layout = QVBoxLayout(self)
        self._root_layout.setContentsMargins(0, 0, 0, 0)
        self._root_layout.setSpacing(0)

        self.stack = QStackedWidget()
        self._root_layout.addWidget(self.stack)

    def set_header(self, header: QWidget) -> None:
        self._root_layout.insertWidget(0, header)
