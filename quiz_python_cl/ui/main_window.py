# quiz_app/ui/main_window.py

from PyQt6.QtWidgets import QMainWindow, QWidget, QVBoxLayout, QStackedWidget
from ui.components.common.app_header import AppHeader
from config.app_config import AppConfig


class MainWindow(QMainWindow):
    """
    Root window. Owns the header and the QStackedWidget.
    Exposes `stack` so AppComposer can hand it to StackedPageManager.
    """

    def __init__(self, parent=None):
        super().__init__(parent)

        self.setWindowTitle(AppConfig.APP_NAME)
        self.setMinimumSize(AppConfig.WINDOW_MIN_WIDTH, AppConfig.WINDOW_MIN_HEIGHT)
        self.resize(AppConfig.WINDOW_DEFAULT_WIDTH, AppConfig.WINDOW_DEFAULT_HEIGHT)

        # Root widget
        root = QWidget()
        root_layout = QVBoxLayout(root)
        root_layout.setContentsMargins(0, 0, 0, 0)
        root_layout.setSpacing(0)

        # Header
        self._header = AppHeader(AppConfig.APP_NAME)
        root_layout.addWidget(self._header)

        # Page stack — exposed as public attribute
        self.stack = QStackedWidget()
        root_layout.addWidget(self.stack)

        self.setCentralWidget(root)

    def set_header_title(self, title: str) -> None:
        self._header.set_title(title)
