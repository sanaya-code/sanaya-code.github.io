from app.event_handlers.event_handler_bundle import EventHandlerBundle
from app.event_handlers.student_selection.select_student_handler import (
    SelectStudentHandler,
)
from app.state.app_state_controller import AppStateController
from ui.ui_page_bundle import UIPageBundle


class EventHandlerComposer:
    def create_event_handlers(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
    ) -> EventHandlerBundle:
        select_student_handler = SelectStudentHandler(
            app_state_controller=app_state_controller,
            ui_pages=ui_pages,
        )

        return EventHandlerBundle(
            select_student_handler=select_student_handler,
        )