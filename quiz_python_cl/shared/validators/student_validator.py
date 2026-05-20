# quiz_app/shared/validators/student_validator.py

import re


MIN_NAME_LENGTH = 2
MAX_NAME_LENGTH = 50
VALID_NAME_PATTERN = re.compile(r"^[A-Za-z0-9 '_-]+$")


def validate_student_name(name: str) -> tuple[bool, str]:
    """
    Returns (is_valid, error_message).
    error_message is empty string if valid.
    """
    name = name.strip()

    if not name:
        return False, "Name cannot be empty."

    if len(name) < MIN_NAME_LENGTH:
        return False, f"Name must be at least {MIN_NAME_LENGTH} characters."

    if len(name) > MAX_NAME_LENGTH:
        return False, f"Name must be at most {MAX_NAME_LENGTH} characters."

    if not VALID_NAME_PATTERN.match(name):
        return False, "Name can only contain letters, numbers, spaces, hyphens, or apostrophes."

    return True, ""
