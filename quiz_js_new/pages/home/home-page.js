class HomePage extends HTMLElement {
    constructor() {
        super();
        this._controller = null;
    }

    connectedCallback() {
        this.render();
        this._controller = new HomePageController(this, HomePageConfig);
        this._controller.init();
    }

    render() {
        this.innerHTML = `
            <div class="container">
                <h1>${HomePageConfig.title}</h1>

                <quiz-browser></quiz-browser>

                <custom-quiz-loader></custom-quiz-loader>
            </div>
        `;
    }

    getQuizBrowserElement() {
        return this.querySelector("quiz-browser");
    }

    getCustomQuizLoaderElement() {
        return this.querySelector("custom-quiz-loader");
    }
}

customElements.define("home-page", HomePage);