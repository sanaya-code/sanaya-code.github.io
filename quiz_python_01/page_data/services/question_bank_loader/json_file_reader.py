import json
from pathlib import Path


class JsonFileReader:
    def read(self, file_path: str) -> dict:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"JSON file not found: {file_path}")

        if path.suffix.lower() != ".json":
            raise ValueError("Selected file must be a JSON file.")

        with path.open("r", encoding="utf-8") as file:
            return json.load(file)