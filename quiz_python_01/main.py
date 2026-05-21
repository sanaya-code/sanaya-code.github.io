import sys
from pathlib import Path

from PyQt6.QtWidgets import QApplication

from composers.app_composer import AppComposer


def main() -> None:
    app = QApplication(sys.argv)

    qss_path = Path(__file__).parent / "resources" / "styles" / "ocean_blue_theme.qss"
    app.setStyleSheet(qss_path.read_text())

    composer = AppComposer()
    main_window = composer.create_app()

    main_window.show()
    sys.exit(app.exec())


if __name__ == "__main__":
    main()