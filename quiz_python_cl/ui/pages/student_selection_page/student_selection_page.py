# quiz_app/ui/pages/student_selection_page/student_selection_page.py

from PyQt6.QtWidgets import QScrollArea, QWidget, QVBoxLayout
from PyQt6.QtCore import Qt
from ui.layouts.page_layout import PageLayout
from ui.components.common.section_title import SectionTitle
from ui.components.common.empty_state_widget import EmptyStateWidget
from ui.components.student_selection_page.student_grid import StudentGrid
from ui.pages.student_selection_page.student_selection_page_signals import StudentSelectionPageSignals
from ui.pages.student_selection_page.student_selection_page_state import StudentSelectionPageState
from ui.pages.student_selection_page.student_selection_page_controller import StudentSelectionPageController


class StudentSelectionPage(QScrollArea):

    def __init__(
        self,
        state: StudentSelectionPageState,
        signals: StudentSelectionPageSignals,
        controller: StudentSelectionPageController,
        parent=None
    ):
        super().__init__(parent)
        self._state      = state
        self._signals    = signals
        self._controller = controller

        self.setWidgetResizable(True)
        self.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)

        # Inner container
        self._inner = PageLayout()
        self.setWidget(self._inner)

        # Header
        self._title = SectionTitle(
            "Select Your Profile",
            "Tap your name to start a quiz"
        )

        # Grid
        self._grid = StudentGrid()
        self._grid.student_selected.connect(signals.student_selected)
        self._grid.add_student_requested.connect(signals.add_student_clicked)

        # Empty state
        self._empty = EmptyStateWidget("No students yet. Add one to get started.")
        self._empty.setVisible(False)

        self._inner.add_widget(self._title)
        self._inner.add_widget(self._grid)
        self._inner.add_widget(self._empty, stretch=1)
        self._inner.add_stretch()

    def refresh(self) -> None:
        """Called each time this page becomes visible."""
        self._controller.load()
        summaries = self._state.state.summaries

        if summaries:
            self._grid.setVisible(True)
            self._empty.setVisible(False)
            self._grid.populate(summaries)
        else:
            self._grid.setVisible(False)
            self._empty.setVisible(True)
