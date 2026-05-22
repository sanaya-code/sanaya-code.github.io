class HomeQuizStorage {
    constructor(storageConfig) {
        this.customQuizDataKey = storageConfig.customQuizDataKey;
    }

    saveCustomQuizData(quizData) {
        sessionStorage.setItem(this.customQuizDataKey, JSON.stringify(quizData));
    }
}