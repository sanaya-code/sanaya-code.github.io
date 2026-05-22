class QuizBrowser extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div id="grade-subjects-container"></div>
            <div id="topic-selector-container"></div>
        `;
    }

    renderGradeSubjects(config) {
        const container = this.querySelector("#grade-subjects-container");
        container.innerHTML = "";

        const gradeSubjects = document.createElement("grade-subjects");
        gradeSubjects.setAttribute("config", JSON.stringify(config));

        container.appendChild(gradeSubjects);
    }

    renderTopics(topics) {
        const container = this.querySelector("#topic-selector-container");
        container.innerHTML = "";

        const topicSelector = document.createElement("topic-selector");
        topicSelector.setAttribute("config", JSON.stringify(topics));

        container.appendChild(topicSelector);
    }

    clearTopics() {
        const container = this.querySelector("#topic-selector-container");
        container.innerHTML = "";
    }

    showMessage(message) {
        const container = this.querySelector("#grade-subjects-container");
        container.innerHTML = `<p>${message}</p>`;
    }
}

customElements.define("quiz-browser", QuizBrowser);