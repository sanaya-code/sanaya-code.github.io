# quiz_app/ui/themes/theme_manager.py

import os
from PyQt6.QtWidgets import QApplication
from config.paths import STYLES_DIR


class ThemeManager:

    _BASE_THEME = os.path.join(
        os.path.dirname(__file__), "main_theme.qss"
    )

    @classmethod
    def apply_base_theme(cls, app: QApplication) -> None:
        qss = cls._load(cls._BASE_THEME)
        app.setStyleSheet(qss)

    @classmethod
    def apply_page_theme(cls, widget, page_qss_name: str) -> None:
        path = os.path.join(STYLES_DIR, page_qss_name)
        if os.path.exists(path):
            qss = cls._load(path)
            current = widget.styleSheet()
            widget.setStyleSheet(current + "\n" + qss)

    @staticmethod
    def _load(path: str) -> str:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
