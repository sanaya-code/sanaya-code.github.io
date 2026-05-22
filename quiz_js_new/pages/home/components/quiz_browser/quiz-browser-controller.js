class QuizBrowserController {
    constructor(component, dependencies) {
        this.component = component;
        this.environment = dependencies.environment;
        this.remoteLoader = dependencies.remoteLoader;
        this.storage = dependencies.storage;
        this.config = dependencies.config;
    }

    async init() {
        this.bindEvents();

        if (this.environment.isLocal()) {
            this.component.showMessage(this.config.messages.localMode);
            return;
        }

        await this.loadGradeSubjects();
    }

    bindEvents() {
        this.component.addEventListener("gradeSelected", () => {
            this.component.clearTopics();
        });

        this.component.addEventListener("subjectSelected", async (event) => {
            await this.handleSubjectSelected(event.detail);
        });

        this.component.addEventListener("topicSelected", async (event) => {
            await this.handleTopicSelected(event.detail);
        });
    }

    async loadGradeSubjects() {
        try {
            const infoData = await this.remoteLoader.loadJson(this.config.remote.infoSubjectsUrl);
            this.component.renderGradeSubjects(infoData);
        } catch (error) {
            console.warn("Could not load grade subjects:", error.message);
        }
    }

    async handleSubjectSelected(detail) {
        const { url, subject } = detail;

        try {
            const jsonFile = await this.remoteLoader.loadJson(url);

            if (!jsonFile || !jsonFile.subjects) {
                console.error("Invalid JSON structure or missing subjects key.");
                this.component.clearTopics();
                return;
            }

            const subjectData = jsonFile.subjects[subject];

            if (!subjectData) {
                console.error(`Subject "${subject}" not found.`);
                this.component.clearTopics();
                return;
            }

            this.component.renderTopics(subjectData);
        } catch (error) {
            console.warn("Could not load subject data:", error.message);
            this.component.clearTopics();
        }
    }

    async handleTopicSelected(topicData) {
        try {
            const quizData = await this.remoteLoader.loadJson(topicData.link);

            this.storage.saveCustomQuizData(quizData);
            window.location.href = this.config.navigation.quizPageUrl;
        } catch (error) {
            alert(`Failed to load quiz: ${error.message}`);
        }
    }
}