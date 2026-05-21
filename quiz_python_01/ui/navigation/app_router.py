from PyQt6.QtWidgets import QMainWindow, QStackedWidget


class AppRouter:
    def __init__(self, main_window: QMainWindow):
        self.main_window = main_window
        self.stack = QStackedWidget()
        self.pages: dict[str, object] = {}

        self.main_window.setCentralWidget(self.stack)

    def register_page(self, page_name: str, page_widget) -> None:
        self.pages[page_name] = page_widget
        self.stack.addWidget(page_widget)

    def show_page(self, page_name: str) -> None:
        page = self.pages.get(page_name)

        if page is None:
            raise ValueError(f"Page not registered: {page_name}")

        self.stack.setCurrentWidget(page)