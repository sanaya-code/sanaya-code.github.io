# quiz_app/ui/layouts/responsive_grid_layout.py

from PyQt6.QtWidgets import QWidget, QGridLayout
from PyQt6.QtCore import Qt


class ResponsiveGridLayout(QWidget):
    """
    Places child widgets in a grid with a fixed column count.
    Items are added left-to-right, top-to-bottom.
    """

    def __init__(self, columns: int = 3, h_spacing: int = 16,
                 v_spacing: int = 16, parent=None):
        super().__init__(parent)
        self._columns = columns
        self._items: list[QWidget] = []

        self._grid = QGridLayout(self)
        self._grid.setHorizontalSpacing(h_spacing)
        self._grid.setVerticalSpacing(v_spacing)
        self._grid.setContentsMargins(0, 0, 0, 0)
        self._grid.setAlignment(Qt.AlignmentFlag.AlignTop | Qt.AlignmentFlag.AlignLeft)

    def add_item(self, widget: QWidget) -> None:
        self._items.append(widget)
        index = len(self._items) - 1
        row = index // self._columns
        col = index % self._columns
        self._grid.addWidget(widget, row, col)

    def clear_items(self) -> None:
        for widget in self._items:
            self._grid.removeWidget(widget)
            widget.deleteLater()
        self._items.clear()

    def set_columns(self, columns: int) -> None:
        self._columns = columns
        items = self._items[:]
        self.clear_items()
        for widget in items:
            self.add_item(widget)
