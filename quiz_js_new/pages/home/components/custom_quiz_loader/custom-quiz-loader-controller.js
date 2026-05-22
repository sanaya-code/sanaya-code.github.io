class CustomQuizLoaderController {
    constructor(component, dependencies) {
        this.component = component;
        this.fileReader = dependencies.fileReader;
        this.storage = dependencies.storage;
        this.quizPageUrl = dependencies.quizPageUrl;
        this.messages = dependencies.messages;
    }

    init() {
        const button = this.component.getLoadButton();

        if (!button) {
            return;
        }

        button.addEventListener("click", async () => {
            await this.handleLoadQuiz();
        });
    }

    async handleLoadQuiz() {
        const fileInput = this.component.getFileInput();

        if (!fileInput || fileInput.files.length === 0) {
            this.component.showAlert(this.messages.selectJsonFile);
            return;
        }

        try {
            const file = fileInput.files[0];
            const quizData = await this.fileReader.readJsonFile(file);

            this.storage.saveCustomQuizData(quizData);
            window.location.href = this.quizPageUrl;
        } catch (error) {
            this.component.showAlert(`${this.messages.invalidJson}: ${error.message}`);
        }
    }
}