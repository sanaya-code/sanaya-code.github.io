# quiz_app/config/paths.py

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STORAGE_DIR         = os.path.join(BASE_DIR, "storage")
STUDENTS_DIR        = os.path.join(STORAGE_DIR, "students")
QUESTION_BANKS_DIR  = os.path.join(STORAGE_DIR, "question_banks")
QUIZ_SESSIONS_DIR   = os.path.join(STORAGE_DIR, "quiz_sessions")
SETTINGS_DIR        = os.path.join(STORAGE_DIR, "settings")
CACHE_DIR           = os.path.join(STORAGE_DIR, "cache")
LOG_DIR             = os.path.join(STORAGE_DIR, "logs")

RESOURCES_DIR       = os.path.join(BASE_DIR, "resources")
ICONS_DIR           = os.path.join(RESOURCES_DIR, "icons")
IMAGES_DIR          = os.path.join(RESOURCES_DIR, "images")
FONTS_DIR           = os.path.join(RESOURCES_DIR, "fonts")
STYLES_DIR          = os.path.join(RESOURCES_DIR, "styles")
SVG_DIR             = os.path.join(RESOURCES_DIR, "svg")

STUDENTS_JSON       = os.path.join(STUDENTS_DIR, "students.json")
