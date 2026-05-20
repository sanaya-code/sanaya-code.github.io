# quiz_app/utils/qt_utils.py

from PyQt6.QtWidgets import QWidget, QLayout


def clear_layout(layout: QLayout) -> None:
    while layout.count():
        item = layout.takeAt(0)
        widget = item.widget()
        if widget:
            widget.deleteLater()


def set_object_name(widget: QWidget, name: str) -> QWidget:
    widget.setObjectName(name)
    return widget
