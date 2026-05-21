# Quiz App (PyQt6)

A modular JSON-driven quiz application built using Python and PyQt6.

---

# Features

- Student profile selection
- Add new student
- JSON-based question banks
- Multiple question types
- SVG and image support
- Per-question statistics
- Autosave quiz sessions
- Review answers
- Partial scoring support

---

# Project Structure

```text
quiz_app/
├── main.py
├── ui/
├── models/
├── repositories/
├── services/
├── state/
├── storage/
├── resources/
└── ...
```

---

# Requirements

- Python 3.11+
- PyQt6

---

# Installation

## 1. Create virtual environment

### Linux/macOS

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### Windows

```powershell
python -m venv .venv
.venv\Scripts\activate
```

---

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

---

# Run Application

From project root folder:

```bash
python main.py
```

---

# Current Progress

Implemented:

- Main window
- Theme/QSS
- Student selection screen
- Student cards
- JSON student repository
- Student loading service

---

# Student Data File

Location:

```text
storage/students/students.json
```

Example:

```json
{
  "students": [
    {
      "student_id": "stu_001",
      "name": "Aarav Sharma",
      "grade": "Grade 8",
      "quizzes_completed": 12
    }
  ]
}
```

---

# Development Order

01. Shared app foundation
02. Student models and repositories
03. Student selection screen
04. Add new student screen
05. Question bank selection
06. Quiz page shell
07. Question widgets
08. Scoring engine
09. Statistics
10. Remaining question types

---

# Notes

- Question banks are read-only JSON files.
- Each student has separate statistics.
- Application uses modular PyQt6 architecture.
- UI components are reusable and isolated.