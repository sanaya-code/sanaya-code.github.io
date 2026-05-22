const HomePageConfig = {
    title: "Quiz Application",

    selectors: {
        quizBrowser: "quiz-browser",
        customQuizLoader: "custom-quiz-loader"
    },

    storage: {
        customQuizDataKey: "customQuizData"
    },

    navigation: {
        quizPageUrl: "quiz.html?source=custom"
    },

    remote: {
        infoSubjectsUrl: "https://sanaya-code.github.io/quiz/data/info/info_subjects.json",
        cacheName: "sami-quiz-cache"
    },

    messages: {
        selectJsonFile: "Please select a JSON file first",
        invalidJson: "Error parsing JSON file",
        fileReadError: "Error reading file",
        localMode: "Local mode: remote subject loading skipped."
    }
};