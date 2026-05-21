from app.event_handlers.event_handler_bundle import EventHandlerBundle
from app.event_handlers.pages.student_selection.select_student_handler import (
    SelectStudentHandler,
)
from app.state.app_state_controller import AppStateController
from page_data.question_bank_selection.render_data_builder import (
    QuestionBankSelectionRenderDataBuilder,
)
from ui.navigation.app_router_controller import AppRouterController
from ui.ui_page_bundle import UIPageBundle


class EventHandlerComposer:
    def create_event_handlers(
        self,
        app_state_controller: AppStateController,
        ui_pages: UIPageBundle,
        router_controller: AppRouterController,
        question_bank_selection_data_builder: QuestionBankSelectionRenderDataBuilder,
    ) -> EventHandlerBundle:
        select_student_handler = SelectStudentHandler(
            app_state_controller=app_state_controller,
            ui_pages=ui_pages,
            router_controller=router_controller,
            question_bank_selection_data_builder=question_bank_selection_data_builder,
        )

        return EventHandlerBundle(
            select_student_handler=select_student_handler,
        )