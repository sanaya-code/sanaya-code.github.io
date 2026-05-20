# services/student_profile/load_students_service.py

class LoadStudentsService:
    def __init__(self, student_repository):
        self.student_repository = student_repository

    def execute(self):
        return self.student_repository.get_all_students()