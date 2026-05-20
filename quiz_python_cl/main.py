# quiz_app/main.py

import sys
from PyQt6.QtWidgets import QApplication
from composers.app_composer import AppComposer
from app_logging.app_logger import get_logger

logger = get_logger(__name__)


def main():
    logger.info("Application starting")
    app = QApplication(sys.argv)

    composer = AppComposer()
    window = composer.compose()
    window.show()

    logger.info("Main window shown")
    exit_code = app.exec()
    logger.info(f"Application exiting with code {exit_code}")
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
