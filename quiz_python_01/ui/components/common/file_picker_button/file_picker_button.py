from PyQt6.QtCore import pyqtSignal
from PyQt6.QtWidgets import QFileDialog, QPushButton, QWidget


class FilePickerButton(QPushButton):
    file_selected = pyqtSignal(str)

    def __init__(self, text: str = "Load Question Bank JSON", parent: QWidget | None = None):
        super().__init__(text, parent)

        self.setObjectName("primaryButton")
        self.clicked.connect(self._open_file_picker)

    def _open_file_picker(self) -> None:
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Select Question Bank JSON",
            "",
            "JSON Files (*.json);;All Files (*)",
        )

        if file_path:
            self.file_selected.emit(file_path)