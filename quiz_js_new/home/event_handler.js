class HomeEventHandler {
    constructor(remoteLoader) {
        this._remoteLoader = remoteLoader;
    }

    bindAll() {
        document.addEventListener('quizFileSelected', (e) => this._handleQuizFileSelected(e));
        document.addEventListener('gradeSelected',    (e) => this._handleGradeSelected(e));
        document.addEventListener('subjectSelected',  (e) => this._handleSubjectSelected(e));
        document.addEventListener('topicSelected',    (e) => this._handleTopicSelected(e));
    }

    _handleQuizFileSelected(e) {
        FileReaderUtil.readJson(
            e.detail.file,
            (quizData) => SessionStorageService.saveAndRedirect(quizData),
            (err) => alert(err.message)
        );
    }

    _handleGradeSelected(e) {
        console.log('Grade selected:', e.detail);
        const topicSelector = document.querySelector('topic-selector');
        if (topicSelector) {
            topicSelector.setAttribute('config', JSON.stringify([]));
        }
    }

    async _handleSubjectSelected(e) {
        const { url, subject, grade } = e.detail;
        console.log(`Subject selected: ${subject} (Grade ${grade}), URL: ${url}`);
        try {
            const jsonFile = await this._remoteLoader.fetch(url);
            const subjectData = jsonFile?.subjects?.[subject];

            const container = document.querySelector('.container');
            let topicSelector = container?.querySelector('topic-selector');

            if (subjectData) {
                if (topicSelector) {
                    topicSelector.setAttribute('config', JSON.stringify(subjectData));
                } else {
                    topicSelector = document.createElement('topic-selector');
                    topicSelector.setAttribute('config', JSON.stringify(subjectData));
                    const target = container?.querySelector('#grade-subjects-container') || container;
                    target?.appendChild(topicSelector);
                }
            } else {
                console.error(`Subject "${subject}" not found in data.`);
                if (topicSelector) topicSelector.setAttribute('config', JSON.stringify([]));
            }
        } catch (err) {
            alert(`Failed to load subject data: ${err.message}`);
        }
    }

    async _handleTopicSelected(e) {
        const url = e.detail.link;
        console.log('Topic selected, URL:', url);
        try {
            const quizData = await this._remoteLoader.fetch(url);
            if (quizData) {
                SessionStorageService.saveAndRedirect(quizData);
            } else {
                console.error('Quiz JSON not found');
            }
        } catch (err) {
            alert(`Failed to load quiz: ${err.message}`);
        }
    }
}