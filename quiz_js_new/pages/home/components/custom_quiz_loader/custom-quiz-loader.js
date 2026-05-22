class CustomQuizLoader extends HTMLElement {
    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = `
            <div class="custom-quiz">
                <h2>Or Load Your Own Quiz</h2>
                <input type="file" id="quizFile" accept=".json">
                <button id="loadQuizBtn">Start Custom Quiz</button>
            </div>
        `;
    }

    getFileInput() {
        return this.querySelector("#quizFile");
    }

    getLoadButton() {
        return this.querySelector("#loadQuizBtn");
    }

    showAlert(message) {
        alert(message);
    }
}

customElements.define("custom-quiz-loader", CustomQuizLoader);