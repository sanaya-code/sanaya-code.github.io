from app.state.app_state_controller import AppStateController
from ui.ui_page_bundle import UIPageBundle


class SelectStudentHandler:
    def __init__(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
    ):
        self.app_state_controller = app_state_controller
        self.ui_pages = ui_pages

    def handle(self, student_id: str) -> None:
        self.app_state_controller.set_selected_student_id(student_id)

        selected_id = self.app_state_controller.get_selected_student_id()
        print(f"Selected student id: {selected_id}")