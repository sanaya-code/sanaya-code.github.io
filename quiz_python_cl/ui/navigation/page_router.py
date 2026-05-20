# quiz_app/ui/navigation/page_router.py

from ui.navigation.stacked_page_manager import StackedPageManager
from state.app_state import AppState


class PageRouter:
    """
    High-level navigation API used by controllers and event handlers.
    Keeps navigation logic out of widgets.
    """

    def __init__(self, page_manager: StackedPageManager, app_state: AppState):
        self._manager = page_manager
        self._state = app_state

    def go_to(self, route: str) -> None:
        self._state.current_page = route
        self._manager.show_page(route)

    def current(self) -> str:
        return self._manager.current_name()
