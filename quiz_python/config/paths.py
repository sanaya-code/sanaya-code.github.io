# config/paths.py


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

STORAGE_DIR = BASE_DIR / "storage"
STUDENTS_DIR = STORAGE_DIR / "students"
STUDENTS_FILE_PATH = STUDENTS_DIR / "students.json"

RESOURCES_DIR = BASE_DIR / "resources"
STYLES_DIR = RESOURCES_DIR / "styles"
MAIN_QSS_PATH = STYLES_DIR / "main_theme.qss"