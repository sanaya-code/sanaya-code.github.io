# quiz_app/ui/navigation/stacked_page_manager.py

from PyQt6.QtWidgets import QStackedWidget, QWidget


class StackedPageManager:
    """
    Wraps QStackedWidget. Maintains a name→widget map
    so pages can be shown by route name string.
    """

    def __init__(self, stack: QStackedWidget):
        self._stack = stack
        self._pages: dict[str, QWidget] = {}

    def register(self, name: str, widget: QWidget) -> None:
        self._pages[name] = widget
        self._stack.addWidget(widget)

    def show_page(self, name: str) -> None:
        widget = self._pages.get(name)
        if widget:
            self._stack.setCurrentWidget(widget)

    def current_name(self) -> str:
        current = self._stack.currentWidget()
        for name, widget in self._pages.items():
            if widget is current:
                return name
        return ""

    def get_page(self, name: str) -> QWidget | None:
        return self._pages.get(name)
