# quiz_app/logging/app_logger.py

import logging
from app_logging.logger_factory import create_logger


def get_logger(name: str) -> logging.Logger:
    return create_logger(name)
