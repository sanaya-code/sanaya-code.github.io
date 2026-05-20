# quiz_app/config/app_config.py

import logging


class AppConfig:
    APP_NAME = "Quiz App"
    APP_VERSION = "1.0.0"
    WINDOW_MIN_WIDTH = 700
    WINDOW_MIN_HEIGHT = 550
    WINDOW_DEFAULT_WIDTH = 700
    WINDOW_DEFAULT_HEIGHT = 550
    LOG_LEVEL = logging.DEBUG
    LOG_DIR = "storage/logs"
